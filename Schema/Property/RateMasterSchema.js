const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    RateId: { type: Number, required: false },
    RoomCode: { type: String, required: true },
    PropertyCode: { type: String, required: true },
    EntryDate: { type: String, required: true },
    SingleTarrif: { type: Number, required: false },
    DoubleTarrif: { type: Number, required: false },
    RatePlan: { type: String, required: false },
    TripleTarrif: { type: Number, required: false },
    ExtraBedCharges: { type: Number, required: false },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("RateMaster", Schema);

module.exports = Item;
