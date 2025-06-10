const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    InventoryId: { type: Number, required: true },
    RoomCode: { type: String, required: true },
    AvailableDate: { type: String, required: false },
    AvailableRooms: { type: Number, required: false },
    TotalRooms: { type: Number, required: false },
    BookedRooms: { type: Number, required: true, default: 0 }, // Starts at 0, set by schema
    StopSales: { type: Number, required: false },
    RatePlan: { type: String, required: false },
    PropertyCode: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("Inventory", Schema);

module.exports = Item;
