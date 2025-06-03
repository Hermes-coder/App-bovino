require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(__dirname + '/uploads'));

// Import routes
app.use('/api/bovinos', require('./routes/bovinos'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/gramineas', require('./routes/gramineas'));
app.use('/api/recursos', require('./routes/recursos'));
app.use('/api/medicinas', require('./routes/medicinas'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
