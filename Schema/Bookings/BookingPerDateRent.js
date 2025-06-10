const mongoose = require("mongoose");

const bookingPerDayRentSchema = new mongoose.Schema(
  {
    Bkrentid: { type: String, required: true, unique: true },
    Bkid: { type: String, required: true, ref: "BookingMas" },
    Rentdate: { type: String, required: true },
    RateCode: { type: String, required: true },
    Roomtype_code: { type: String, required: true },
    Perdayrent: { type: Number, required: true },
  },
  {
    strict: true,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookingPerDayRent', bookingPerDayRentSchema);