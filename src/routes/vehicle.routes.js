const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

//Lista de vehículos con filtros (público)
router.get("/", vehicleController.getVehicles);

//Vehículos del usuario autenticado
router.get("/my-vehicles", authMiddleware, vehicleController.getMyVehicles);

//GET público por id
router.get("/:id", vehicleController.getVehicleById);

//POST Vehículo
router.post(
  "/",
  authMiddleware,
  upload.array("vehicleImage", 5),
  vehicleController.createVehicle
);

//PUT Vehículo
router.put(
  "/:id",
  authMiddleware,
  upload.array("vehicleImage", 5),
  vehicleController.updateVehicle
);

//Delete Vehículo
router.delete("/:id", authMiddleware, vehicleController.deleteVehicle);

//Marca el auto como vendido
router.patch("/:id/sold", authMiddleware, vehicleController.markAsSold);

//Generación de enlace
router.get("/:id/share", vehicleController.getVehicleShareLink);

module.exports = router;

