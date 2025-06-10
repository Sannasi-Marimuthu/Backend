const mongoose = require("mongoose");
const bookingDetDatewiseSchema = new mongoose.Schema(
  {
    Bkid: { type: String, required: true, unique: true },
    Bkdetid: { type: String, required: true, ref: "BookingDet" },
    Refbkdetid: { type: String, required: true, unique: true },
    Bkdate: { type: String, required: true },
    Roomtype_code: { type: String, required: true },
    Noofrooms: { type: Number, required: true },
    Fromtime: { type: String, required: true },
    Totime: { type: String, required: true },
    Rate_code: { type: String, required: true },
  },
   {
    strict: true,
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingDetDatewise", bookingDetDatewiseSchema);
