const express = require('express');
const router = express.Router();
const Evento = require('../models/Evento');

// Obtener todos los eventos
router.get('/', async (req, res) => {
  const eventos = await Evento.find().populate('bovino medicina herramienta');
  res.json(eventos);
});

// Agregar nuevo evento
router.post('/', async (req, res) => {
  try {
    const evento = new Evento(req.body);
    await evento.save();
    res.status(201).json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar evento por ID
router.delete('/:id', async (req, res) => {
  try {
    await Evento.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ...otros endpoints (filtros, detalle, etc.)

module.exports = router;
