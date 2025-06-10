const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Start: { type: Number, required: true },
    End: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("PriceFilter", Schema);

module.exports = Item;
