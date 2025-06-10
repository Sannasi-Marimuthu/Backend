const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    UtilityType: { type: String, required: true },
    UtilityId: { type: Number, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("UtilityType", Schema);

module.exports = Item;
