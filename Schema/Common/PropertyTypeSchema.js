const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    PropertyName: { type: String, required: true },
    Status: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("PropertyType", Schema);

module.exports = Item;
