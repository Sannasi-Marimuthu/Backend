const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Policy: { type: String, required: true },
    PolicyType: { type: String, required: true },
    PropertyCode: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("PolicyMaster", Schema);

module.exports = Item;
