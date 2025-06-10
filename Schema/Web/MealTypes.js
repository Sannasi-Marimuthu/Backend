const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    MealType: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("WebMealType", Schema);

module.exports = Item;
