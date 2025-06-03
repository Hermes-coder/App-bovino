const express = require('express');
const router = express.Router();
const Bovino = require('../models/Bovino');
const Evento = require('../models/Evento');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/bovinos');
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

// Obtener todos los bovinos
router.get('/', async (req, res) => {
  const bovinos = await Bovino.find().populate('eventos');
  res.json(bovinos);
});

// Agregar nuevo bovino
router.post('/', async (req, res) => {
  try {
    console.log('Datos recibidos para nuevo bovino:', req.body);
    const bovino = new Bovino(req.body);
    await bovino.save();

    // Crear eventos automáticos de nacimiento e ingreso si hay fechas válidas
    const eventosCreados = [];
    if (bovino.fechaNacimiento && bovino.fechaNacimiento !== '' && !isNaN(new Date(bovino.fechaNacimiento))) {
      const eventoNacimiento = new Evento({
        tipo: 'Nacimiento',
        descripcion: `Nacimiento de ${bovino.nombre || 'bovino'} (${bovino.raza || ''})`,
        fecha: bovino.fechaNacimiento,
        bovino: bovino._id
      });
      await eventoNacimiento.save();
      eventosCreados.push(eventoNacimiento._id);
      console.log('Evento de nacimiento creado:', eventoNacimiento);
    }
    if (bovino.fechaIngreso && bovino.fechaIngreso !== '' && !isNaN(new Date(bovino.fechaIngreso))) {
      const eventoIngreso = new Evento({
        tipo: 'Ingreso',
        descripcion: `Ingreso de ${bovino.nombre || 'bovino'} (${bovino.raza || ''}) a la finca`,
        fecha: bovino.fechaIngreso,
        bovino: bovino._id
      });
      await eventoIngreso.save();
      eventosCreados.push(eventoIngreso._id);
      console.log('Evento de ingreso creado:', eventoIngreso);
    }
    // Asociar eventos al bovino
    if (eventosCreados.length) {
      bovino.eventos = [...(bovino.eventos || []), ...eventosCreados];
      await bovino.save();
    }

    res.status(201).json(bovino);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Subida de imagen de bovino
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  const url = `/uploads/bovinos/${req.file.filename}`;
  res.json({ url });
});

// Eliminar bovino por ID y sus eventos asociados
router.delete('/:id', async (req, res) => {
  try {
    const bovino = await Bovino.findByIdAndDelete(req.params.id);
    if (bovino) {
      // Elimina todos los eventos asociados a este bovino
      const Evento = require('../models/Evento');
      await Evento.deleteMany({ bovino: req.params.id });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ...otros endpoints (filtros, detalle, etc.)

module.exports = router;
