const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Tiempo de espera de 5 segundos
    });
    console.log('MongoDB conectado...');
  } catch (err) {
    console.error('Error de conexión a MongoDB:', err);
    // No salgas del proceso, solo registra el error
  }
};

module.exports = connectDB;