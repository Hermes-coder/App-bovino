const express = require('express');
const router = express.Router();
const Graminea = require('../models/Graminea');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento para imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/gramineas');
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

// Obtener todas las gramíneas
router.get('/', async (req, res) => {
  const gramineas = await Graminea.find();
  res.json(gramineas);
});

// Agregar nueva gramínea
router.post('/', async (req, res) => {
  try {
    const graminea = new Graminea(req.body);
    await graminea.save();
    res.status(201).json(graminea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Subida de imagen
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  const url = `/uploads/gramineas/${req.file.filename}`;
  res.json({ url });
});

// Eliminar gramínea por ID
router.delete('/:id', async (req, res) => {
  try {
    await Graminea.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
