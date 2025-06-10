const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Displayname: { type: String, required: true },
    Description: { type: String, required: false },
    Totalrooms: { type: Number, required: true },
    Roomview: { type: String, required: false },
    Bedview: { type: String, required: false },
    Roomsize: { type: String, required: false },
    Measurement: { type: String, required: false },
    Basicadults: { type: Number, required: false },
    Maxadults: { type: Number, required: false },
    Maxchildrens: { type: Number, required: false },
    Maxoccupancy: { type: Number, required: false },
    Roomcode: { type: String, required: false },
    PropertyCode: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("RoomType", Schema);

module.exports = Item;
