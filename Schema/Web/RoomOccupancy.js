const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    RoomOccupancy: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("WebRoomOccupancy", Schema);

module.exports = Item;
