const Question = require('../models/question.model');
const Vehicle = require('../models/vehicle.model');

exports.askQuestion = async (req, res) => {
  try {

    const { vehicleId, question } = req.body;

    const newQuestion = new Question({
      vehicle: vehicleId,
      question,
      askedBy: req.user.id
    });

    await newQuestion.save();

    res.status(201).json(newQuestion);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.answerQuestion = async (req, res) => {
  try {

    const { id } = req.params;
    const { answer } = req.body;

    const question = await Question.findById(id).populate('vehicle');

    if (!question) {
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    if (question.vehicle.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado para responder' });
    }

    question.answer = answer;
    question.answeredBy = req.user.id;
    question.answerDate = new Date();

    await question.save();

    res.json(question);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyQuestions = async (req, res) => {

  const questions = await Question.find({
    askedBy: req.user.id
  }).populate('vehicle');

  res.json(questions);
};

exports.getVehicleQuestions = async (req, res) => {

  const { vehicleId } = req.params;

  const questions = await Question.find({
    vehicle: vehicleId
  })
  .populate('askedBy', 'name email')
  .populate('answeredBy', 'name email');

  res.json(questions);
};


