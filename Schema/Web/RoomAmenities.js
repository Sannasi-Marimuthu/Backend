const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    RoomAmenities: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("WebRoomAmmenities", Schema);

module.exports = Item;
