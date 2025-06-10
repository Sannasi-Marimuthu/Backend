const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    Propertyname: { type: String, required: true }, //
    Propertydescription: { type: String, required: false },
    Yearofconstruction: { type: Number, required: false }, //
    Displayname: { type: String, required: true },
    Propertytype: { type: String, required: true }, //
    Noofrooms: { type: Number, required: true },
    Noofrestaurants: { type: Number, required: false },
    Nooffloors: { type: Number, required: false },
    Currency: { type: String, required: false },
    Timezone: { type: String, required: false },
    Checkin: { type: String, required: true }, //
    Checkout: { type: String, required: true }, //
    Status: { type: Number, required: false },
    DivisionType: { type: String, required: true }, //
    RatingId: { type: String, required: true }, //
    Propertycode: { type: String, required: true },
    Hotelphone: { type: Number, require: false },
    Hotelmobile: { type: Number, require: true }, //
    Hotelemail: { type: String, require: true }, //
    Phonelist: { type: String, require: false }, //
    Websitelist: { type: String, require: false },
    Emaillist: { type: String, require: false },
    Customercare: { type: Number, require: true },
    Propertyaddress: { type: String, require: true }, //
    Latitude: { type: String, require: true },
    Longitude: { type: String, require: true },
    Bestroute: { type: String, require: false },
    From: { type: String, require: false },
    Modeoftransport: { type: String, require: false },
    PropertyOwner: { type: String, required: true }, //
    Smoking: { type: String, required: false },
    SmokingRoom: { type: Number, required: false },
    AccountNumber: { type: String, required: false }, //
    IFSCCode: { type: String, required: false }, //
    Branch: { type: String, required: false }, //
    BankName: { type: String, required: false }, //
    UtilityType: { type: String, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("PropertyMaster", Schema);

module.exports = Item;

// const mongoose = require("mongoose");

// const Schema = new mongoose.Schema(
//   {
//     Propertyname: { type: String, required: true },
//     Propertydescription: { type: String, required: false },
//     Yearofconstruction: { type: Number, required: false },
//     Displayname: { type: String, required: true },
//     Propertytype: { type: String, required: true },
//     Noofrooms: { type: Number, required: true },
//     Noofrestaurants: { type: Number, required: false },
//     Nooffloors: { type: Number, required: false },
//     Currency: { type: String, required: false },
//     Timezone: { type: String, required: false },
//     Checkin: { type: String, required: true },
//     Checkout: { type: String, required: true },
//     Status: { type: Number, required: false, default: 1 },
//     DivisionType: { type: String, required: true },
//     RatingId: { type: String, required: true },
//     Propertycode: { type: String, required: true },
//     Hotelphone: { type: Number, required: false },
//     Hotelmobile: { type: Number, required: true },
//     Hotelemail: { type: String, required: true },
//     Phonelist: { type: String, required: false },
//     Websitelist: { type: String, required: false },
//     Emaillist: { type: String, required: false },
//     Customercare: { type: Number, required: true },
//     Propertyaddress: { type: String, required: true },
//     Latitude: { type: String, required: true },
//     Longitude: { type: String, required: true },
//     City: { type: String, required: false },
//     Area: { type: String, required: false },
//     Entry: [
//       {
//         Transport: String,
//         BestRoute: String,
//         Radius: String,
//       },
//     ],
//     Bestroute: { type: String, required: false },
//     From: { type: String, required: false },
//     Modeoftransport: { type: String, required: false },
//     PropertyOwner: { type: String, required: true },
//     Smoking: { type: String, required: false },
//     SmokingRoom: { type: Number, required: false },
//     AccountNumber: { type: String, required: false },
//     IFSCCode: { type: String, required: false },
//     Branch: { type: String, required: false },
//     BankName: { type: String, required: false },
//     Utilities: [
//       {
//         billType: { type: String, required: false },
//         file: { type: String, required: false }, // Store filename
//         path: { type: String, required: false }, // Optional: store full path
//       },
//     ],
//   },
//   {
//     strict: false,
//     timestamps: true,
//   }
// );

// const Item = mongoose.model("PropertyMaster", Schema);

// module.exports = Item;