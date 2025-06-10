const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    PropertyCode: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("AmenitiesMaster", Schema);

module.exports = Item;
