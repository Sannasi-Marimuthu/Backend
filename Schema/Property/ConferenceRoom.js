const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema({
  slotName: { type: String, required: true }, // e.g., "Slot-1", "Slot-2"
  from: { type: String, required: true },
  to: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Number, required: true },
});

const Schema = new mongoose.Schema(
  {
    PropertyCode: { type: String, required: true },
    // RoomCode: { type: String, required: true },
    Slots: { type: [SlotSchema], required: true },
    HallName: { type: String, required: true },
    RoomType: { type: String, required: true },
    Amenities: { type: [String], required: false },
    Capacity: { type: Number, required: true },
    ConferenceImage: { type: String, required: false },
    // Availability: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("ConferenceRoom", Schema);

module.exports = Item;
