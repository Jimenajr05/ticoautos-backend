// Importa express para crear rutas
const express = require("express");

// Crea una instancia del router de Express
const router = express.Router();

// Importa el controlador de preguntas
const questionController = require("../controllers/question.controller");

// Importa el middleware de autenticación
const authMiddleware = require("../middlewares/authMiddleware");

// Ruta para crear una nueva pregunta sobre un vehículo
router.post("/", authMiddleware, questionController.askQuestion);

// Ruta para responder una pregunta
router.put("/:id/answer", authMiddleware, questionController.answerQuestion);

// Ruta para obtener las preguntas hechas por el usuario autenticado
router.get("/my-questions", authMiddleware, questionController.getMyQuestions);

// Ruta para obtener las preguntas de los vehículos del usuario
router.get("/my-vehicle-questions", authMiddleware, questionController.getQuestionsForMyVehicles);

// Ruta para obtener las preguntas de un vehículo específico
router.get("/vehicle/:vehicleId", authMiddleware, questionController.getVehicleQuestions);

// Ruta para eliminar una conversación entre un usuario y un vehículo
router.delete("/conversation/:vehicleId/:askedById", authMiddleware, questionController.deleteConversation);

// Exporta las rutas para usarlas en el servidor
module.exports = router;