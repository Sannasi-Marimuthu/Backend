const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    RoomTypes: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("WebRoomType", Schema);

module.exports = Item;
