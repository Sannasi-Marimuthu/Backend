const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    ReservationDate: { type: String, required: false },
    ArrivalDate: { type: String, required: false },
    Content: { type: String, required: false },
    TemplateName: { type: String, required: false },
    GuestName: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("GuestEmail", Schema);

module.exports = Item;
