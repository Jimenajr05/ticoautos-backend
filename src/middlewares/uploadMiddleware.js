const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/others';

    if (file.fieldname === 'profileImage') {
      folder = 'uploads/users';
    }

    if (file.fieldname === 'vehicleImage') {
        folder = 'uploads/vehicles';
    }

    createFolderIfNotExists(folder);
    cb(null, folder);
    },

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = allowedTypes.test(file.mimetype);

    if (isValidExt && isValidMime) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos de imagen (JPEG, PNG, WEBP)"));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    fileFilter,
});

module.exports = upload;