const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    IDProofId: { type: Number, required: true },
    IDProofName: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("IDProofName", Schema);

module.exports = Item;
