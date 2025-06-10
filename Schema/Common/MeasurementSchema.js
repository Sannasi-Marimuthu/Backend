const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Measurement: { type: String, required: true },
    Status: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("Measurement", Schema);

module.exports = Item;
