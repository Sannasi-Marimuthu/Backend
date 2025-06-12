const express = require("express");
const router = express.Router();
const multer = require("multer");
const fsSync = require("fs"); // Synchronous fs for consistency
const fs = require("fs").promises; // Promise-based fs as fallback
const path = require("path");
const moment = require("moment");
const mongoose = require("mongoose");

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
const Conference = require("../Schema/Property/ConferenceRoom.js");
const uploadVideo = require("../Controllers/Vedio");
const uploadDir = "Uploads/";
const webDir = "Web/"; // Source directory for existing images


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let propertyCode = "temp";

    try {
      if (req.body.propertyData) {
        propertyCode = JSON.parse(req.body.propertyData).Propertycode || "temp";
      }
    } catch (err) {
      console.error("Error parsing propertyData:", err);
    }

    const parts = file.fieldname.split("_");
    let destDir;

    if (parts[0] === "utilityFiles") {
      destDir = path.join(uploadDir, propertyCode, "Utilities");
    } else if (parts[0] === "roomFiles" && parts.length >= 4) {
      const roomCode = parts[2];
      destDir = path.join(uploadDir, propertyCode, roomCode);
    } else if (parts[0] === "imageFiles" && parts.length >= 4) {
      const fieldName = parts[2]; // e.g., propertyImages, facadeImages
      destDir = path.join(uploadDir, propertyCode, fieldName);
    } else if (file.fieldname.startsWith("ConferenceImages")) {
      destDir = path.join(uploadDir, propertyCode, "ConferenceImages");
    } else {
      destDir = path.join(uploadDir, "temp");
    }

    try {
      if (!fsSync.existsSync(destDir)) {
        fsSync.mkdirSync(destDir, { recursive: true });
      }
      cb(null, destDir);
    } catch (err) {
      console.error(`Error creating directory ${destDir}:`, err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
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
const processImages = (files, body, PropertyCode) => {
  console.log("processImages - body:", JSON.stringify(body, null, 2));
  console.log("processImages - files:", files);

  const conferenceImages = [];
  const existingImageKeys = Object.keys(body).filter((key) =>
    key.match(/^ExistingConferenceImages\[\d+\]$/)
  );

  console.log("Existing image keys:", existingImageKeys);

  // Process new files
  files.forEach((file) => {
    const match = file.fieldname.match(/^ConferenceImages\[(\d+)\]$/);
    if (match) {
      conferenceImages[Number(match[1])] = path
        .join(PropertyCode, "ConferenceImages", file.filename)
        .replace(/\\/g, "/");
    }
  });

  // Process existing images
  existingImageKeys.forEach((key) => {
    const match = key.match(/^ExistingConferenceImages\[(\d+)\]$/);
    if (match && body[key]) {
      const index = Number(match[1]);
      conferenceImages[index] = body[key];
    }
  });

  // Fallback: Check for any keys resembling ExistingConferenceImages
  Object.keys(body).forEach((key) => {
    if (key.includes("ExistingConferenceImages") && body[key]) {
      console.warn(`Unexpected key found: ${key} = ${body[key]}`);
      conferenceImages.push(body[key]); // Add as a fallback
    }
  });

  const validImages = conferenceImages.filter((img) => img);
  if (validImages.length === 0) {
    console.error("No valid images found. body:", body, "files:", files);
    throw new Error("At least one conference image is required");
  }

  return validImages;
};
// const upload = multer({ storage });
router.post("/post", PostController.Post);
router.get("/get", GetController.Get);
router.put("/update", UpdateController.Update);
router.delete("/delete", DeleteController.Delete);

// Hotel Details page:3
router.get("/getHotelDetails", GetController.GetHotelDetails);
router.get("/getHotelProperty", GetController.PropertyDetails);
router.get("/getHotelImages", GetController.PropertyImages);
router.get("/getHotelRates", GetController.PropertyRates);
router.get("/getHotelAmenities", GetController.PropertyAmenities);
router.get("/getHotelPolicies", GetController.PropertyPolicies);

router.get(
  "/getHotelRatingsandReviews",
  GetController.PropertyRatingsAndReveiws
);
router.get("/getRoomTypeDetails", GetController.GetRoomType);
router.get("/getPaymentPage", GetController.GetPaymentPageDetails);
router.get("/getHotelList", GetController.GetHotelList);

//
router.get("/getMealTypes", GetController.GetMealType); 


router.post("/approval", upload.any(), async (req, res) => {
  let tempFiles = [];
  try {
    const parseJSON = (data, defaultValue, name) => {
      try {
        return data ? JSON.parse(data) : defaultValue;
      } catch (err) {
        throw new Error(`Invalid JSON in ${name}: ${err.message}`);
      }
    };

    // Parse incoming data
    const propertyData = parseJSON(req.body.propertyData, {}, "propertyData");
    const utilitiesData = parseJSON(
      req.body.utilitiesData,
      [],
      "utilitiesData"
    );
    const roomsData = parseJSON(req.body.roomsData, [], "roomsData");
    const roomRateData = parseJSON(req.body.roomRateData, [], "roomRateData");
    const rateplanData = parseJSON(req.body.rateplanData, [], "rateplanData");
    const rateplanDatas = parseJSON(
      req.body.rateplanDatas,
      [],
      "rateplanDatas"
    );
    const inventoryData = parseJSON(
      req.body.inventoryData,
      [],
      "inventoryData"
    );
    const amenitiesData = parseJSON(
      req.body.amenitiesData,
      {},
      "amenitiesData"
    );
    const policiesData = parseJSON(req.body.policiesData, {}, "policiesData");
    const otherImagesData = parseJSON(
      req.body.otherImagesData,
      {},
      "otherImagesData"
    );

    const propertyCode = propertyData.Propertycode;

    // Validate required fields
    if (!propertyCode) {
      throw new Error("Property code is required");
    }
    if (
      !policiesData.PropertyCode ||
      !policiesData.PolicyType ||
      !policiesData.type ||
      !policiesData.Policy
    ) {
      throw new Error("Policies data missing required fields");
    }
    if (policiesData.PropertyCode !== propertyCode) {
      throw new Error(
        "Policies PropertyCode does not match propertyData Propertycode"
      );
    }
    if (
      typeof policiesData.Policy !== "string" ||
      !policiesData.Policy.trim()
    ) {
      throw new Error("Policy field must be a non-empty string");
    }
    if (
      policiesData.PolicyType !== "Property Policy" ||
      policiesData.type !== "Policies"
    ) {
      throw new Error("Invalid PolicyType or type in policiesData");
    }
    // Validate data lengths
    if (roomRateData.length !== roomsData.length) {
      throw new Error("Mismatch between roomsData and roomRateData counts");
    }
    if (rateplanData.length !== roomsData.length) {
      throw new Error("Mismatch between roomsData and rateplanData counts");
    }
    if (rateplanDatas.length !== roomsData.length) {
      throw new Error("Mismatch between roomsData and rateplanDatas counts");
    }
    if (inventoryData.length !== roomsData.length) {
      throw new Error("Mismatch between roomsData and inventoryData counts");
    }
    if (!amenitiesData.PropertyCode) {
      throw new Error("Amenities data missing PropertyCode");
    }

    // Create directories
    const propertyDir = path.join(uploadDir, propertyCode);
    const utilitiesDir = path.join(propertyDir, "Utilities");
    if (!fsSync.existsSync(utilitiesDir)) {
      fsSync.mkdirSync(utilitiesDir, { recursive: true });
    }

    // Create directories for other images
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
      "gst",
    ];
    imageFields.forEach((field) => {
      const dir = path.join(propertyDir, field);
      if (!fsSync.existsSync(dir)) {
        fsSync.mkdirSync(dir, { recursive: true });
      }
    });

    // Process uploaded files
    const utilityFiles = {};
    const roomFiles = {};
    const otherImageFiles = {};
    req.files.forEach((file) => {
      const parts = file.fieldname.split("_");
      if (parts[0] === "utilityFiles" && parts.length === 4) {
        const index = parts[2];
        utilityFiles[index] = utilityFiles[index] || [];
        const relativePath = path.join(
          propertyCode,
          "Utilities",
          file.filename
        );
        utilityFiles[index].push({ filename: relativePath });
        tempFiles.push(file.path);
      } else if (parts[0] === "roomFiles" && parts.length === 4) {
        const roomCode = parts[2];
        roomFiles[roomCode] = roomFiles[roomCode] || [];
        const relativePath = path.join(propertyCode, roomCode, file.filename);
        roomFiles[roomCode].push({ filename: relativePath });
        tempFiles.push(file.path);
      } else if (parts[0] === "imageFiles" && parts.length === 4) {
        const fieldName = parts[2];
        otherImageFiles[fieldName] = otherImageFiles[fieldName] || [];
        const relativePath = path.join(propertyCode, fieldName, file.filename);
        otherImageFiles[fieldName].push({ filename: relativePath });
        tempFiles.push(file.path);
      }
    });

    // Process existing images
    const existingUtilityImages = {};
    const existingRoomImages = {};
    const existingOtherImages = {};
    for (const key in req.body) {
      if (key.startsWith(`existingUtilityImages_${propertyCode}_`)) {
        const index = key.split("_")[2];
        const filenames = parseJSON(
          req.body[key],
          [],
          `existingUtilityImages_${index}`
        );
        existingUtilityImages[index] = existingUtilityImages[index] || [];
        console.log(
          `Processing existing utility images for index ${index}:`,
          filenames
        );

        for (const filename of filenames) {
          const sourcePath = path.join(webDir, path.basename(filename));
          const newFilename = `${Date.now()}-${path.basename(filename)}`;
          const destPath = path.join(utilitiesDir, newFilename);
          const relativePath = path.join(
            propertyCode,
            "Utilities",
            newFilename
          );

          try {
            if (fsSync.existsSync(sourcePath)) {
              console.log(
                `Copying utility image from ${sourcePath} to ${destPath}`
              );
              fsSync.copyFileSync(sourcePath, destPath);
              existingUtilityImages[index].push({ filename: relativePath });
              tempFiles.push(destPath);
            } else {
              console.warn(
                `Existing utility image ${filename} not found at ${sourcePath}. Skipping.`
              );
            }
          } catch (err) {
            console.error(
              `Error copying utility image ${filename} from ${sourcePath}:`,
              err
            );
            throw err;
          }
        }
      } else if (key.startsWith(`existingRoomImages_${propertyCode}_`)) {
        const roomCode = key.split("_")[2];
        const filenames = parseJSON(
          req.body[key],
          [],
          `existingRoomImages_${roomCode}`
        );
        existingRoomImages[roomCode] = existingRoomImages[roomCode] || [];
        const roomDir = path.join(propertyDir, roomCode);
        if (!fsSync.existsSync(roomDir)) {
          fsSync.mkdirSync(roomDir, { recursive: true });
        }
        console.log(
          `Processing existing room images for roomCode ${roomCode}:`,
          filenames
        );

        for (const filename of filenames) {
          const sourcePath = path.join(webDir, path.basename(filename));
          const newFilename = `${Date.now()}-${path.basename(filename)}`;
          const destPath = path.join(roomDir, newFilename);
          const relativePath = path.join(propertyCode, roomCode, newFilename);

          try {
            if (fsSync.existsSync(sourcePath)) {
              console.log(
                `Copying room image from ${sourcePath} to ${destPath}`
              );
              fsSync.copyFileSync(sourcePath, destPath);
              existingRoomImages[roomCode].push({ filename: relativePath });
              tempFiles.push(destPath);
            } else {
              console.warn(
                `Existing room image ${filename} not found at ${sourcePath}. Skipping.`
              );
            }
          } catch (err) {
            console.error(
              `Error copying room image ${filename} from ${sourcePath}:`,
              err
            );
            throw err;
          }
        }
      } else if (key.startsWith(`existingImages_${propertyCode}_`)) {
        const fieldName = key.split("_")[2];
        const filenames = parseJSON(
          req.body[key],
          [],
          `existingImages_${fieldName}`
        );
        existingOtherImages[fieldName] = existingOtherImages[fieldName] || [];
        const fieldDir = path.join(propertyDir, fieldName);
        if (!fsSync.existsSync(fieldDir)) {
          fsSync.mkdirSync(fieldDir, { recursive: true });
        }
        console.log(`Processing existing images for ${fieldName}:`, filenames);

        for (const filename of filenames) {
          const sourcePath = path.join(webDir, path.basename(filename));
          const newFilename = `${Date.now()}-${path.basename(filename)}`;
          const destPath = path.join(fieldDir, newFilename);
          const relativePath = path.join(propertyCode, fieldName, newFilename);

          try {
            if (fsSync.existsSync(sourcePath)) {
              console.log(
                `Copying ${fieldName} image from ${sourcePath} to ${destPath}`
              );
              fsSync.copyFileSync(sourcePath, destPath);
              existingOtherImages[fieldName].push({ filename: relativePath });
              tempFiles.push(destPath);
            } else {
              console.warn(
                `Existing ${fieldName} image ${filename} not found at ${sourcePath}. Skipping.`
              );
            }
          } catch (err) {
            console.error(
              `Error copying ${fieldName} image ${filename} from ${sourcePath}:`,
              err
            );
            throw err;
          }
        }
      }
    }

    // Process removed images
    const removedUtilityImages = {};
    const removedRoomImages = {};
    const removedOtherImages = {};
    for (const key in req.body) {
      if (key.startsWith("removedUtilityImages_")) {
        const index = key.split("_")[1];
        removedUtilityImages[index] = parseJSON(
          req.body[key],
          [],
          `removedUtilityImages_${index}`
        );
        for (const filename of removedUtilityImages[index]) {
          const filePath = path.join(uploadDir, filename);
          try {
            if (fsSync.existsSync(filePath)) {
              fsSync.unlinkSync(filePath);
              console.log(`Deleted removed utility image: ${filename}`);
            }
          } catch (err) {
            console.error(`Failed to delete utility image ${filename}:`, err);
          }
        }
      } else if (key.startsWith("removedRoomImages_")) {
        const index = key.split("_")[1];
        removedRoomImages[index] = parseJSON(
          req.body[key],
          [],
          `removedRoomImages_${index}`
        );
        for (const filename of removedRoomImages[index]) {
          const filePath = path.join(uploadDir, filename);
          try {
            if (fsSync.existsSync(filePath)) {
              fsSync.unlinkSync(filePath);
              console.log(`Deleted removed room image: ${filename}`);
            }
          } catch (err) {
            console.error(`Failed to delete room image ${filename}:`, err);
          }
        }
      } else if (key.startsWith(`removedImages_${propertyCode}_`)) {
        const fieldName = key.split("_")[2];
        removedOtherImages[fieldName] = parseJSON(
          req.body[key],
          [],
          `removedImages_${fieldName}`
        );
        for (const filename of removedOtherImages[fieldName]) {
          const filePath = path.join(uploadDir, filename);
          try {
            if (fsSync.existsSync(filePath)) {
              fsSync.unlinkSync(filePath);
              console.log(`Deleted removed ${fieldName} image: ${filename}`);
            }
          } catch (err) {
            console.error(
              `Failed to delete ${fieldName} image ${filename}:`,
              err
            );
          }
        }
      }
    }

    // Update utilities with images
    const updatedUtilities = utilitiesData.map((utility, index) => {
      const indexStr = index.toString();
      const existingPhotos = (utility.photos || [])
        .filter(
          (photo) =>
            photo.isExisting &&
            !removedUtilityImages[indexStr]?.includes(photo.filename)
        )
        .map((photo) => {
          const matchingImage = (existingUtilityImages[indexStr] || []).find(
            (img) =>
              path
                .basename(img.filename)
                .includes(
                  path.basename(photo.filename, path.extname(photo.filename))
                )
          );
          return matchingImage || { filename: photo.filename };
        });
      const newFiles = utilityFiles[indexStr] || [];
      return {
        billType: utility.billType || "Unknown",
        photos: [...existingPhotos, ...newFiles],
      };
    });

    propertyData.Utilities = updatedUtilities;

    // Update rooms with images
    const roomsWithImages = roomsData.map((room, index) => {
      const roomCode = room.Roomcode;
      const indexStr = index.toString();
      const existingImages = (room.RoomImages || [])
        .filter(
          (image) =>
            image.isExisting &&
            !removedRoomImages[indexStr]?.includes(image.filename)
        )
        .map((image) => {
          const matchingImage = (existingRoomImages[roomCode] || []).find(
            (img) =>
              path
                .basename(img.filename)
                .includes(
                  path.basename(image.filename, path.extname(image.filename))
                )
          );
          return matchingImage || { filename: image.filename };
        });
      const newFiles = roomFiles[roomCode] || [];
      return {
        ...room,
        RoomImages: [...existingImages, ...newFiles],
        PropertyCode: propertyCode,
      };
    });

    // Prepare other images data for File collection
    const fileData = {
      PropertyCode: propertyCode,
    };
    imageFields.forEach((field) => {
      const existingImages = (otherImagesData[field] || [])
        .filter(
          (image) =>
            image.isExisting &&
            !removedOtherImages[field]?.includes(image.filename)
        )
        .map((image) => {
          const matchingImage = (existingOtherImages[field] || []).find((img) =>
            path
              .basename(img.filename)
              .includes(
                path.basename(image.filename, path.extname(image.filename))
              )
          );
          return matchingImage ? matchingImage.filename : image.filename;
        });
      const newFiles = (otherImageFiles[field] || []).map(
        (file) => file.filename
      );
      fileData[field] = [...existingImages, ...newFiles];
    });

    // Save Property
    const newProperty = new Property(propertyData);
    const savedProperty = await newProperty.save();
    if (!savedProperty) {
      throw new Error("Failed to save property details");
    }

    // Save AmenitiesMaster
    let savedAmenities = null;
    try {
      savedAmenities = await new AmenitiesMaster(amenitiesData).save();
      if (!savedAmenities) {
        throw new Error("Failed to save amenities details");
      }

      // Save Rooms
      let savedRooms = [];
      try {
        savedRooms = await Roomtype.insertMany(roomsWithImages);
        if (savedRooms.length !== roomsData.length) {
          throw new Error("Failed to save all room details");
        }

        // Save File (Other Images)
        let savedFile = null;
        try {
          savedFile = await new File(fileData).save();
          if (!savedFile) {
            throw new Error("Failed to save file details");
          }

          // Generate RateId for roomRateData
          let maxRateId = 0;
          try {
            const highestRate = await Rate.findOne()
              .sort({ RateId: -1 })
              .select("RateId");
            maxRateId = highestRate ? highestRate.RateId : 0;
          } catch (err) {
            throw new Error(`Failed to generate RateId: ${err.message}`);
          }

          const updatedRoomRateData = roomRateData.map((rate, index) => ({
            ...rate,
            RateId: maxRateId + index + 1,
          }));

          // Save Rates
          let savedRates = [];
          try {
            savedRates = await Rate.insertMany(updatedRoomRateData);
            if (savedRates.length !== roomRateData.length) {
              throw new Error("Failed to save all rate details");
            }

            // Save RatePlans
            let savedRatePlans = [];
            let savedRatePlans1 = [];
            try {
              savedRatePlans = await RatePlan.insertMany(rateplanData);
              savedRatePlans1 = await Rateplans.insertMany(rateplanDatas);
              if (savedRatePlans.length !== rateplanData.length) {
                throw new Error("Failed to save all rate plan details");
              }
              if (savedRatePlans1.length !== rateplanDatas.length) {
                throw new Error("Failed to save all rate plan details");
              }

              // Generate InventoryId for inventoryData
              let maxInventoryId = 0;
              try {
                const highestInventory = await Inventory.findOne()
                  .sort({ InventoryId: -1 })
                  .select("InventoryId");
                maxInventoryId = highestInventory
                  ? highestInventory.InventoryId
                  : 0;
              } catch (err) {
                throw new Error(
                  `Failed to generate InventoryId: ${err.message}`
                );
              }

              const updatedInventoryData = inventoryData.map(
                (inventory, index) => ({
                  ...inventory,
                  InventoryId: maxInventoryId + index + 1,
                })
              );

              // Save Inventory
              let savedInventories = [];
              try {
                savedInventories = await Inventory.insertMany(
                  updatedInventoryData
                );
                if (savedInventories.length !== inventoryData.length) {
                  throw new Error("Failed to save all inventory details");
                }

                // Save Policies
                let savedPolicies = null;
                try {
                  savedPolicies = await new Policies({
                    PolicyType: policiesData.PolicyType,
                    PropertyCode: policiesData.PropertyCode,
                    Policy: policiesData.Policy,
                    type: policiesData.type,
                  }).save();
                  if (!savedPolicies) {
                    throw new Error("Failed to save policy details");
                  }

                  // Success response
                  res.status(201).json({
                    message:
                      "Property, amenities, rooms, rates, rate plans, inventories, policies, and files saved successfully",
                    property: savedProperty,
                    amenities: savedAmenities,
                    rooms: savedRooms,
                    rates: savedRates,
                    ratePlans: savedRatePlans,
                    ratePlans1: savedRatePlans1,
                    inventories: savedInventories,
                    policies: savedPolicies,
                    file: savedFile,
                  });
                } catch (policyError) {
                  // Rollback
                  await Property.deleteOne({ _id: savedProperty._id });
                  await AmenitiesMaster.deleteOne({
                    PropertyCode: propertyCode,
                  });
                  await Roomtype.deleteMany({ PropertyCode: propertyCode });
                  await Rate.deleteMany({ PropertyCode: propertyCode });
                  await RatePlan.deleteMany({ PropertyCode: propertyCode });
                  await Rateplans.deleteMany({ PropertyCode: propertyCode });
                  await Inventory.deleteMany({ PropertyCode: propertyCode });
                  await File.deleteOne({ PropertyCode: propertyCode });
                  throw new Error(
                    `Failed to save policy details: ${policyError.message}`
                  );
                }
              } catch (inventoryError) {
                // Rollback
                await Property.deleteOne({ _id: savedProperty._id });
                await AmenitiesMaster.deleteOne({ PropertyCode: propertyCode });
                await Roomtype.deleteMany({ PropertyCode: propertyCode });
                await Rate.deleteMany({ PropertyCode: propertyCode });
                await RatePlan.deleteMany({ PropertyCode: propertyCode });
                await Rateplans.deleteMany({ PropertyCode: propertyCode });
                await File.deleteOne({ PropertyCode: propertyCode });
                throw new Error(
                  `Failed to save inventory details: ${inventoryError.message}`
                );
              }
            } catch (ratePlanError) {
              // Rollback
              await Property.deleteOne({ _id: savedProperty._id });
              await AmenitiesMaster.deleteOne({ PropertyCode: propertyCode });
              await Roomtype.deleteMany({ PropertyCode: propertyCode });
              await Rate.deleteMany({ PropertyCode: propertyCode });
              await File.deleteOne({ PropertyCode: propertyCode });
              throw new Error(
                `Failed to save rate plan details: ${ratePlanError.message}`
              );
            }
          } catch (rateError) {
            // Rollback
            await Property.deleteOne({ _id: savedProperty._id });
            await AmenitiesMaster.deleteOne({ PropertyCode: propertyCode });
            await Roomtype.deleteMany({ PropertyCode: propertyCode });
            await File.deleteOne({ PropertyCode: propertyCode });
            throw new Error(
              `Failed to save rate details: ${rateError.message}`
            );
          }
        } catch (fileError) {
          // Rollback
          await Property.deleteOne({ _id: savedProperty._id });
          await AmenitiesMaster.deleteOne({ PropertyCode: propertyCode });
          await Roomtype.deleteMany({ PropertyCode: propertyCode });
          throw new Error(`Failed to save file details: ${fileError.message}`);
        }
      } catch (roomError) {
        // Rollback
        await Property.deleteOne({ _id: savedProperty._id });
        await AmenitiesMaster.deleteOne({ PropertyCode: propertyCode });
        throw new Error(`Failed to save room details: ${roomError.message}`);
      }
    } catch (amenitiesError) {
      // Rollback
      await Property.deleteOne({ _id: savedProperty._id });
      throw new Error(
        `Failed to save amenities details: ${amenitiesError.message}`
      );
    }
  } catch (error) {
    // Clean up temporary files
    for (const filePath of tempFiles) {
      try {
        if (fsSync.existsSync(filePath)) {
          fsSync.unlinkSync(filePath);
          console.log(`Cleaned up file: ${filePath}`);
        }
      } catch (err) {
        console.error(`Failed to delete file ${filePath}:`, err);
      }
    }

    // Clean up directories if empty
    try {
      const propertyCode = req.body.propertyData
        ? JSON.parse(req.body.propertyData).Propertycode
        : "temp";
      const propertyDir = path.join(uploadDir, propertyCode);
      if (fsSync.existsSync(propertyDir)) {
        const dirs = [
          "Utilities",
          ...[
            "propertyImages",
            "facadeImages",
            "lobbyImages",
            "receptionImages",
            "corridorsImages",
            "liftElevatorsImages",
            "bathroomImages",
            "parkingImages",
            "otherAreasImages",
            "gst",
          ],
        ];
        for (const dir of dirs) {
          const fullDir = path.join(propertyDir, dir);
          if (fsSync.existsSync(fullDir)) {
            const files = fsSync.readdirSync(fullDir);
            if (files.length === 0) {
              fsSync.rmdirSync(fullDir);
              console.log(`Removed empty directory: ${fullDir}`);
            }
          }
        }
        // Check if propertyDir is empty
        const remainingDirs = fsSync.readdirSync(propertyDir);
        if (remainingDirs.length === 0) {
          fsSync.rmdirSync(propertyDir);
          console.log(`Removed empty property directory: ${propertyDir}`);
        }
      }
    } catch (err) {
      console.error("Error cleaning up directories:", err);
    }

    console.error(
      "Error saving property, amenities, rooms, rates, rate plans, inventories, policies, and files:",
      error
    );
    res.status(error.message.includes("Failed to save") ? 400 : 500).json({
      error: error.message || "Internal Server Error",
      details: error.message,
    });
  }
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ file: req.file });
});
router.post("/conference", upload.any(), async (req, res) => {
  try {
    const { Slots, PropertyCode, HallName, RoomType, Capacity, Amenities } =
      req.body;

    if (!Slots || !PropertyCode || !HallName || !RoomType || !Capacity) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "All fields are required",
      });
    }

    const parsedSlots = typeof Slots === "string" ? JSON.parse(Slots) : Slots;
    const parsedAmenities =
      typeof Amenities === "string" ? JSON.parse(Amenities) : Amenities;

    if (!Array.isArray(parsedSlots) || !Array.isArray(parsedAmenities)) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Slots and Amenities must be arrays",
      });
    }

    const formattedSlots = parsedSlots.map((slot) => {
      if (
        !slot.slotName ||
        !slot.from ||
        !slot.to ||
        slot.price === undefined ||
        slot.availability === undefined
      ) {
        throw new Error("Invalid slot data");
      }
      const fromTime = moment(slot.from, "hh:mm A");
      const toTime = moment(slot.to, "hh:mm A");
      if (!fromTime.isValid() || !toTime.isValid()) {
        throw new Error("Invalid time format in slots");
      }
      if (!toTime.isAfter(fromTime)) {
        throw new Error("Slot 'to' time must be after 'from' time");
      }
      return {
        slotName: slot.slotName,
        from: slot.from,
        to: slot.to,
        price: Number(slot.price),
        availability: Number(slot.availability),
      };
    });

    let conferenceImages = [];
    let index = 0;
    while (
      req.files.some(
        (file) => file.fieldname === `ConferenceImages[${index}]`
      ) ||
      req.body[`ExistingConferenceImages[${index}]`]
    ) {
      if (
        req.files.some(
          (file) => file.fieldname === `ConferenceImages[${index}]`
        )
      ) {
        const file = req.files.find(
          (file) => file.fieldname === `ConferenceImages[${index}]`
        );
        conferenceImages.push(
          path
            .join(PropertyCode, "ConferenceImages", file.filename)
            .replace(/\\/g, "/")
        );
      } else if (req.body[`ExistingConferenceImages[${index}]`]) {
        conferenceImages.push(req.body[`ExistingConferenceImages[${index}]`]);
      }
      index++;
    }

    if (conferenceImages.length === 0) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "At least one conference image is required",
      });
    }

    const newConference = new Conference({
      Slots: formattedSlots,
      PropertyCode,
      HallName,
      RoomType,
      Capacity: Number(Capacity),
      Amenities: parsedAmenities,
      ConferenceImages: conferenceImages,
    });

    await newConference.save();
    console.log("Conference saved to DB:", newConference._id);
    res.status(201).json(newConference);
  } catch (error) {
    console.error("Error saving ConferenceRoom:", error);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message,
    });
  }
});

// PATCH /update
router.patch("/update", upload.any(), async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const { id, type } = req.query;
    if (type !== "ConferenceRoom") {
      return res.status(400).json({
        error: "INVALID_TYPE",
        message: "Invalid type specified",
      });
    }

    if (!id) {
      return res.status(400).json({
        error: "MISSING_ID",
        message: "ID is required for update",
      });
    }

    const { Slots, PropertyCode, HallName, RoomType, Capacity, Amenities } =
      req.body;

    if (!Slots || !PropertyCode || !HallName || !RoomType || !Capacity) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "All fields are required",
      });
    }

    const parsedSlots = typeof Slots === "string" ? JSON.parse(Slots) : Slots;
    const parsedAmenities =
      typeof Amenities === "string" ? JSON.parse(Amenities) : Amenities;

    if (!Array.isArray(parsedSlots) || !Array.isArray(parsedAmenities)) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Slots and Amenities must be arrays",
      });
    }

    const formattedSlots = parsedSlots.map((slot) => {
      if (
        !slot.slotName ||
        !slot.from ||
        !slot.to ||
        slot.price === undefined ||
        slot.availability === undefined
      ) {
        throw new Error("Invalid slot data");
      }
      const fromTime = moment(slot.from, "hh:mm A");
      const toTime = moment(slot.to, "hh:mm A");
      if (!fromTime.isValid() || !toTime.isValid()) {
        throw new Error("Invalid time format in slots");
      }
      if (!toTime.isAfter(fromTime)) {
        throw new Error("Slot 'to' time must be after 'from' time");
      }
      return {
        slotName: slot.slotName,
        from: slot.from,
        to: slot.to,
        price: Number(slot.price),
        availability: Number(slot.availability),
      };
    });

    const conferenceImages = processImages(req.files, req.body, PropertyCode);

    const updatedConference = await Conference.findByIdAndUpdate(
      id,
      {
        Slots: formattedSlots,
        PropertyCode,
        HallName,
        RoomType,
        Capacity: Number(Capacity),
        Amenities: parsedAmenities,
        ConferenceImages: conferenceImages,
      },
      { new: true }
    );

    if (!updatedConference) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Conference room not found",
      });
    }

    console.log("Conference updated in DB:", updatedConference._id);
    res.status(200).json(updatedConference);
  } catch (error) {
    console.error("Error updating ConferenceRoom:", error);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message,
    });
  }
});

module.exports = router;
