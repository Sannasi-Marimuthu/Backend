const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    RoomType: { type: String, required: true },
    RatePlan: { type: String, required: true },
    PropertyCode: { type: String, required: false },
    Status: { type: Number, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("RoomRateLink", Schema);

module.exports = Item;
