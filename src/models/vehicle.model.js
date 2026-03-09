const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },

    vehicleImage: {
      type: [String],
      default: []
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",       //La relacion que va a tener con el usuario
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);