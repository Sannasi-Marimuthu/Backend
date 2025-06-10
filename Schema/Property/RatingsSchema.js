const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Ratings: { type: String, required: true },
    Reviews: { type: String, required: true },
    PropertyCode: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("RatingsandReviews", Schema);

module.exports = Item;
