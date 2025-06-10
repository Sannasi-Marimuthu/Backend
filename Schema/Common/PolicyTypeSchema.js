const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    PolicyType: { type: String, required: true },
    PolicyId: { type: Number, required: false },
    Status: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("PolicyType", Schema);

module.exports = Item;
