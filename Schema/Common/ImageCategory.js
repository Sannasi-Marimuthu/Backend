const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    ImageCategory: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("ImageCategory", Schema);

module.exports = Item;
