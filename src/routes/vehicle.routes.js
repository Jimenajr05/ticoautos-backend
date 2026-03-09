const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

//Lista de vehículos con filtros
router.get("/", vehicleController.getVehicles);

//GET públicO 
router.get("/:id", vehicleController.getVehicleById);

//POST Vehiculo
router.post("/", authMiddleware, upload.array("vehicleImage", 5), vehicleController.createVehicle);

//PUT Vehiculo
router.put("/:id", authMiddleware, upload.array("vehicleImage", 5), vehicleController.updateVehicle);

// Delete Vehiculo
router.delete("/:id", authMiddleware, vehicleController.deleteVehicle);

//Marca el auto como vendido
router.patch("/:id/sold", authMiddleware, vehicleController.markAsSold);

module.exports = router;