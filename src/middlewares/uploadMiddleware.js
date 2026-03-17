// Importa multer para manejar subida de archivos
const multer = require('multer');
// Importa path para trabajar con rutas y extensiones de archivos
const path = require('path');
// Importa fs para trabajar con el sistema de archivos
const fs = require('fs');

// Función que crea la carpeta si no existe
const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    // Define la carpeta donde se guardarán los archivos
    let folder = 'uploads/others';

    // Si el archivo es imagen de perfil
    if (file.fieldname === 'profileImage') {
      folder = 'uploads/users';
    }

    // Si el archivo es imagen de vehículo
    if (file.fieldname === 'vehicleImage') {
        folder = 'uploads/vehicles';
    }

    // Crea la carpeta si no existe
    createFolderIfNotExists(folder);

    // Guarda el archivo en la carpeta correspondiente
    cb(null, folder);
    },

    // Define el nombre con el que se guardará el archivo
    filename: (req, file, cb) => {
        // Genera un nombre único usando fecha + número aleatorio
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        // Guarda el archivo con ese nombre
        cb(null, uniqueName);
    }
});

// Filtro para permitir solo ciertos tipos de archivos
const fileFilter = (req, file, cb) => {
    // Tipos de imagen permitidos
    const allowedTypes = /jpeg|jpg|png|webp/;

    // Verifica extensión del archivo
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    // Verifica el tipo MIME del archivo
    const isValidMime = allowedTypes.test(file.mimetype);

    // Si ambos son válidos se permite el archivo
    if (isValidExt && isValidMime) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos de imagen (JPEG, PNG, WEBP)"));
    }
};

// Configuración final de multer
const upload = multer({
    // Usa el almacenamiento configurado
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    // Aplica el filtro de archivos
    fileFilter,
});

module.exports = upload;