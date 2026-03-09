const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middlewares/authMiddleware");
 
//Lista de vehículos con filtros
router.get("/", vehicleController.getVehicles);

//GET públicO 
router.get("/:id", vehicleController.getVehicleById);

//POST Vehiculo
router.post("/", authMiddleware, vehicleController.createVehicle);

//PUT Vehiculo
router.put("/:id", authMiddleware, vehicleController.updateVehicle);

// Delete Vehiculo
router.delete("/:id", authMiddleware, vehicleController.deleteVehicle);

//Marca el auto como vendido
router.patch("/:id/sold", authMiddleware, vehicleController.markAsSold);

//Generación de enlace  
router.get("/:id/share", vehicleController.getVehicleShareLink);

module.exports = router;