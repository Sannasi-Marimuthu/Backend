const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    // CoverImage: { type: [String], required: false },
    // PropertyImage: { type: [String], required: false },
    // Others: { type: [String], required: false },
    PropertyCode: { type: String,  },
    RoomCode: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("File", Schema);

module.exports = Item;
