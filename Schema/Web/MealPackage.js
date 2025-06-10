const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    MealPackage: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("WebMealPackage", Schema);

module.exports = Item;
