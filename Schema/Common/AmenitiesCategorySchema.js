const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    AmenitiesCategory: { type: String, required: true },
    // normalizedCategory: { type: String, unique: true },
    AmenitiesCategoryId: { type: Number, required: true },
    Status: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("AmenitiesCategory", Schema);

module.exports = Item;
