const express = require("express");
const router = express.Router();
const multer = require("multer");
const fsSync = require("fs"); // Synchronous fs for existsSync and mkdirSync
const fs = require("fs").promises; // Promise-based fs for async cleanup
const path = require("path");
const mongoose = require("mongoose");
const moment = require("moment"); // Added for time validation

const PostController = require("../Controllers/PostController");
const GetController = require("../Controllers/GetController");
const UpdateController = require("../Controllers/PutController");
const DeleteController = require("../Controllers/DeleteController");
const Property = require("../Schema/Property/PropertySchema");
const Roomtype = require("../Schema/Property/RoomtypeSchema");
const Rate = require("../Schema/Property/RateMasterSchema");
const RatePlan = require("../Schema/Property/RoomRateLinkSchema");
const Rateplans = require("../Schema/Property/RatePlanSchema");
const Inventory = require("../Schema/Property/InventorySchema");
const AmenitiesMaster = require("../Schema/Property/AmenitiesMasterSchema");
const Policies = require("../Schema/Property/PolicyMasterSchema");
const File = require("../Schema/FileSchema.js");
const uploadVideo = require("../Controllers/Vedio");

const uploadDir = "Uploads/";
const webDir = "Web/"; // Source directory for existing images

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let propertyCode = req.body.Propertycode || "temp";
    const imageFields = [
      "propertyImages",
      "facadeImages",
      "lobbyImages",
      "receptionImages",
      "corridorsImages",
      "liftElevatorsImages",
      "bathroomImages",
      "parkingImages",
      "otherAreasImages",
      "CoverImage",
      "PropertyImage",
      "RoomImage",
      "UtilityFile",
    ];

    const parts = file.fieldname.split("_");
    let destDir;

    if (
      file.fieldname.startsWith("UtilityFile") ||
      file.fieldname === "UtilityFile"
    ) {
      destDir = path.join(uploadDir, propertyCode, "Utilities");
    } else if (parts[0] === "roomFiles" && parts.length >= 4) {
      const roomCode = parts[2];
      destDir = path.join(uploadDir, propertyCode, roomCode);
    } else if (parts[0] === "imageFiles" && parts.length >= 4) {
      const fieldName = parts[2];
      if (imageFields.includes(fieldName)) {
        destDir = path.join(uploadDir, propertyCode, fieldName);
      } else {
        destDir = path.join(uploadDir, "temp");
      }
    } else if (parts[0] === "PropertyImage") {
      destDir = path.join(uploadDir, propertyCode, "PropertyImage");
    } else if (parts[0] === "CoverImage") {
      destDir = path.join(uploadDir, propertyCode, "CoverImage");
    } else {
      destDir = path.join(uploadDir, "temp");
    }

    try {
      if (!fsSync.existsSync(destDir)) {
        fsSync.mkdirSync(destDir, { recursive: true });
        console.log(`Created directory: ${destDir}`);
      }
      console.log(`Multer destination: ${destDir}`);
      cb(null, destDir);
    } catch (err) {
      console.error(`Error creating directory ${destDir}:`, err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log(
      `Multer filename: ${uniqueSuffix}${path.extname(file.originalname)}`
    );
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  // limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (uncomment if needed)
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP, GIF, and AVIF images are allowed"));
    }
  },
});

// Utility function to process utility files
// const processUtilities = (files, formData) => {
//   const utilities = [];

//   // Debug req.files
//   console.log(
//     "Files received:",
//     files.map((f) => ({ fieldname: f.fieldname, originalname: f.originalname }))
//   );

//   // Debug formData keys and values
//   console.log("FormData keys:", Object.keys(formData));
//   console.log("FormData values:", Object.values(formData));

//   // Extract indices from formData (UtilityType[<number>], ExistingUtilityFile[<number>]) and files (UtilityFile[<number>])
//   const formDataIndices = [
//     ...new Set(
//       Object.keys(formData)
//         .filter((key) =>
//           key.match(/^(UtilityType|ExistingUtilityFile)\[\d+\]$/)
//         )
//         .map((key) => key.match(/\[(\d+)\]/)[1])
//     ),
//   ];

//   const fileIndices = [
//     ...new Set(
//       files
//         .filter((f) => f.fieldname.match(/^UtilityFile\[\d+\]$/))
//         .map((f) => f.fieldname.match(/\[(\d+)\]/)[1])
//     ),
//   ];

//   // Combine indices from formData and files
//   const indices = [...new Set([...formDataIndices, ...fileIndices])];

//   console.log("Utility indices (formData):", formDataIndices);
//   console.log("Utility indices (files):", fileIndices);
//   console.log("Combined indices:", indices);

//   // Handle UtilityType as an array if present
//   const utilityTypes = Array.isArray(formData.UtilityType)
//     ? formData.UtilityType
//     : [];

//   indices.forEach((index) => {
//     // Prefer indexed UtilityType[<number>], fall back to UtilityType array
//     let utilityType = formData[`UtilityType[${index}]`];
//     if (!utilityType && utilityTypes[index]) {
//       utilityType = utilityTypes[index];
//     }
//     utilityType = utilityType || "Unknown"; // Final fallback

//     const utilityFile = files.find(
//       (f) => f.fieldname === `UtilityFile[${index}]`
//     );
//     const existingFile = formData[`ExistingUtilityFile[${index}]`];

//     console.log(`Processing index ${index}:`, {
//       utilityType,
//       hasUtilityFile: !!utilityFile,
//       existingFile,
//     });

//     const utility = { billType: utilityType, photos: [] };

//     if (utilityFile) {
//       const relativePath = path
//         .join(formData.Propertycode, "Utilities", utilityFile.filename)
//         .replace(/\\/g, "/");
//       utility.photos.push({ filename: relativePath });
//       console.log(`Added new file for ${utilityType}: ${relativePath}`);
//     }

//     if (existingFile) {
//       utility.photos.push({ filename: existingFile.replace(/\\/g, "/") });
//       console.log(`Added existing file for ${utilityType}: ${existingFile}`);
//     }

//     if (utility.photos.length > 0) {
//       utilities.push(utility);
//       console.log(`Utility added:`, utility);
//     } else {
//       console.warn(`No photos for ${utilityType} at index ${index}, skipping`);
//     }
//   });

//   console.log("Final utilities:", utilities);
//   return utilities;
// };

// Utility function to process utility files
const processUtilities = (files, formData) => {
  const utilities = [];

  // Debug req.files
  console.log(
    'Files received:',
    files.map((f) => ({ fieldname: f.fieldname, originalname: f.originalname }))
  );

  // Debug formData keys and values
  console.log('FormData keys:', Object.keys(formData));
  console.log('FormData values:', Object.values(formData));

  // Extract indices from formData (UtilityType[<number>], ExistingUtilityFile[<number>])
  const formDataIndices = [
    ...new Set(
      Object.keys(formData)
        .filter((key) => key.match(/^(UtilityType|ExistingUtilityFile)\[\d+\]$/))
        .map((key) => key.match(/\[(\d+)\]/)[1])
    ),
  ];

  const fileIndices = [
    ...new Set(
      files
        .filter((f) => f.fieldname.match(/^UtilityFile\[\d+\]$/))
        .map((f) => f.fieldname.match(/\[(\d+)\]/)[1])
    ),
  ];

  // Handle UtilityType and ExistingUtilityFile as arrays if present
  const utilityTypes = Array.isArray(formData.UtilityType) ? formData.UtilityType : [];
  const existingFiles = Array.isArray(formData.ExistingUtilityFile)
    ? formData.ExistingUtilityFile
    : [];

  // Combine indices from formData, files, and array fields
  const arrayIndices = utilityTypes.length > 0 || existingFiles.length > 0 ? ['0'] : [];
  const indices = [...new Set([...formDataIndices, ...fileIndices, ...arrayIndices])];

  console.log('Utility indices (formData):', formDataIndices);
  console.log('Utility indices (files):', fileIndices);
  console.log('Utility indices (arrays):', arrayIndices);
  console.log('Combined indices:', indices);

  indices.forEach((index) => {
    // Prefer indexed UtilityType[<number>], fall back to UtilityType array
    let utilityType = formData[`UtilityType[${index}]`];
    if (!utilityType && utilityTypes[index]) {
      utilityType = utilityTypes[index];
    }
    utilityType = utilityType || 'Unknown'; // Final fallback

    const utilityFile = files.find((f) => f.fieldname === `UtilityFile[${index}]`);
    let existingFile = formData[`ExistingUtilityFile[${index}]`];
    if (!existingFile && existingFiles[index]) {
      existingFile = existingFiles[index];
    }

    console.log(`Processing index ${index}:`, {
      utilityType,
      hasUtilityFile: !!utilityFile,
      existingFile,
    });

    const utility = { billType: utilityType, photos: [] };

    if (utilityFile) {
      const relativePath = path
        .join(formData.Propertycode, 'Utilities', utilityFile.filename)
        .replace(/\\/g, '/');
      utility.photos.push({ filename: relativePath });
      console.log(`Added new file for ${utilityType}: ${relativePath}`);
    }

    if (existingFile) {
      utility.photos.push({ filename: existingFile.replace(/\\/g, '/') });
      console.log(`Added existing file for ${utilityType}: ${existingFile}`);
    }

    if (utility.photos.length > 0) {
      utilities.push(utility);
      console.log(`Utility added:`, utility);
    } else {
      console.warn(`No photos for ${utilityType} at index ${index}, skipping`);
    }
  });

  console.log('Final utilities:', utilities);
  return utilities;
};

router.patch("/update1", upload.any(), async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const { id, type } = req.query;

    // Validate type
    if (type !== "Propertymaster") {
      return res.status(400).json({
        error: "INVALID_TYPE",
        message: "Invalid type specified",
      });
    }

    // Validate ID
    if (!id) {
      return res.status(400).json({
        error: "MISSING_ID",
        message: "ID is required for update",
      });
    }

    // Destructure form data
    const {
      Propertyname,
      Propertydescription,
      Yearofconstruction,
      Displayname,
      Propertytype,
      Noofrooms,
      Noofrestaurants,
      Nooffloors,
      Currency,
      Timezone,
      Checkin,
      Checkout,
      DivisionType,
      PropertyOwner,
      Smoking,
      SmokingRoom,
      RatingId,
      Propertycode,
      Hotelphone,
      Hotelmobile,
      Hotelemail,
      Phonelist,
      Websitelist,
      Emaillist,
      Customercare,
      Propertyaddress,
      Latitude,
      Longitude,
      City,
      Area,
      Entry,
      MdName,
      MdMail,
      MdPhone,
      AccountNumber,
      IFSCCode,
      Branch,
      BankName,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      Propertyname,
      Propertydescription,
      Yearofconstruction,
      Displayname,
      Propertytype,
      Noofrooms,
      Checkin,
      Checkout,
      Propertycode,
      Hotelphone,
      Hotelmobile,
      Hotelemail,
      Customercare,
      Propertyaddress,
      City,
      Area,
      MdName,
      MdMail,
      MdPhone,
      AccountNumber,
      IFSCCode,
      Branch,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key] || requiredFields[key].trim() === ""
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: `Missing or empty required fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Hotelemail) || !emailRegex.test(MdMail)) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid email format for Hotelemail or MdMail",
      });
    }

    // Validate Propertycode format
    if (!/^[a-zA-Z0-9]{6}$/.test(Propertycode)) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Propertycode must be a 6-character alphanumeric string",
      });
    }

    // Validate Yearofconstruction
    const currentYear = new Date().getFullYear();
    const year = parseInt(Yearofconstruction, 10);
    if (isNaN(year) || year < 1800 || year > currentYear) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: `Yearofconstruction must be between 1800 and ${currentYear}`,
      });
    }

    // Validate numeric fields
    const numericFields = {
      Noofrooms,
      Noofrestaurants,
      Nooffloors,
      SmokingRoom,
      Latitude,
      Longitude,
    };
    for (const [key, value] of Object.entries(numericFields)) {
      if (value && (isNaN(value) || Number(value) < 0)) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: `${key} must be a non-negative number`,
        });
      }
    }

    // Validate time formats
    if (Checkin && !moment(Checkin, "h:mm A", true).isValid()) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Checkin must be in valid time format (e.g., 2:00 PM)",
      });
    }
    if (Checkout && !moment(Checkout, "h:mm A", true).isValid()) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Checkout must be in valid time format (e.g., 2:00 PM)",
      });
    }

    // Parse and validate Entry (transport entries)
    const parsedEntry = typeof Entry === "string" ? JSON.parse(Entry) : Entry;
    if (!Array.isArray(parsedEntry)) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Entry must be an array",
      });
    }
    const formattedEntry = parsedEntry.map((entry) => {
      if (!entry.Transport || !entry.BestRoute || !entry.Radius) {
        throw new Error("Invalid transport entry data");
      }
      return {
        Transport: entry.Transport,
        BestRoute: entry.BestRoute,
        Radius: entry.Radius,
      };
    });

    // Check for duplicate Propertyname
    const duplicateProperty = await Property.findOne({
      Propertyname: { $regex: `^${Propertyname}$`, $options: "i" },
      _id: { $ne: id },
    });
    if (duplicateProperty) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Property Name already exists. Please use a different Name.",
      });
    }

    // Process utility files (directory already created by multer)
    const utilities = processUtilities(req.files || [], req.body);

    // Validate utilities
    if (utilities.length === 0) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message:
          "At least one utility with type and file (new or existing) is required",
      });
    }

    // Prepare update data
    const updateData = {
      Propertyname,
      Propertydescription,
      Yearofconstruction: Number(Yearofconstruction),
      Displayname,
      Propertytype,
      Noofrooms: Number(Noofrooms),
      Noofrestaurants: Number(Noofrestaurants) || 0,
      Nooffloors: Number(Nooffloors) || 0,
      Currency,
      Timezone,
      Checkin,
      Checkout,
      DivisionType,
      PropertyOwner,
      Smoking,
      SmokingRoom: Number(SmokingRoom) || 0,
      RatingId,
      Propertycode,
      Hotelphone,
      Hotelmobile,
      Hotelemail,
      Phonelist,
      Websitelist,
      Emaillist,
      Customercare,
      Propertyaddress,
      Latitude: Number(Latitude),
      Longitude: Number(Longitude),
      City,
      Area,
      Entry: formattedEntry,
      MdName,
      MdMail,
      MdPhone,
      AccountNumber,
      IFSCCode,
      Branch,
      BankName,
      Utilities: utilities,
    };

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProperty) {
      return res.status(400).json({
        error: "NOT_FOUND",
        message: "Property not found",
      });
    }

    console.log("Property updated in DB:", updatedProperty._id);
    res.status(200).json({
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating Propertymaster:", error);
    // Clean up uploaded files on error
    const utilityFiles = (req.files || []).filter((f) =>
      f.fieldname.includes("UtilityFile")
    );
    for (const file of utilityFiles) {
      await fs
        .unlink(file.path)
        .catch((err) => console.error(`Failed to delete ${file.path}:`, err));
    }
    res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message || "Failed to update property",
    });
  }
});

// Add other routes (PostController, GetController, etc.) here
// router.post('/post', PostController.create);
// router.get('/get', GetController.get);
// ...

module.exports = router;
