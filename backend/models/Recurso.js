const mongoose = require('mongoose');

const RecursoSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  nombre: { type: String, required: true },
  cantidad: Number,
  fechaAdquisicion: Date,
  proveedor: String,
  fechaVencimiento: Date,
  observaciones: String,
  condicion: String,
  ultimaRevision: Date,
  ubicacion: String,
  imagenUrl: String,
  historialUso: [
    {
      evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento' },
      fecha: Date,
      cantidadUsada: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Recurso', RecursoSchema);
