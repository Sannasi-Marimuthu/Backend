const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Rating: { type: Number, required: true },
    RatingId: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("RatingsNumber", Schema);

module.exports = Item;
