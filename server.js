// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Importa la configuración principal de la aplicación Express
const app = require('./src/app');

// Importa la función para conectar con la base de datos
const conectDB = require('./src/config/db');

// Ejecuta la conexión a la base de datos
conectDB();

// Define el puerto del servidor (usa el del .env o 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Inicia el servidor y escucha en el puerto definido
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});