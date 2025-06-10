const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    TemplateId: { type: Number, required: true },
    TemplateName: { type: String, required: true },
  },
  {
    strict: false,
  }
);

const Item = mongoose.model("Templatetype", Schema);

module.exports = Item;
