const express = require("express");
const router = express.Router();

const questionController = require("../controllers/question.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, questionController.askQuestion);
router.put("/:id/answer", authMiddleware, questionController.answerQuestion);
router.get("/my-questions", authMiddleware, questionController.getMyQuestions);
router.get("/my-vehicle-questions",authMiddleware,questionController.getQuestionsForMyVehicles);
router.get("/vehicle/:vehicleId", authMiddleware, questionController.getVehicleQuestions);
router.delete("/conversation/:vehicleId/:askedById",authMiddleware,questionController.deleteConversation);

module.exports = router;