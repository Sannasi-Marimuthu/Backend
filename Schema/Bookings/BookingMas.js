const mongoose = require('mongoose');

const bookingMasSchema = new mongoose.Schema(
  {
    Bkid: { type: String, required: true, unique: true },
    Booking_pnr_no: { type: String, required: true, unique: true },
    Bookingdate: { type: Date, required: true, default: Date.now },
    Guestid: { type: String, required: true },
    Totrooms: { type: Number, required: true },
    Synctype: { type: String, enum: ["ONLINE", "OFFLINE"], default: "ONLINE" },
    Hotel_code: { type: String, required: true },
    Travelagentname: { type: String, default: "Py-Olliv" },
    Updatedate: { type: Date, required: true, default: Date.now },
    Remarks: { type: String, default: "Booking created via website" },
    Status: {
      type: String,
      enum: ["CONFIRMED", "PENDING", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  {
    strict: true,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookingMas', bookingMasSchema);