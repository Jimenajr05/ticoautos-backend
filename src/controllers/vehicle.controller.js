const Vehicle = require("../models/vehicle.model");

exports.createVehicle = async (req, res) => {
  try {
    const { title, brand, model, year, price, description } = req.body;

    if (!title || !brand || !model || !year || !price) {
      return res.status(400).json({
        message: "Todos los ewspacios debe de llenarse",
      });
    }

    const newVehicle = new Vehicle({
      title,
      brand,
      model,
      year,
      price,
      description,
      user: req.user.id, 
    });

    await newVehicle.save();

    res.status(201).json({
      message: "El vehiculo se a creado correctamente",
      vehicle: newVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear vehiculo",
      error: error.message,
    });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "El vehiculo se actualizo correctamente",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating vehicle",
      error: error.message,
    });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id)
      .populate("user", "name");               // Solo trae el nombre del propietario

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el vehículo",
      error: error.message,
    });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await Vehicle.findByIdAndDelete(id);

    res.status(200).json({
      message: "Se elimino el vehiculo correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
    });
  }
};

 
exports.markAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehiculo no encontrado" });
    }

    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    vehicle.status = "sold";
    await vehicle.save();

    res.status(200).json({
      message: "Vehículo marcado como vendido",
      vehicle,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el vehículo",
      error: error.message,
    });
  }
};