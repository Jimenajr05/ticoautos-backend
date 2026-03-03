const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middlewares/authMiddleware");
 
//POST Vehiculo
router.post("/", authMiddleware, vehicleController.createVehicle);

//PUT Vehiculo
router.put("/:id", authMiddleware, vehicleController.updateVehicle);

//GET públicO 
router.get("/:id", vehicleController.getVehicleById);

// Delete Vehiculo
router.delete("/:id", authMiddleware, vehicleController.deleteVehicle);

//Marca el auto como vendido
router.patch("/:id/sold", authMiddleware, vehicleController.markAsSold);

module.exports = router;