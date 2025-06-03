const express = require('express');
const router = express.Router();
const Medicina = require('../models/Medicina');
const Evento = require('../models/Evento');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/medicinas');
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

// Obtener todas las medicinas
router.get('/', async (req, res) => {
  const medicinas = await Medicina.find();
  res.json(medicinas);
});

// Agregar nueva medicina
router.post('/', async (req, res) => {
  try {
    // Forzar fechas a tipo Date si existen
    if (req.body.fechaIngreso) req.body.fechaIngreso = new Date(req.body.fechaIngreso);
    if (req.body.fechaVencimiento) req.body.fechaVencimiento = new Date(req.body.fechaVencimiento);

    const medicina = new Medicina(req.body);
    if (req.body.imagenUrl) medicina.imagenUrl = req.body.imagenUrl;
    await medicina.save();

    // Evento de ingreso de medicina (fechaIngreso)
    if (medicina.fechaIngreso instanceof Date && !isNaN(medicina.fechaIngreso)) {
      const eventoIngreso = new Evento({
        tipo: 'Ingreso de medicina',
        descripcion: `Ingreso de medicina: ${medicina.nombre} (${medicina.tipo})`,
        fecha: medicina.fechaIngreso,
        medicina: medicina._id,
      });
      await eventoIngreso.save();
    }

    // Evento de vencimiento de medicina (fechaVencimiento)
    if (medicina.fechaVencimiento instanceof Date && !isNaN(medicina.fechaVencimiento)) {
      const eventoVencimiento = new Evento({
        tipo: 'Vencimiento de medicina',
        descripcion: `Vencimiento de medicina: ${medicina.nombre} (${medicina.tipo})`,
        fecha: medicina.fechaVencimiento,
        medicina: medicina._id,
      });
      await eventoVencimiento.save();
    }

    res.status(201).json(medicina);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Subida de imagen de medicina
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  const url = `/uploads/medicinas/${req.file.filename}`;
  res.json({ url });
});

// Eliminar medicina y su evento asociado
router.delete('/:id', async (req, res) => {
  try {
    const medicina = await Medicina.findByIdAndDelete(req.params.id);
    if (medicina) {
      // Eliminar evento asociado a esta medicina
      await Evento.deleteMany({ medicina: req.params.id });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
