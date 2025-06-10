const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Transport: { type: String, required: true },
    Status: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("ModeOfTransport", Schema);

module.exports = Item;
