const mongoose = require("mongoose");

// Define el esquema de la respuesta
const answerSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Answer", answerSchema);
