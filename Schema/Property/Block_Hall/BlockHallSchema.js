const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    HallName: { type: String, required: true },
    Blkid: { type: Number, required: true },
    RoomCode: { type: String, require: true },
    Blockdate: { type: String, required: true },
    Noofslots: { type: Number, required: true },
    Purposeid: { type: Number, required: true },
    PropertyCode: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("BlockHall", Schema);

module.exports = Item;
