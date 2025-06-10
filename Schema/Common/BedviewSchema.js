const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    BedType: { type: String, required: true },
    Status: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("Bedview", Schema);

module.exports = Item;
