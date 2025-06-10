const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    CustomerId: { type: Number, required: true },
    CustomerCode: { type: String, required: true },
    Name: { type: String, required: true },
    Address1: { type: String, required: true },
    Address2: { type: String, required: false },
    Address3: { type: String, required: false },
    City: { type: String, required: true },
    State: { type: String, required: true },
    Country: { type: String, required: true },
    Pincode: { type: String, required: true },
    Mobile: { type: String, required: true },
    Email: { type: String, required: true },
    GuestImage: { type: String, required: true },
    BirthDate: { type: String, required: false },
    MarriageDate: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("GuestDetail", Schema);

module.exports = Item;
