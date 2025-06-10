const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    File: { type: String, required: false },
    hotelName: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("WebDetails", Schema);

module.exports = Item;
