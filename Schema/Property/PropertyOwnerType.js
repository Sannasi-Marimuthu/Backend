const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    PropertyOwnerType: { type: String, required: true },
    PropertyOwnerId: { type: Number, required: false },
    Status: { type: Number, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("PropertyOwnerType", Schema);

module.exports = Item;
