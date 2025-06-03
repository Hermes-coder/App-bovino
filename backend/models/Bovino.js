const mongoose = require('mongoose');

const BovinoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['vaca', 'toro'], required: true },
  nombre: String,
  edad: Number,
  raza: String,
  fechaNacimiento: Date,
  fechaIngreso: Date,
  procedencia: String,
  estadoSalud: String,
  historialVacunas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
  fotoUrl: String,
  eventos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evento' }],
}, { timestamps: true });

module.exports = mongoose.model('Bovino', BovinoSchema);
