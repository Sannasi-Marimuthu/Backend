const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    ManagementType: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("ManagementType", Schema);

module.exports = Item;
