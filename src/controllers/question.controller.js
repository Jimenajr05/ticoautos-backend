const Question = require("../models/question.model");
const Vehicle = require("../models/vehicle.model");

// Controlador para enviar una nueva pregunta sobre un vehículo
exports.askQuestion = async (req, res) => {
  try {
    // Obtiene el id del vehículo y la pregunta desde el body
    const { vehicleId, question } = req.body;

    // Valida que la pregunta no venga vacía
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "La pregunta es obligatoria" });
    }

    // Busca el vehículo en la base de datos
    const vehicle = await Vehicle.findById(vehicleId);

    // Si no existe el vehículo, devuelve error
    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    // Evita que el dueño pregunte por su propio vehículo
    if (vehicle.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "No puedes preguntar por tu propio vehículo" });
    }

    // Busca si el usuario ya tiene una pregunta pendiente sin responder en ese vehículo
    const pendingQuestion = await Question.findOne({
      vehicle: vehicleId,
      askedBy: req.user._id,
      answer: null,
    });

    // Si ya existe una pregunta pendiente, no permite enviar otra
    if (pendingQuestion) {
      return res.status(400).json({
        message: "Debes esperar a que el dueño responda tu pregunta anterior",
      });
    }

    // Crea la nueva pregunta
    const newQuestion = await Question.create({
      vehicle: vehicleId,
      question,
      askedBy: req.user._id,
    });

    // Responde con éxito y devuelve la nueva pregunta
    res.status(201).json({
      message: "Pregunta enviada correctamente",
      data: newQuestion,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al enviar pregunta", error: error.message });
  }
};

// Controlador para obtener todas las preguntas hechas sobre mis vehículos
exports.getQuestionsForMyVehicles = async (req, res) => {
  try {
    // Busca los vehículos cuyo dueño es el usuario autenticado
    const myVehicles = await Vehicle.find({ user: req.user.id }).select("_id");

    // Extrae solo los ids de esos vehículos
    const vehicleIds = myVehicles.map((vehicle) => vehicle._id);

    // Busca todas las preguntas asociadas a esos vehículos
    const questions = await Question.find({
      vehicle: { $in: vehicleIds },
    })
      // Carga datos del vehículo y también del dueño de ese vehículo
      .populate({path: "vehicle",select: "title brand model user", populate: {path: "user",select: "_id name lastName",},})
      // Carga los datos de quien hizo la pregunta
      .populate("askedBy", "name lastName")
      // Carga los datos de quien respondió
      .populate("answeredBy", "name lastName")
      // Ordena de la más reciente a la más antigua
      .sort({ questionDate: -1 });

    // Devuelve las preguntas encontradas
    res.json({
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener preguntas de mis vehículos",
      error: error.message,
    });
  }
};

// Controlador para responder una pregunta
exports.answerQuestion = async (req, res) => {
  try {
    // Obtiene el id de la pregunta desde los parámetros
    const { id } = req.params;
    // Obtiene la respuesta desde el body
    const { answer } = req.body;

    // Valida que la respuesta no esté vacía
    if (!answer || !answer.trim()) {
      return res.status(400).json({
        message: "La respuesta es obligatoria",
      });
    }

    // Busca la pregunta y carga los datos del vehículo relacionado
    const question = await Question.findById(id).populate({
      path: "vehicle",
      select: "title brand model user",
    });

    // Si la pregunta no existe
    if (!question) {
      return res.status(404).json({
        message: "Pregunta no encontrada",
      });
    }

    // Si no se encontró el vehículo asociado
    if (!question.vehicle) {
      return res.status(404).json({
        message: "Vehículo asociado no encontrado",
      });
    }

    // Si el vehículo no tiene propietario relacionado
    if (!question.vehicle.user) {
      return res.status(400).json({
        message: "El vehículo no tiene propietario asociado",
      });
    }

    // Solo el dueño del vehículo puede responder la pregunta
    if (question.vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado para responder",
      });
    }

    // Evita responder una pregunta que ya fue respondida
    if (question.answer) {
      return res.status(400).json({
        message: "Esta pregunta ya fue respondida",
      });
    }

    // Guarda la respuesta
    question.answer = answer.trim();
    // Guarda quién respondió
    question.answeredBy = req.user.id;
    // Guarda la fecha de respuesta
    question.answerDate = new Date();

    // Guarda los cambios en la base de datos
    await question.save();
  
    // Devuelve respuesta exitosa
    res.status(200).json({
      message: "Respuesta enviada correctamente",
      data: question,
    });
  } catch (error) {
    console.error("Error en answerQuestion:", error);
    res.status(500).json({
      message: "Error al responder la pregunta",
      error: error.message,
    });
  }
};

// Controlador para obtener las preguntas hechas por el usuario autenticado
exports.getMyQuestions = async (req, res) => {
  try {
    // Busca preguntas donde el usuario sea quien preguntó
    const questions = await Question.find({
      askedBy: req.user.id,
    })
      // Carga datos del vehículo y del dueño del vehículo
      .populate({
        path: "vehicle",
        select: "title brand model user",
        populate: {
          path: "user",
          select: "_id name lastName",
        },
      })
      // Carga los datos de quien respondió
      .populate("answeredBy", "name lastName");

    // Devuelve las preguntas encontradas
    res.json({
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener tus preguntas",
      error: error.message,
    });
  }
};

// Controlador para obtener todas las preguntas de un vehículo específico
exports.getVehicleQuestions = async (req, res) => {
  try {
    // Obtiene el id del vehículo desde los parámetros
    const { vehicleId } = req.params;

    // Busca todas las preguntas de ese vehículo
    const questions = await Question.find({
      vehicle: vehicleId,
    })
      // Carga datos del usuario que preguntó
      .populate("askedBy", "name lastName profileImage")
      // Carga datos del usuario que respondió
      .populate("answeredBy", "name lastName profileImage")
      // Carga datos del vehículo y su dueño
      .populate({
        path: "vehicle",
        select: "title brand model user",
        populate: {
          path: "user",
          select: "_id name lastName",
        },
      })
      // Ordena de la más antigua a la más reciente
      .sort({ questionDate: 1 });

    // Devuelve las preguntas encontradas
    res.json({
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las preguntas del vehículo",
      error: error.message,
    });
  }
};

// Controlador para eliminar toda una conversación entre un usuario y un vehículo
exports.deleteConversation = async (req, res) => {
  try {
    // Obtiene el id del vehículo y el id del usuario que preguntó
    const { vehicleId, askedById } = req.params;

    // Busca el vehículo en la base de datos
    const vehicle = await Vehicle.findById(vehicleId);

    // Si el vehículo no existe
    if (!vehicle) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    // Verifica si el usuario autenticado es el dueño del vehículo
    const isOwner = vehicle.user.toString() === req.user.id;

    // Verifica si el usuario autenticado es quien hizo la pregunta
    const isAsker = askedById === req.user.id;

    // Solo el dueño o quien preguntó puede eliminar la conversación
    if (!isOwner && !isAsker) {
      return res.status(403).json({
        message: "No autorizado para eliminar esta conversación",
      });
    }

    // Elimina todas las preguntas de esa conversación
    await Question.deleteMany({
      vehicle: vehicleId,
      askedBy: askedById,
    });

    // Responde con éxito
    res.json({
      message: "Conversación eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la conversación",
      error: error.message,
    });
  }
};