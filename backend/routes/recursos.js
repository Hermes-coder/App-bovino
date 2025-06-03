const express = require('express');
const router = express.Router();
const Recurso = require('../models/Recurso');
const Evento = require('../models/Evento');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/recursos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Obtener todos los recursos
router.get('/', async (req, res) => {
  const recursos = await Recurso.find();
  res.json(recursos);
});

// Agregar nuevo recurso
router.post('/', async (req, res) => {
  try {
    // Forzar fechas a tipo Date si existen
    if (req.body.fechaAdquisicion) req.body.fechaAdquisicion = new Date(req.body.fechaAdquisicion);
    if (req.body.fechaVencimiento) req.body.fechaVencimiento = new Date(req.body.fechaVencimiento);
    if (req.body.ultimaRevision) req.body.ultimaRevision = new Date(req.body.ultimaRevision);

    const recurso = new Recurso(req.body);
    if (req.body.imagenUrl) recurso.imagenUrl = req.body.imagenUrl;
    await recurso.save();

    // Evento de ingreso de recurso
    if (recurso.fechaAdquisicion instanceof Date && !isNaN(recurso.fechaAdquisicion)) {
      const eventoIngreso = new Evento({
        tipo: 'Ingreso de recurso',
        descripcion: `Ingreso de recurso: ${recurso.nombre} (${recurso.tipo})`,
        fecha: recurso.fechaAdquisicion,
        herramienta: recurso._id,
      });
      await eventoIngreso.save();
    }
    // Evento de última revisión
    if (recurso.ultimaRevision instanceof Date && !isNaN(recurso.ultimaRevision)) {
      const eventoRevision = new Evento({
        tipo: 'Revisión de recurso',
        descripcion: `Última revisión de recurso: ${recurso.nombre} (${recurso.tipo})`,
        fecha: recurso.ultimaRevision,
        herramienta: recurso._id,
      });
      await eventoRevision.save();
    }

    res.status(201).json(recurso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Subida de imagen de recurso
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  const url = `/uploads/recursos/${req.file.filename}`;
  res.json({ url });
});

// Eliminar recurso y su evento asociado
router.delete('/:id', async (req, res) => {
  try {
    const recurso = await Recurso.findByIdAndDelete(req.params.id);
    if (recurso) {
      // Eliminar evento asociado a este recurso
      await Evento.deleteMany({ herramienta: req.params.id });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
