// Importa la librería mongoose, que permite conectar Node.js con MongoDB
const mongoose = require('mongoose');

// Define una función asincrónica llamada connectDB que se encargará de conectar la base de datos
const connectDB = async () => {
  try {

    // Intenta conectarse a MongoDB utilizando la URL almacenada en la variable de entorno DATABASE_URL
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Conexión a la base de datos establecida');
    }catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        // Detiene la ejecución del servidor si no se logra conectar a la base de datos
        process.exit(1); 
    }
};

module.exports = connectDB;