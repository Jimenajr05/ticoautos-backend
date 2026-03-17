// Importa express para crear la aplicación del servidor
const express = require('express');

// Importa cors para permitir peticiones desde otros dominios (frontend)
const cors = require('cors');

// Importa path para manejar rutas de archivos
const path = require('path');

// Importa las rutas de autenticación
const authRoutes = require('./routes/authRoutes');

// Importa las rutas de vehículos
const vehicleRoutes = require('./routes/vehicle.routes');

// Importa las rutas de preguntas
const questionRoutes = require('./routes/question.routes');

// Crea la aplicación de Express
const app = express();

// Habilita CORS para permitir comunicación con el frontend
app.use(cors());

// Permite recibir datos en formato JSON en las peticiones
app.use(express.json());

// Permite acceder públicamente a la carpeta uploads (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Define las rutas para vehículos
app.use('/api/vehicles', vehicleRoutes);

// Define las rutas para autenticación
app.use('/api/auth', authRoutes);

// Define las rutas para preguntas
app.use('/api/questions', questionRoutes);

// Exporta la aplicación para usarla en server.js
module.exports = app;