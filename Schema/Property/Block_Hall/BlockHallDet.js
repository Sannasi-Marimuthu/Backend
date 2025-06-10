const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    BlockDetId: { type: Number, required: true },
    Blkid: { type: Number, required: true },
    Slotname: { type: String, require: true },
    Fromtime: { type: String, required: false },
    Totime: { type: String, required: false },
    Stopsales: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("BlockHallDet", Schema);

module.exports = Item;
