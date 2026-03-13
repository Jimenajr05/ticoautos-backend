const Vehicle = require("../models/vehicle.model");

exports.createVehicle = async (req, res) => {
  try {
    const { title, brand, model, year, price, description } = req.body;

    if (!title || !brand || !model || !year || !price) {
      return res.status(400).json({
        message: "Todos los espacios deben llenarse",
      });
    }

    const vehicleImage = req.files
      ? req.files.map((file) => `/${file.path.replace(/\\/g, "/")}`)
      : [];

    const newVehicle = new Vehicle({
      title,
      brand,
      model,
      year,
      price,
      description,
      vehicleImage,
      user: req.user.id,
    });

    await newVehicle.save();

    res.status(201).json({
      message: "El vehículo se ha creado correctamente",
      vehicle: newVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear vehículo",
      error: error.message,
    });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    if (req.files && req.files.length > 0) {
      req.body.vehicleImage = req.files.map(
        (file) => `/${file.path.replace(/\\/g, "/")}`
      );
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "El vehículo se actualizó correctamente",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar vehículo",
      error: error.message,
    });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id).populate(
      "user",
      "name lastName profileImage"
    );

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
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    await Vehicle.findByIdAndDelete(id);

    res.status(200).json({
      message: "Se eliminó el vehículo correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el vehículo",
      error: error.message,
    });
  }
};

exports.markAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    vehicle.status = "sold";
    await vehicle.save();

    res.status(200).json({
      message: "Vehículo marcado como vendido",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el vehículo",
      error: error.message,
    });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const {
      brand,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {};

    if (brand && brand.trim() !== "") {
      filters.brand = {
        $regex: `^${brand.trim()}`,
        $options: "i",
      };
    }

    if (model && model.trim() !== "") {
      filters.model = {
        $regex: model.trim(),
        $options: "i",
      };
    }

    if (status && status.trim() !== "") {
      filters.status = status.trim();
    }

    if (minYear || maxYear) {
      filters.year = {};
      if (minYear) filters.year.$gte = Number(minYear);
      if (maxYear) filters.year.$lte = Number(maxYear);
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const vehicles = await Vehicle.find(filters)
      .populate("user", "name lastName profileImage")
      .skip(skip)
      .limit(limitNumber);

    const total = await Vehicle.countDocuments(filters);

    res.status(200).json({
      totalVehicles: total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los vehículos",
      error: error.message,
    });
  }
};

exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user.id })
      .populate("user", "name lastName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Vehículos del usuario obtenidos correctamente",
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los vehículos del usuario",
      error: error.message,
    });
  }
};

exports.getVehicleShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    const shareURL = `${process.env.FRONTEND_URL}/vehicles/${id}`;

    res.status(200).json({
      success: true,
      message: "Enlace de vehículo generado correctamente",
      data: {
        vehicleId: vehicle._id,
        shareURL,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al generar el enlace del vehículo",
      error: error.message,
    });
  }
};