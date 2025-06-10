const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    RatePlan: { type: String, required: true },
    PropertyCode: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("RatePlan", Schema);

module.exports = Item;
