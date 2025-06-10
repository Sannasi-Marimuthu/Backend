const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Currency: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("Currencie", Schema);

module.exports = Item;
