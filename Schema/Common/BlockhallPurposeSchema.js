const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Purpose: { type: String, required: true },
    PurposeId: { type: Number, required: true },
    
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("blockhallpurpose", Schema);

module.exports = Item;