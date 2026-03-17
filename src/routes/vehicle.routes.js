// Importa express para crear rutas
const express = require("express");

// Crea una instancia del router
const router = express.Router();

// Importa el controlador de vehículos
const vehicleController = require("../controllers/vehicle.controller");

// Importa el middleware de autenticación
const authMiddleware = require("../middlewares/authMiddleware");

// Importa el middleware para subir imágenes
const upload = require("../middlewares/uploadMiddleware");

// Ruta pública para obtener la lista de vehículos con filtros
router.get("/", vehicleController.getVehicles);

// Ruta para obtener los vehículos del usuario autenticado
router.get("/my-vehicles", authMiddleware, vehicleController.getMyVehicles);

// Ruta pública para obtener un vehículo por su id
router.get("/:id", vehicleController.getVehicleById);

// Ruta para crear un vehículo
// upload.array permite subir hasta 5 imágenes del vehículo
router.post(
  "/",
  authMiddleware,
  upload.array("vehicleImage", 5),
  vehicleController.createVehicle
);

// Ruta para actualizar un vehículo
router.put(
  "/:id",
  authMiddleware,
  upload.array("vehicleImage", 5),
  vehicleController.updateVehicle
);

// Ruta para eliminar un vehículo
router.delete("/:id", authMiddleware, vehicleController.deleteVehicle);

// Ruta para marcar un vehículo como vendido
router.patch("/:id/sold", authMiddleware, vehicleController.markAsSold);

// Ruta para generar el enlace público de un vehículo
router.get("/:id/share", vehicleController.getVehicleShareLink);

// Exporta el router
module.exports = router;