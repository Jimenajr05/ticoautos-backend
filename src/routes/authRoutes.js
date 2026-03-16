// Importa express para crear rutas
const express = require('express');

// Importa el controlador de registro de usuarios
const register = require('../controllers/registerController');

// Importa el controlador de login
const login= require('../controllers/loginController');

// Importa el middleware de multer para subir archivos
const upload = require('../middlewares/uploadMiddleware');

// Crea una instancia del router de Express
const router = express.Router();

// Ruta para registrar un usuario
router.post('/register',upload.single('profileImage'), register);

// Ruta para iniciar sesión
router.post('/login', login);

// Exporta las rutas para usarlas en el servidor principal
module.exports = router;