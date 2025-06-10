const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Policies: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("CancellationPolicy", Schema);

module.exports = Item;
