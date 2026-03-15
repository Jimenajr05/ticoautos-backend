const Question = require("../models/question.model");
const Vehicle = require("../models/vehicle.model");

exports.askQuestion = async (req, res) => {
  try {
    const { vehicleId, question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "La pregunta es obligatoria" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    if (vehicle.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "No puedes preguntar por tu propio vehículo" });
    }

    const pendingQuestion = await Question.findOne({
      vehicle: vehicleId,
      askedBy: req.user._id,
      answer: null,
    });

    if (pendingQuestion) {
      return res.status(400).json({
        message: "Debes esperar a que el dueño responda tu pregunta anterior",
      });
    }

    const newQuestion = await Question.create({
      vehicle: vehicleId,
      question,
      askedBy: req.user._id,
    });

    res.status(201).json({
      message: "Pregunta enviada correctamente",
      data: newQuestion,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al enviar pregunta", error: error.message });
  }
};

exports.getQuestionsForMyVehicles = async (req, res) => {
  try {
    const myVehicles = await Vehicle.find({ user: req.user.id }).select("_id");

    const vehicleIds = myVehicles.map((vehicle) => vehicle._id);

    const questions = await Question.find({
      vehicle: { $in: vehicleIds },
    })
      .populate({path: "vehicle",select: "title brand model user", populate: {path: "user",select: "_id name lastName",},})
      .populate("askedBy", "name lastName")
      .populate("answeredBy", "name lastName")
      .sort({ questionDate: -1 });

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

exports.answerQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        message: "La respuesta es obligatoria",
      });
    }

    const question = await Question.findById(id).populate({
      path: "vehicle",
      select: "title brand model user",
    });

    if (!question) {
      return res.status(404).json({
        message: "Pregunta no encontrada",
      });
    }

    if (!question.vehicle) {
      return res.status(404).json({
        message: "Vehículo asociado no encontrado",
      });
    }

    if (!question.vehicle.user) {
      return res.status(400).json({
        message: "El vehículo no tiene propietario asociado",
      });
    }

    if (question.vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado para responder",
      });
    }

    if (question.answer) {
      return res.status(400).json({
        message: "Esta pregunta ya fue respondida",
      });
    }

    question.answer = answer.trim();
    question.answeredBy = req.user.id;
    question.answerDate = new Date();

    await question.save();

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

exports.getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({
      askedBy: req.user.id,
    })
      .populate({
        path: "vehicle",
        select: "title brand model user",
        populate: {
          path: "user",
          select: "_id name lastName",
        },
      })
      .populate("answeredBy", "name lastName");

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

exports.getVehicleQuestions = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const questions = await Question.find({
      vehicle: vehicleId,
    })
      .populate("askedBy", "name lastName profileImage")
      .populate("answeredBy", "name lastName profileImage")
      .populate({
        path: "vehicle",
        select: "title brand model user",
        populate: {
          path: "user",
          select: "_id name lastName",
        },
      })
      .sort({ questionDate: 1 });

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

exports.deleteConversation = async (req, res) => {
  try {
    const { vehicleId, askedById } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    const isOwner = vehicle.user.toString() === req.user.id;
    const isAsker = askedById === req.user.id;

    if (!isOwner && !isAsker) {
      return res.status(403).json({
        message: "No autorizado para eliminar esta conversación",
      });
    }

    await Question.deleteMany({
      vehicle: vehicleId,
      askedBy: askedById,
    });

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