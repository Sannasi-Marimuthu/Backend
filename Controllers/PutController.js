


const mongoose = require("mongoose");
const fsSync = require("fs");
const path = require("path");
const Property = require("../Schema/Property/PropertySchema");
const Propertytype = require("../Schema/Common/PropertyTypeSchema");
const Roomtype = require("../Schema/Property/RoomtypeSchema");
const Roomview = require("../Schema/Common/RoomviewSchema");
const Bedview = require("../Schema/Common/BedviewSchema");
const Measurement = require("../Schema/Common/MeasurementSchema");
const Amenities = require("../Schema/Common/AmenitiesSchema");
const AmenitiesCategory = require("../Schema/Common/AmenitiesCategorySchema");
const Transport = require("../Schema/Common/TransportSchema");
const User = require("../Schema/Property/UserSchema");
const Rate = require("../Schema/Property/RateMasterSchema");
const Inventory = require("../Schema/Property/InventorySchema");
const Ratings = require("../Schema/Property/RatingsSchema");
const RatePlan = require("../Schema/Property/RatePlanSchema");
const Conference = require("../Schema/Property/ConferenceRoom");
const PropertyOwner = require("../Schema/Property/PropertyOwnerType");
const Utility = require("../Schema/Property/UtilitySchema");
const Ota = require("../Schema/Property/OtaSchema");
const UserProperty = require("../Schema/Common/UserPropertySchema");
const PolicyType = require("../Schema/Common/PolicyTypeSchema");
const File = require("../Schema/FileSchema");
const crypto = require("crypto");
const moment = require("moment");
const nodemailer = require("nodemailer");

const Update = async (req, res) => {
  const uploadDir = "Uploads/";
  const { id, type } = req.query;
  console.log("Query:", { id, type });
  console.log("req.body:", JSON.stringify(req.body, null, 2));
  console.log("req.files:", req.files);

  if (!id || !type) {
    return res
      .status(400)
      .json({ message: "ID and type are required in the query parameters" });
  }

  try {
    if (type === "Propertymaster") {
      const formData = req.body;
      const propertyId = req.query.id;
      console.log(
        "Propertymaster Update - formData:",
        JSON.stringify(formData, null, 2)
      );
      console.log("Propertymaster Update - req.files:", req.files);

      // Find existing property
      const existingProperty = await Property.findById(propertyId);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check for duplicate property name
      const duplicateProperty = await Property.findOne({
        Propertyname: { $regex: `^${formData.Propertyname}$`, $options: "i" },
        _id: { $ne: propertyId },
      });
      if (duplicateProperty) {
        return res.status(400).json({
          message: "Property Name already exists. Please use a different Name.",
        });
      }

      if (!formData.Propertycode) {
        return res.status(400).json({ message: "Propertycode is required" });
      }

      // Initialize utilities array
      let utilities = existingProperty.Utilities || [];

      // Handle existing utility files
      if (formData.ExistingUtilityFile) {
        const existingUtilityFiles = Array.isArray(formData.ExistingUtilityFile)
          ? formData.ExistingUtilityFile
          : [formData.ExistingUtilityFile];
        console.log("ExistingUtilityFiles:", existingUtilityFiles);

        // Filter utilities to keep only those with existing files
        utilities = utilities.filter((util) =>
          existingUtilityFiles.some((file) =>
            util.photos.some((photo) => photo.filename === file)
          )
        );

        // Add existing files to utilities if not present
        existingUtilityFiles.forEach((file, index) => {
          const existingUtil = utilities.find((util) =>
            util.photos.some((photo) => photo.filename === file)
          );
          if (!existingUtil) {
            utilities.push({
              billType:
                (Array.isArray(formData.UtilityType)
                  ? formData.UtilityType[index]
                  : formData.UtilityType) || "Property Tax",
              photos: [{ filename: file.replace(/\\/g, "/") }],
            });
          }
        });
      } else if (!req.files || req.files.length === 0) {
        // Clear utilities if no existing or new files
        utilities = [];
      }

      const tempFiles = [];

      // Handle new utility files
      if (req.files && req.files.length > 0) {
        const utilityFiles = req.files.filter(
          (file) => file.fieldname === "UtilityFile"
        );
        console.log("UtilityFiles:", utilityFiles);

        const utilityTypes = Array.isArray(formData.UtilityType)
          ? formData.UtilityType
          : formData.UtilityType
          ? [formData.UtilityType]
          : [];
        console.log("UtilityTypes:", utilityTypes);

        // Ensure Utilities directory exists
        const utilitiesDir = path.join(
          uploadDir,
          formData.Propertycode,
          "Utilities"
        );
        if (!fsSync.existsSync(utilitiesDir)) {
          fsSync.mkdirSync(utilitiesDir, { recursive: true });
          console.log(`Created Utilities directory: ${utilitiesDir}`);
        }

        // Process new utility files
        utilityFiles.forEach((file, index) => {
          if (!file || !file.path || !file.filename) {
            console.log(
              `Skipping invalid UtilityFile at index ${index}:`,
              file
            );
            return;
          }

          const relativePath = path.join(
            formData.Propertycode,
            "Utilities",
            file.filename
          );
          const targetPath = path.join(uploadDir, relativePath);

          // File should already be in the correct location (handled by multer)
          console.log(`UtilityFile saved at: ${file.path}`);

          tempFiles.push(file.path);

          // Add or update utility
          const billType = utilityTypes[index] || "Unknown";
          const existingUtilIndex = utilities.findIndex(
            (util) => util.billType === billType
          );
          if (existingUtilIndex >= 0) {
            utilities[existingUtilIndex].photos.push({
              filename: relativePath.replace(/\\/g, "/"),
            });
          } else {
            utilities.push({
              billType,
              photos: [{ filename: relativePath.replace(/\\/g, "/") }],
            });
          }
        });
      } else {
        console.log("No utility files uploaded in req.files");
        if (formData.UtilityType && (!req.files || req.files.length === 0)) {
          return res.status(400).json({
            message: "UtilityType provided without corresponding UtilityFile",
          });
        }
      }

      // Prepare updated property data
      const updatedPropertyData = {
        ...formData,
        Utilities: utilities,
      };

      // Remove temporary fields
      delete updatedPropertyData.UtilityType;
      delete updatedPropertyData.UtilityFile;
      delete updatedPropertyData.ExistingUtilityFile;

      // Update the property
      const updatedProperty = await Property.findByIdAndUpdate(
        propertyId,
        updatedPropertyData,
        { new: true }
      );

      res.status(200).json({
        message: "Property updated successfully",
        data: updatedProperty,
      });
    } else if (type === "Propertytype") {
      // ... (rest of the type handlers remain unchanged)
      const PropertytypeData = req.body;
      const duplicateProperty = await Propertytype.findOne({
        PropertyName: {
          $regex: `^${PropertytypeData.PropertyName}$`,
          $options: "i",
        },
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res
          .status(400)
          .json({ message: "Property Type is already exist" });
      }
      const masters = await Propertytype.findByIdAndUpdate(
        id,
        PropertytypeData,
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Propertytype Updated Successfully", masters });
    } else if (type === "Transport") {
      const TransportData = req.body;
      const duplicateProperty = await Transport.findOne({
        Transport: { $regex: `^${TransportData.Transport}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res
          .status(400)
          .json({ message: "Mode of Transport is already exist" });
      }
      const masters = await Transport.findByIdAndUpdate(id, TransportData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Transport Updated Successfully", masters });
    } else if (type === "Roomtype") {
      const RoomtypeData = req.body;
      const duplicateProperty = await Roomtype.findOne({
        Displayname: { $regex: `^${RoomtypeData.Displayname}$`, $options: "i" },
        PropertyCode: RoomtypeData.PropertyCode,
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res
          .status(400)
          .json({ message: "Display Name is already exist" });
      }
      const masters = await Roomtype.findByIdAndUpdate(id, RoomtypeData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Roomtype Updated Successfully", masters });
    } else if (type === "Roomview") {
      const RoomViewData = req.body;
      const duplicateProperty = await Roomview.findOne({
        RoomView: { $regex: `^${RoomViewData.RoomView}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res.status(400).json({ message: "Room View is already exist" });
      }
      const masters = await Roomview.findByIdAndUpdate(id, RoomViewData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Roomview Updated Successfully", masters });
    } else if (type === "Bedtype") {
      const BedTypeData = req.body;
      const duplicateProperty = await Bedview.findOne({
        BedType: { $regex: `^${BedTypeData.BedType}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res.status(400).json({ message: "Bed View is already exist" });
      }
      const masters = await Bedview.findByIdAndUpdate(id, BedTypeData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Bedview Updated Successfully", masters });
    } else if (type === "Amenities") {
      const AmenitiesData = req.body;
      const duplicateProperty = await Amenities.findOne({
        Amenities: { $regex: `^${AmenitiesData.Amenities}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res
          .status(400)
          .json({ message: "Amenities Name is already exist" });
      }
      const masters = await Amenities.findByIdAndUpdate(id, AmenitiesData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Amenities Updated Successfully", masters });
    } else if (type === "AmenitiesCategory") {
      const AmenitiesCategoryData = req.body;
      const duplicateProperty = await AmenitiesCategory.findOne({
        AmenitiesCategory: {
          $regex: `^${AmenitiesCategoryData.AmenitiesCategory.replace(
            /\s+/g,
            "\\s*"
          )}$`,
          $options: "i",
        },
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res
          .status(400)
          .json({ message: "Amenities Category already exists" });
      }
      const masters = await AmenitiesCategory.findByIdAndUpdate(
        id,
        AmenitiesCategoryData,
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ message: "Amenities Category Updated Successfully", masters });
    } else if (type === "Usertype") {
      try {
        const { UserName, Password, UserType, Email } = req.body;
        const duplicateProperty = await User.findOne({
          Email: { $regex: `^${Email}$`, $options: "i" },
          _id: { $ne: id },
        });

        if (duplicateProperty) {
          return res.status(400).json({ message: "Email already exists" });
        }
        const updatedFields = { UserName, UserType, Email };

        if (Password) {
          updatedFields.Password = crypto
            .createHash("sha256")
            .update(Password)
            .digest("hex");
        }

        const user = await User.findByIdAndUpdate(id, updatedFields, {
          new: true,
        });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user });
      } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
      }
    } else if (type === "Userproperty") {
      const UserPropertyData = req.body;
      const duplicateProperty = await UserProperty.findOne({
        Email: { $regex: `^${UserPropertyData.Email}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const masters = await UserProperty.findByIdAndUpdate(
        id,
        UserPropertyData,
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "User Property Updated Successfully", masters });
    } else if (type === "Filetype") {
      const fileData = req.body;

      if (req.body.editMode === "singleImage") {
        const existingRecord = await File.findById(id);
        if (!existingRecord) {
          return res.status(404).json({ message: "Record not found" });
        }

        const categoryField = req.body.categoryField;
        let imagesArray = existingRecord[categoryField] || [];
        const imageIndex = parseInt(req.body.imageIndex);

        if (
          req.files &&
          req.files.length > 0 &&
          req.files[0].fieldname === "newImage"
        ) {
          const newImage = req.files[0].filename;
          imagesArray[imageIndex] = newImage;

          const updateData = { [categoryField]: imagesArray };
          const updatedRecord = await File.findByIdAndUpdate(id, updateData, {
            new: true,
          });

          if (!updatedRecord) {
            return res.status(404).json({ message: "Image not found" });
          }

          return res.status(200).json(updatedRecord);
        } else {
          return res
            .status(400)
            .json({ message: "No replacement image provided" });
        }
      } else {
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            fileData[file.fieldname] = fileData[file.fieldname] || [];
            fileData[file.fieldname].push(file.filename);
          }
        } else {
          const existingRecord = await File.findById(id);
          if (!existingRecord) {
            return res.status(404).json({ message: "Record not found" });
          }
          fileData.CoverImage = existingRecord.CoverImage || [];
          fileData.PropertyImage = existingRecord.PropertyImage || [];
          fileData.RoomImage = existingRecord.RoomImage || [];
        }

        const updatedRoomType = await File.findByIdAndUpdate(id, fileData, {
          new: true,
        });
        if (!updatedRoomType) {
          return res.status(404).json({ message: "Image not found" });
        }

        return res.status(200).json(updatedRoomType);
      }
    } else if (type === "RateMaster") {
      const RoomtypeData = req.body;
      const masters = await Rate.findByIdAndUpdate(id, RoomtypeData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Rate Master Updated Successfully", masters });
    } else if (type === "InventoryMaster") {
      const InventoryData = req.body;
      const masters = await Inventory.findByIdAndUpdate(id, InventoryData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Inventory Master Updated Successfully", masters });
    } else if (type === "PolicyType") {
      const PolicyTypes = req.body;
      const duplicateProperty = await PolicyType.findOne({
        PolicyType: {
          $regex: `^${PolicyTypes.PolicyType.replace(/\s+/g, "\\s*")}$`,
          $options: "i",
        },
        _id: { $ne: id },
      });

      if (duplicateProperty) {
        return res.status(400).json({ message: "Policy Type already exists" });
      }
      const masters = await PolicyType.findByIdAndUpdate(id, PolicyTypes, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Policy Type Updated Successfully", masters });
    } else if (type === "Ratings") {
      const RatingsData = req.body;
      const masters = await Ratings.findByIdAndUpdate(id, RatingsData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Ratings & Reviews Updated Successfully", masters });
    } else if (type === "RatePlan") {
      const RatesData = req.body;
      const masters = await RatePlan.findByIdAndUpdate(id, RatesData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Rate Plan Updated Successfully", masters });
    } else if (type === "ConferenceRoom") {
      try {
        const { Slots, PropertyCode, HallName, RoomType, Capacity, Amenities } =
          req.body;

        let formattedSlots;
        if (Slots && Array.isArray(Slots)) {
          formattedSlots = Slots.map((slot) => {
            if (slot.slotName) {
              return {
                slotName: slot.slotName,
                from: slot.from,
                to: slot.to,
                price: slot.price,
                availability: slot.availability,
              };
            } else {
              const slotKey = Object.keys(slot)[0];
              const slotData = slot[slotKey];
              return {
                slotName: slotKey,
                from: slotData.from,
                to: slotData.to,
                price: slotData.price,
                availability: slotData.availability,
              };
            }
          });
        }

        const updateData = {};
        if (formattedSlots) updateData.Slots = formattedSlots;
        if (PropertyCode !== undefined) updateData.PropertyCode = PropertyCode;
        if (HallName) updateData.HallName = HallName;
        if (RoomType) updateData.RoomType = RoomType;
        if (Capacity) updateData.Capacity = Capacity;
        if (Amenities) updateData.Amenities = Amenities;

        const updatedConference = await Conference.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        );

        if (!updatedConference) {
          return res.status(404).json({ message: "Conference Room not found" });
        }

        return res.status(200).json({
          message: "ConferenceRoom Updated Successfully",
          masters: updatedConference,
        });
      } catch (error) {
        console.error("Error updating ConferenceRoom:", error);
        return res.status(500).json({
          message: "Error updating ConferenceRoom",
          error: error.message,
        });
      }
    } else if (type === "PropertyOwnertype") {
      const PropertyOwnerData = req.body;
      const masters = await PropertyOwner.findByIdAndUpdate(
        id,
        PropertyOwnerData,
        { new: true }
      );
      return res.status(200).json({
        message: "Property Owner Type Updated Successfully",
        masters,
      });
    } else if (type === "UtilityType") {
      const UtilityData = req.body;
      const masters = await Utility.findByIdAndUpdate(id, UtilityData, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Utility Type Updated Successfully", masters });
    } else if (type === "Ota") {
      const OtaData = req.body;
      const masters = await Ota.findByIdAndUpdate(id, OtaData, { new: true });
      return res
        .status(200)
        .json({ message: "Ota Updated Successfully", masters });
    } else {
      return res.status(400).json({ message: "Invalid type provided" });
    }
  } catch (error) {
    console.error("Error in Update:", error);
    return res
      .status(500)
      .json({ message: "Updation Failed", error: error.message });
  }
};

module.exports = { Update };