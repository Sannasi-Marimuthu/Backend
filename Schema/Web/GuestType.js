const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    GuestType: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("WebGuestType", Schema);

module.exports = Item;
