const Property = require("../Schema/Property/PropertySchema");
const Propertytype = require("../Schema/Common/PropertyTypeSchema");
const Roomtype = require("../Schema/Property/RoomtypeSchema");

const Delete = async (req, res) => {
  const { id, type } = req.query;
  console.log("ID:", id);
  console.log("Type:", type);

  if (!id || !type) {
    return res
      .status(400)
      .json({ message: "ID and type are required in the query parameters" });
  }

  try {
    let result;

    // Property
    if (type === "Property") {
      result = await Property.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ message: "Property Deleted Successfully", result });
    }
    // Property Type
    else if (type === "Propertytype") {
      result = await Propertytype.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ message: "Propertytype Deleted Successfully", result });
    }
    // Room Type
    else if (type === "Roomtype") {
      result = await Roomtype.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ message: "Roomtype Deleted Successfully", result });
    } else {
      return res.status(400).json({ message: "Invalid type provided" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Data Deletion Failed", error: error.message });
  }
};

module.exports = { Delete };
