const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    RoomView: { type: String, required: true },
    Status: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("Roomview", Schema);

module.exports = Item;
