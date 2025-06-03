const mongoose = require('mongoose');

const GramineaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  caracteristicas: String,
  beneficios: String,
  temporadas: String,
  zonasRecomendadas: String,
  imagenUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Graminea', GramineaSchema);
