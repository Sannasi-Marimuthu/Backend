const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Email: { type: String, required: true },
    PropertyName: { type: [String], required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("UserProperty", Schema);

module.exports = Item;
