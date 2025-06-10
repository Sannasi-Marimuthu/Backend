const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Amenities: { type: String, required: true },
    AmenitiesCategory: { type: Number, required: true },
    Status: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("Amenities", Schema);

module.exports = Item;
