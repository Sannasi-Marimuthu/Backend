const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    MealPrice: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("WebMealPrice", Schema);

module.exports = Item;
