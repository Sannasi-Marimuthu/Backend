const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    OtaName: { type: String, required: true },
    OtaId: { type: Number, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("OtaMaster", Schema);

module.exports = Item;
