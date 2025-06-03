const mongoose = require('mongoose');

const MedicinaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true }, // vacuna, antibiotico, etc.
  cantidad: Number,
  fechaIngreso: Date, // <-- nuevo campo
  fechaVencimiento: Date,
  proveedor: String,
  observaciones: String,
  imagenUrl: String,
  historialUso: [
    {
      evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento' },
      fecha: Date,
      cantidadUsada: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Medicina', MedicinaSchema);
