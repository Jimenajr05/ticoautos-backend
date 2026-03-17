const Vehicle = require("../models/vehicle.model");

// Controlador para crear un nuevo vehículo
exports.createVehicle = async (req, res) => {
  try {
    // Obtiene los datos enviados desde el body
    const { title, brand, model, year, price, description } = req.body;

    // Valida que los campos obligatorios no estén vacíos
    if (!title || !brand || !model || !year || !price) {
      return res.status(400).json({
        message: "Todos los espacios deben llenarse",
      });
    }

    // Si se subieron imágenes, guarda sus rutas en un arreglo
    const vehicleImage = req.files
      ? req.files.map((file) => `/${file.path.replace(/\\/g, "/")}`)
      : [];

    // Crea una nueva instancia del vehículo
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

    // Guarda el vehículo en la base de datos
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

// Controlador para actualizar un vehículo
exports.updateVehicle = async (req, res) => {
  try {
    // Obtiene el id del vehículo desde los parámetros
    const { id } = req.params;

    // Busca el vehículo en la base de datos
    const vehicle = await Vehicle.findById(id);

    // Si no existe
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    // Verifica que el vehículo pertenezca al usuario autenticado
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

     // Si se subieron nuevas imágenes, actualiza el campo vehicleImage
    if (req.files && req.files.length > 0) {
      req.body.vehicleImage = req.files.map(
        (file) => `/${file.path.replace(/\\/g, "/")}`
      );
    }

    // Actualiza el vehículo y devuelve el documento actualizado
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

// Controlador para obtener un vehículo por su id
exports.getVehicleById = async (req, res) => {
  try {
    // Obtiene el id desde los parámetros
    const { id } = req.params;

    // Busca el vehículo y carga algunos datos del usuario dueño
    const vehicle = await Vehicle.findById(id).populate(
      "user",
      "name lastName profileImage"
    );

    // Si no existe el vehículo
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

// Controlador para eliminar un vehículo
exports.deleteVehicle = async (req, res) => {
  try {
    // Obtiene el id del vehículo
    const { id } = req.params;

    // Busca el vehículo en la base de datos
    const vehicle = await Vehicle.findById(id);

    // Si no existe
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    // Verifica que el vehículo pertenezca al usuario autenticado
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    // Elimina el vehículo
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

// Controlador para marcar un vehículo como vendido
exports.markAsSold = async (req, res) => {
  try {
    // Obtiene el id del vehículo
    const { id } = req.params;

    // Busca el vehículo
    const vehicle = await Vehicle.findById(id);

    // Si no existe
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    // Verifica que el vehículo pertenezca al usuario autenticado
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    // Cambia el estado del vehículo a vendido
    vehicle.status = "sold";

    // Guarda el cambio
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

// Controlador para obtener todos los vehículos con filtros y paginación
exports.getVehicles = async (req, res) => {
  try {
    // Obtiene los filtros enviados por query params
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

    // Objeto donde se guardarán los filtros
    const filters = {};

    // Filtra por marca si fue enviada
    if (brand && brand.trim() !== "") {
      filters.brand = {
        $regex: `^${brand.trim()}`,
        $options: "i",
      };
    }

    // Filtra por modelo si fue enviado
    if (model && model.trim() !== "") {
      filters.model = {
        $regex: model.trim(),
        $options: "i",
      };
    }

    // Filtra por estado si fue enviado
    if (status && status.trim() !== "") {
      filters.status = status.trim();
    }

    // Filtra por rango de año
    if (minYear || maxYear) {
      filters.year = {};
      if (minYear) filters.year.$gte = Number(minYear);
      if (maxYear) filters.year.$lte = Number(maxYear);
    }

    // Filtra por rango de precio
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    // Convierte page y limit a números
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Calcula cuántos documentos saltar
    const skip = (pageNumber - 1) * limitNumber;

    // Busca los vehículos aplicando filtros, usuario, paginación
    const vehicles = await Vehicle.find(filters)
      .populate("user", "name lastName profileImage")
      .skip(skip)
      .limit(limitNumber);

    // Cuenta el total de vehículos que cumplen los filtros
    const total = await Vehicle.countDocuments(filters);

    // Respuesta exitosa con paginación
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

// Controlador para obtener solo los vehículos del usuario autenticado
exports.getMyVehicles = async (req, res) => {
  try {
    // Busca los vehículos cuyo dueño es el usuario autenticado
    const vehicles = await Vehicle.find({ user: req.user.id })
      .populate("user", "name lastName profileImage")
      .sort({ createdAt: -1 });

    // Respuesta exitosa
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

// Controlador para generar el enlace público de un vehículo
exports.getVehicleShareLink = async (req, res) => {
  try {
    // Obtiene el id del vehículo
    const { id } = req.params;

    // Busca el vehículo en la base de datos
    const vehicle = await Vehicle.findById(id);

    // Si no existe
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    // Construye la URL pública del vehículo usando FRONTEND_URL
    const shareURL = `${process.env.FRONTEND_URL}/vehicles/${id}`;

    // Respuesta exitosa
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