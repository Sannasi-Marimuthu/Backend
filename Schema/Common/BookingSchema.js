const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    BkId: { type: String, required: true }, // Maps to bookingMas.Bkid
    title: { type: String, required: true }, // From document.getElementById("title").value
    PropertyName: { type: String, required: true }, // From propertyData?.Propertyname
    firstName: { type: String, required: true }, // From firstName
    lastName: { type: String, required: true }, // From lastName
    mobile: { type: String, required: true }, // From mobileValue
    ArrivalDate: { type: Date, required: true }, // From sessionData.entryDate
    DepartureDate: { type: Date, required: true }, // From sessionData.exitDate
    NumberofPax: { type: String, required: true }, // From sessionData.guest
    email: { type: String, required: true }, // From email
    gstNumber: { type: Number, required: false }, // From gstNumber (optional)
    companyName: { type: String, required: false }, // From companyName (optional)
    companyAddress: { type: String, required: false }, // From address (optional)
    companyPhone: { type: String, required: false }, // From phone (optional)
    noofrooms: { type: Number, required: true }, // From totalRooms
    totalAmount: { type: Number, required: true }, // From totalAmountToBePaid
  },
  {
    strict: false, // Allows additional fields not defined in the schema
  }
);

const Item = mongoose.model("BookingSchema", Schema);

module.exports = Item;
