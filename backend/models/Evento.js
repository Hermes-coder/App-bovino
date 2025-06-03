const mongoose = require('mongoose');

const EventoSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  descripcion: String,
  fecha: { type: Date, required: true },
  bovino: { type: mongoose.Schema.Types.ObjectId, ref: 'Bovino' },
  medicina: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicina' },
  herramienta: { type: mongoose.Schema.Types.ObjectId, ref: 'Recurso' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('Evento', EventoSchema);
