const mongoose = require("mongoose");

const bookingDetSchema = new mongoose.Schema({
  Bkdetid: { type: String, required: true, unique: true },
  Bkid: { type: String, required: true, ref: 'BookingMas' },
  Fromdate: { type: String, required: true },
  Fromtime: { type: String, required: true },
  Todate: { type: String, required: true },
  Totime: { type: String, required: true },
  Noofrooms: { type: Number, required: true },
  Roomtype_code: { type: String, required: true },
  Noofpax: { type: String, required: true },
  Noofchild: { type: Number, default: 0 },
  Rate_code: { type: String, required: true },
  Roomrent: { type: Number, required: true }
},
 { timestamps: true },
 {
    strict: true,
  });

const Item = mongoose.model('BookingDet', bookingDetSchema);
module.exports = Item;