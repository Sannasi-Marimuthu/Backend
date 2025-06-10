const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      required: true,
    },
    Password: {
      type: String,
      required: true,
    },
    UserType: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  {
    strict: false,
  }
);

const Item = mongoose.model("UserMaster", itemSchema);

module.exports = Item;
