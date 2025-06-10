const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Email: { type: String, required: true },
    Password: { type: String, required: true },
    Port: { type: Number, required: true },
    Secure: { type: String, required: true },
    SMTPHost: { type: String, required: true },
    PropertyCode: { type: String, required: true },
    Status: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("EmailMaster", Schema);

module.exports = Item;
