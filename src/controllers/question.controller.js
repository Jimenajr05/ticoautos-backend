const Question = require("../models/question.model");
const Vehicle = require("../models/vehicle.model");

exports.askQuestion = async (req, res) => {
  try {
    const { vehicleId, question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "La pregunta es obligatoria",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehículo no encontrado",
      });
    }

    // No permitir preguntar en su propio vehículo
    if (vehicle.user.toString() === req.user.id) {
      return res.status(400).json({
        message: "No puedes enviar preguntas a tu propio vehículo",
      });
    }

    // Validar que no tenga una pregunta pendiente
    const lastQuestion = await Question.findOne({
      vehicle: vehicleId,
      askedBy: req.user.id,
    }).sort({ createdAt: -1 });

    if (lastQuestion && !lastQuestion.answer) {
      return res.status(400).json({
        message:
          "Debes esperar la respuesta del vendedor antes de enviar otra pregunta",
      });
    }

    const newQuestion = new Question({
      vehicle: vehicleId,
      question,
      askedBy: req.user.id,
    });

    await newQuestion.save();

    res.status(201).json({
      message: "Pregunta enviada correctamente",
      data: newQuestion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al enviar la pregunta",
      error: error.message,
    });
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

    const question = await Question.findById(id).populate("vehicle");

    if (!question) {
      return res.status(404).json({
        message: "Pregunta no encontrada",
      });
    }

    // Solo el propietario puede responder
    if (question.vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "No autorizado para responder",
      });
    }

    // Evitar responder dos veces
    if (question.answer) {
      return res.status(400).json({
        message: "Esta pregunta ya fue respondida",
      });
    }

    question.answer = answer;
    question.answeredBy = req.user.id;
    question.answerDate = new Date();

    await question.save();

    res.json({
      message: "Respuesta enviada correctamente",
      data: question,
    });
  } catch (error) {
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
      .populate("vehicle")
      .populate("answeredBy", "name");

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

    const questions = await Question.find({vehicle: vehicleId,})
      .populate("askedBy", "name lastName profileImage")
      .populate("answeredBy", "name lastName profileImage")
      .sort({ questionDate: 1 });

    res.json({data: questions,});

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las preguntas del vehículo",
      error: error.message,
    });
  }
};