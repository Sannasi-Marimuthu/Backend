const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    TemplateType: { type: String, required: true },
    TemplateName: { type: String, required: false },
    Content: { type: String, required: true },
    PropertyCode: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("Email", Schema);

module.exports = Item;
