const mongoose = require("mongoose");
const multer = require("multer");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
const moment = require("moment");
const nodemailer = require("nodemailer");

const Property = require("../Schema/Property/PropertySchema");
const Propertytype = require("../Schema/Common/PropertyTypeSchema");
const Roomtype = require("../Schema/Property/RoomtypeSchema");
const Roomview = require("../Schema/Common/RoomviewSchema");
const Bedview = require("../Schema/Common/BedviewSchema");
const Amenities = require("../Schema/Common/AmenitiesSchema");
const AmenitiesCategory = require("../Schema/Common/AmenitiesCategorySchema");
const Transport = require("../Schema/Common/TransportSchema");
const File = require("../Schema/FileSchema");
const User = require("../Schema/Property/UserSchema");
const UserProperty = require("../Schema/Common/UserPropertySchema");
const PolicyType = require("../Schema/Common/PolicyTypeSchema");
const BookingSchema = require("../Schema/Common/BookingSchema");
const BookingDet = require("../Schema/Bookings/BookingDet");
const BookingMas = require("../Schema/Bookings/BookingMas");
const BookingDetDatewise = require("../Schema/Bookings/BookingDetDatewise");
const BookingPerDayRent = require("../Schema/Bookings/BookingPerDateRent");
const IDProof = require("../Schema/Common/IDProofSchema");
const Rate = require("../Schema/Property/RateMasterSchema");
const Inventory = require("../Schema/Property/InventorySchema");
const AmenitiesMaster = require("../Schema/Property/AmenitiesMasterSchema");
const Conference = require("../Schema/Property/ConferenceRoom");
const BlockHall = require("../Schema/Property/Block_Hall/BlockHallSchema");
const BlockHallDet = require("../Schema/Property/Block_Hall/BlockHallDet");
const PolicyMaster = require("../Schema/Property/PolicyMasterSchema");
const Guest = require("../Schema/Property/GuestDetailsSchema");
const Ratings = require("../Schema/Property/RatingsSchema");
const RatePlan = require("../Schema/Property/RatePlanSchema");
const RoomRateLink = require("../Schema/Property/RoomRateLinkSchema");
const Email = require("../Schema/Property/EmailSchema");
const EmailMaster = require("../Schema/Property/EmailMasterSchema");
const PropertyOwnerType = require("../Schema/Property/PropertyOwnerType");
const UtilityType = require("../Schema/Property/UtilitySchema");
const Ota = require("../Schema/Property/OtaSchema");
const Web = require("../Schema/Web/WebSchema");
const { log } = require("console");

const uploadDir = "Uploads/";
const webDir = "Public/"; // Adjust based on your public directory for existing images

// Utility function to parse JSON safely
const parseJSON = (str, fallback, context) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.warn(`Failed to parse JSON for ${context}:`, err.message);
    return fallback;
  }
};

const Post = async (req, res) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let propertyCode = req.body.PropertyCode || "temp";
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

      if (file.fieldname === "UtilityFile") {
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

  upload.any()(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    var type = "";
    let ratetype = "";
    let length = req.body.length ? req.body.length : 0;
    if (length == 0) {
      type = req.body.type;
    } else {
      ratetype = req.body[0].ratetype;
    }

    if (type || ratetype) {
      //FileType
      if (type === "Filetype") {
        try {
          if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
          }
      
          const PropertyCode = req.body?.PropertyCode;
          const RoomCode = req.body?.RoomCode || null;
          if (!PropertyCode) {
            return res.status(400).json({ error: "PropertyCode is missing" });
          }
      
          // Define image categories
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
          ];
      
          // Create directories
          const propertyDir = path.join(uploadDir, PropertyCode);
          const utilitiesDir = path.join(propertyDir, "Utilities");
          if (!fsSync.existsSync(utilitiesDir)) {
            fsSync.mkdirSync(utilitiesDir, { recursive: true });
          }
      
          imageFields.forEach((field) => {
            const dir = path.join(propertyDir, field);
            if (!fsSync.existsSync(dir)) {
              fsSync.mkdirSync(dir, { recursive: true });
            }
          });
      
          if (RoomCode) {
            const roomDir = path.join(propertyDir, RoomCode);
            if (!fsSync.existsSync(roomDir)) {
              fsSync.mkdirSync(roomDir, { recursive: true });
            }
          }
      
          // Process uploaded files
          const utilityFiles = {};
          const roomFiles = {};
          const otherImageFiles = {};
          const tempFiles = [];
      
          req.files.forEach((file) => {
            const parts = file.fieldname.split("_");
            let relativePath;
            let destPath;
      
            if (parts[0] === "utilityFiles" && parts.length === 4) {
              const index = parts[2];
              utilityFiles[index] = utilityFiles[index] || [];
              relativePath = path.join(PropertyCode, "Utilities", file.filename);
              utilityFiles[index].push({ filename: relativePath });
              tempFiles.push(file.path);
            } else if (
              parts[0] === "roomFiles" &&
              parts.length === 4 &&
              parts[2] === RoomCode
            ) {
              const roomCode = parts[2];
              roomFiles[roomCode] = roomFiles[roomCode] || [];
              relativePath = path.join(PropertyCode, roomCode, file.filename);
              roomFiles[roomCode].push({ filename: relativePath });
              tempFiles.push(file.path);
            } else if (parts[0] === "imageFiles" && parts.length === 4) {
              const fieldName = parts[2];
              if (imageFields.includes(fieldName)) {
                otherImageFiles[fieldName] = otherImageFiles[fieldName] || [];
                relativePath = path.join(PropertyCode, fieldName, file.filename);
                otherImageFiles[fieldName].push({ filename: relativePath });
                tempFiles.push(file.path);
              }
            } else if (
              parts[0] === "PropertyImage" ||
              file.fieldname === "PropertyImage"
            ) {
              otherImageFiles["PropertyImage"] = otherImageFiles["PropertyImage"] || [];
              if (file.path.includes(path.join(uploadDir, "temp"))) {
                const newFilename = file.filename;
                destPath = path.join(uploadDir, PropertyCode, "PropertyImage", newFilename);
                const destDir = path.join(uploadDir, PropertyCode, "PropertyImage");
                if (!fsSync.existsSync(destDir)) {
                  fsSync.mkdirSync(destDir, { recursive: true });
                }
                try {
                  fsSync.renameSync(file.path, destPath);
                  console.log(`Moved PropertyImage from ${file.path} to ${destPath}`);
                } catch (err) {
                  console.error(`Error moving PropertyImage from ${file.path}:`, err);
                  throw err;
                }
              } else {
                destPath = file.path;
              }
              relativePath = path.join(PropertyCode, "PropertyImage", path.basename(destPath));
              otherImageFiles["PropertyImage"].push({ filename: relativePath });
              tempFiles.push(destPath);
            } else if (
              parts[0] === "CoverImage" ||
              file.fieldname === "CoverImage"
            ) {
              otherImageFiles["CoverImage"] = otherImageFiles["CoverImage"] || [];
              if (
                file.path.includes(path.join(uploadDir, "temp")) ||
                file.path.includes(path.join(uploadDir, "temp", "CoverImage"))
              ) {
                const newFilename = file.filename;
                destPath = path.join(uploadDir, PropertyCode, "CoverImage", newFilename);
                const destDir = path.join(uploadDir, PropertyCode, "CoverImage");
                if (!fsSync.existsSync(destDir)) {
                  fsSync.mkdirSync(destDir, { recursive: true });
                }
                try {
                  fsSync.renameSync(file.path, destPath);
                  console.log(`Moved CoverImage from ${file.path} to ${destPath}`);
                } catch (err) {
                  console.error(`Error moving CoverImage from ${file.path}:`, err);
                  throw err;
                }
              } else {
                destPath = file.path;
              }
              relativePath = path.join(PropertyCode, "CoverImage", path.basename(destPath));
              otherImageFiles["CoverImage"].push({ filename: relativePath });
              tempFiles.push(destPath);
            } else if (
              parts[0] === "RoomImage" ||
              file.fieldname === "RoomImage"
            ) {
              if (!RoomCode) {
                console.warn("RoomImage uploaded but RoomCode is missing. Skipping.");
                return;
              }
              otherImageFiles["RoomImage"] = otherImageFiles["RoomImage"] || [];
              if (file.path.includes(path.join(uploadDir, "temp"))) {
                const newFilename = file.filename;
                destPath = path.join(uploadDir, PropertyCode, "RoomImage", newFilename);
                const destDir = path.join(uploadDir, PropertyCode, "RoomImage");
                if (!fsSync.existsSync(destDir)) {
                  fsSync.mkdirSync(destDir, { recursive: true });
                }
                try {
                  fsSync.renameSync(file.path, destPath);
                  console.log(`Moved RoomImage from ${file.path} to ${destPath}`);
                } catch (err) {
                  console.error(`Error moving RoomImage from ${file.path}:`, err);
                  throw err;
                }
              } else {
                destPath = file.path;
              }
              relativePath = path.join(PropertyCode, "RoomImage", path.basename(destPath));
              otherImageFiles["RoomImage"].push({ filename: relativePath });
              tempFiles.push(destPath);
            }
          });
      
          // Clean up temp folder (including subdirectories)
          const tempDir = path.join(uploadDir, "temp");
          if (fsSync.existsSync(tempDir)) {
            const walkDir = (dir) => {
              const files = fsSync.readdirSync(dir);
              for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fsSync.statSync(filePath);
                if (stat.isDirectory()) {
                  walkDir(filePath);
                } else {
                  // Skip moving files since they should have been handled above
                  console.warn(`Unexpected file in temp directory: ${filePath}. Skipping.`);
                }
              }
            };
            walkDir(tempDir);
            // Remove empty temp directories
            try {
              fsSync.rmdirSync(tempDir, { recursive: true });
            } catch (err) {
              console.warn(`Failed to remove temp directory ${tempDir}:`, err);
            }
          }
      
          // Process existing images
          const existingUtilityImages = {};
          const existingRoomImages = {};
          const existingOtherImages = {};
      
          for (const key in req.body) {
            if (key.startsWith(`existingUtilityImages_${PropertyCode}_`)) {
              const index = key.split("_")[2];
              const filenames = parseJSON(req.body[key], [], `existingUtilityImages_${index}`);
              existingUtilityImages[index] = existingUtilityImages[index] || [];
              console.log(`Processing existing utility images for index ${index}:`, filenames);
      
              for (const filename of filenames) {
                const sourcePath = path.join(webDir, path.basename(filename));
                const newFilename = `${Date.now()}-${path.basename(filename)}`;
                const destPath = path.join(utilitiesDir, newFilename);
                const relativePath = path.join(PropertyCode, "Utilities", newFilename);
      
                try {
                  if (fsSync.existsSync(sourcePath)) {
                    console.log(`Copying utility image from ${sourcePath} to ${destPath}`);
                    fsSync.copyFileSync(sourcePath, destPath);
                    existingUtilityImages[index].push({ filename: relativePath });
                    tempFiles.push(destPath);
                  } else {
                    console.warn(`Existing utility image ${filename} not found at ${sourcePath}. Skipping.`);
                  }
                } catch (err) {
                  console.error(`Error copying utility image ${filename}:`, err);
                  throw err;
                }
              }
            } else if (key.startsWith(`existingRoomImages_${PropertyCode}_`)) {
              const roomCode = key.split("_")[2];
              if (roomCode === RoomCode) {
                const filenames = parseJSON(req.body[key], [], `existingRoomImages_${roomCode}`);
                existingRoomImages[roomCode] = existingRoomImages[roomCode] || [];
                const roomDir = path.join(propertyDir, roomCode);
                if (!fsSync.existsSync(roomDir)) {
                  fsSync.mkdirSync(roomDir, { recursive: true });
                }
                console.log(`Processing existing room images for roomCode ${roomCode}:`, filenames);
      
                for (const filename of filenames) {
                  const sourcePath = path.join(webDir, path.basename(filename));
                  const newFilename = `${Date.now()}-${path.basename(filename)}`;
                  const destPath = path.join(roomDir, newFilename);
                  const relativePath = path.join(PropertyCode, roomCode, newFilename);
      
                  try {
                    if (fsSync.existsSync(sourcePath)) {
                      console.log(`Copying room image from ${sourcePath} to ${destPath}`);
                      fsSync.copyFileSync(sourcePath, destPath);
                      existingRoomImages[roomCode].push({ filename: relativePath });
                      tempFiles.push(destPath);
                    } else {
                      console.warn(`Existing room image ${filename} not found at ${sourcePath}. Skipping.`);
                    }
                  } catch (err) {
                    console.error(`Error copying room image ${filename}:`, err);
                    throw err;
                  }
                }
              }
            } else if (key.startsWith(`existingImages_${PropertyCode}_`)) {
              const fieldName = key.split("_")[2];
              if (imageFields.includes(fieldName)) {
                const filenames = parseJSON(req.body[key], [], `existingImages_${fieldName}`);
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
                  const relativePath = path.join(PropertyCode, fieldName, newFilename);
      
                  try {
                    if (fsSync.existsSync(sourcePath)) {
                      console.log(`Copying ${fieldName} image from ${sourcePath} to ${destPath}`);
                      fsSync.copyFileSync(sourcePath, destPath);
                      existingOtherImages[fieldName].push({ filename: relativePath });
                      tempFiles.push(destPath);
                    } else {
                      console.warn(`Existing ${fieldName} image ${filename} not found at ${sourcePath}. Skipping.`);
                    }
                  } catch (err) {
                    console.error(`Error copying ${fieldName} image ${filename}:`, err);
                    throw err;
                  }
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
              removedUtilityImages[index] = parseJSON(req.body[key], [], `removedUtilityImages_${index}`);
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
              const roomCode = key.split("_")[1];
              if (roomCode === RoomCode) {
                removedRoomImages[roomCode] = parseJSON(req.body[key], [], `removedRoomImages_${roomCode}`);
                for (const filename of removedRoomImages[roomCode]) {
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
              }
            } else if (key.startsWith(`removedImages_${PropertyCode}_`)) {
              const fieldName = key.split("_")[2];
              if (imageFields.includes(fieldName)) {
                removedOtherImages[fieldName] = parseJSON(req.body[key], [], `removedImages_${fieldName}`);
                for (const filename of removedOtherImages[fieldName]) {
                  const filePath = path.join(uploadDir, filename);
                  try {
                    if (fsSync.existsSync(filePath)) {
                      fsSync.unlinkSync(filePath);
                      console.log(`Deleted removed ${fieldName} image: ${filename}`);
                    }
                  } catch (err) {
                    console.error(`Failed to delete ${fieldName} image ${filename}:`, err);
                  }
                }
              }
            }
          }
      
          // Fetch existing data
          const existingProperty = await Property.findOne({ PropertyCode });
          const existingRoom = RoomCode
            ? await Roomtype.findOne({ PropertyCode, Roomcode: RoomCode })
            : null;
          const existingFile = await File.findOne({
            PropertyCode,
            RoomCode: RoomCode || null,
          });
      
          // Update utilities
          let updatedUtilities = [];
          if (existingProperty && existingProperty.Utilities) {
            updatedUtilities = existingProperty.Utilities.map((utility, index) => {
              const indexStr = index.toString();
              const existingPhotos = (utility.photos || [])
                .filter(
                  (photo) =>
                    photo.isExisting &&
                    !removedUtilityImages[indexStr]?.includes(photo.filename)
                )
                .map((photo) => {
                  const matchingImage = (existingUtilityImages[indexStr] || []).find(
                    (img) => img.filename === photo.filename
                  );
                  return matchingImage || { filename: photo.filename };
                });
              const newFiles = utilityFiles[indexStr] || [];
              return {
                billType: utility.billType || "Unknown",
                photos: [...existingPhotos, ...newFiles],
              };
            });
          } else if (Object.keys(utilityFiles).length > 0) {
            updatedUtilities = Object.keys(utilityFiles).map((index) => ({
              billType: "Unknown",
              photos: utilityFiles[index],
            }));
          }
      
          // Update room images
          let updatedRoomImages = [];
          if (RoomCode && existingRoom && existingRoom.RoomImages) {
            updatedRoomImages = existingRoom.RoomImages.filter(
              (image) =>
                image.isExisting &&
                !removedRoomImages[RoomCode]?.includes(image.filename)
            ).map((image) => {
              const matchingImage = (existingRoomImages[RoomCode] || []).find(
                (img) => img.filename === image.filename
              );
              return matchingImage || { filename: image.filename };
            });
            updatedRoomImages.push(...(roomFiles[RoomCode] || []));
          } else if (roomFiles[RoomCode]) {
            updatedRoomImages = roomFiles[RoomCode];
          }
      
          // Prepare file data for other images
          const fileData = {
            PropertyCode,
            RoomCode: RoomCode || null,
          };
      
          // Initialize fileData with existing images for all image fields
          imageFields.forEach((field) => {
            const existingImages = existingFile?.[field]
              ? existingFile[field].map((image) => image.filename || image)
              : [];
            fileData[field] = [...existingImages];
          });
      
          // Update only the fields that have new, existing, or removed images
          for (const field of imageFields) {
            if (removedOtherImages[field]?.length > 0) {
              fileData[field] = fileData[field].filter(
                (filename) => !removedOtherImages[field].includes(filename)
              );
            }
            if (otherImageFiles[field]?.length > 0) {
              const newFiles = otherImageFiles[field].map((file) => file.filename);
              fileData[field] = [...fileData[field], ...newFiles];
            }
            if (existingOtherImages[field]?.length > 0) {
              const existingFilenames = existingOtherImages[field].map((img) => img.filename);
              fileData[field] = [
                ...fileData[field].filter((filename) => !existingFilenames.includes(filename)),
                ...existingFilenames,
              ];
            }
          }
      
          // Update Property with utilities
          if (updatedUtilities.length > 0) {
            await Property.updateOne(
              { PropertyCode },
              { $set: { Utilities: updatedUtilities } }
            );
          }
      
          // Update Roomtype with room images
          if (RoomCode && updatedRoomImages.length > 0) {
            await Roomtype.updateOne(
              { PropertyCode, Roomcode: RoomCode },
              { $set: { RoomImages: updatedRoomImages } }
            );
          }
      
          // Update File document
          const query = { PropertyCode, RoomCode: RoomCode || null };
          const updateData = {
            $set: {
              ...fileData,
              updatedAt: new Date(),
            },
          };
      
          const updatedFileEntry = await File.findOneAndUpdate(query, updateData, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          });
      
          return res.status(200).json({
            message: "Files processed successfully",
            data: updatedFileEntry,
          });
        } catch (error) {
          tempFiles.forEach((file) => {
            try {
              fsSync.unlinkSync(file);
            } catch (err) {
              console.warn(`Failed to clean up temp file ${file}:`, err);
            }
          });
          console.error("Error processing files:", error);
          return res.status(500).json({ error: "Upload failed", details: error.message });
        }
      }
      // Property Master
      else if (type === "Propertymaster") {
        try {
          const formData = req.body;
          console.log("Propertymaster - formData:", formData);
          console.log("Propertymaster - req.files:", req.files);

          const duplicateProperty = await Property.findOne({
            Propertyname: {
              $regex: `^${formData.Propertyname}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message:
                "Property Name already exists. Please use a different Name.",
            });
          }

          if (!formData.Propertycode) {
            return res.status(400).json({
              message: "Propertycode is required",
            });
          }

          let utilities = [];
          const tempFiles = [];

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

            // Ensure the Utilities directory exists
            const utilitiesDir = path.join(
              uploadDir,
              formData.Propertycode,
              "Utilities"
            );
            if (!fsSync.existsSync(utilitiesDir)) {
              fsSync.mkdirSync(utilitiesDir, { recursive: true });
              console.log(`Created Utilities directory: ${utilitiesDir}`);
            }

            utilities = utilityFiles.map((file, index) => {
              let currentPath = file.path;
              let relativePath = path.join(
                formData.Propertycode,
                "Utilities",
                file.filename
              );
              const targetPath = path.join(uploadDir, relativePath);

              // Check if file is in temp and move to Utilities
              if (currentPath.includes(path.join(uploadDir, "temp"))) {
                try {
                  fsSync.renameSync(currentPath, targetPath);
                  console.log(
                    `Moved UtilityFile from ${currentPath} to ${targetPath}`
                  );
                  currentPath = targetPath;
                } catch (err) {
                  console.error(
                    `Error moving UtilityFile from ${currentPath} to ${targetPath}:`,
                    err
                  );
                  throw err;
                }
              } else {
                console.log(
                  `UtilityFile already in correct location: ${currentPath}`
                );
              }

              tempFiles.push(currentPath);
              return {
                billType: utilityTypes[index] || "Unknown",
                photos: [{ filename: relativePath }],
              };
            });
          }

          const newPropertyData = {
            ...formData,
            Utilities: utilities,
          };

          delete newPropertyData.UtilityType;
          delete newPropertyData.UtilityFile;

          const newProperty = new Property(newPropertyData);
          await newProperty.save();

          res.status(200).json({
            message: "Property created successfully",
            data: newProperty,
          });
        } catch (error) {
          tempFiles.forEach((file) => {
            try {
              fsSync.unlinkSync(file);
            } catch (err) {
              console.warn(`Failed to clean up temp file ${file}:`, err);
            }
          });
          console.error("Error in saving Property:", error);
          res.status(500).json({ error: "Error in saving Property" });
        }
      }
      //Propert Type
      else if (type === "Propertytype") {
        try {
          const PropertytypeData = req.body;
          const duplicateProperty = await Propertytype.findOne({
            PropertyName: {
              $regex: `^${PropertytypeData.PropertyName}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Property Type Name is already exist",
            });
          }
          const newUser = new Propertytype(PropertytypeData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Propertytype");
        }
      }
      //Room View
      else if (type === "Roomview") {
        try {
          const RoomViewData = req.body;
          const duplicateProperty = await Roomview.findOne({
            RoomView: { $regex: `^${RoomViewData.RoomView}$`, $options: "i" },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Room View Name is already exist",
            });
          }
          const newUser = new Roomview(RoomViewData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Room View");
        }
      }
      //Bed Type
      else if (type === "Bedtype") {
        try {
          const BedTypeData = req.body;
          const duplicateProperty = await Bedview.findOne({
            BedType: { $regex: `^${BedTypeData.BedType}$`, $options: "i" },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Bed View Name is already exist",
            });
          }
          const newUser = new Bedview(BedTypeData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Bed View");
        }
      }
      //Room Type
//       else if (type === "Roomtype") {
//         try {
//           const formData = req.body;
//           console.log("Roomtype req.body:", JSON.stringify(formData, null, 2));
//           console.log("Roomtype req.files:", req.files);

//           // Parse multiple rooms from FormData
//           const roomsData = [];
//           if (Object.keys(formData).some((key) => key.startsWith("Rooms"))) {
//             const roomKeys = Object.keys(formData).filter((key) =>
//               key.startsWith("Rooms")
//             );
//             const roomMap = roomKeys.reduce((acc, key) => {
//               const [_, index, field, subIndex] =
//                 key.match(/Rooms\[(\d+)\]\[(\w+)\](?:\[(\d+)\])?/) || [];
//               if (!acc[index]) acc[index] = {};
//               if (field === "RoomAmenities" || field === "RoomImages") {
//                 if (!acc[index][field]) acc[index][field] = [];
//                 acc[index][field][subIndex] = formData[key];
//               } else {
//                 acc[index][field] = formData[key];
//               }
//               return acc;
//             }, []);

//             roomsData.push(...roomMap.filter(Boolean));
//           }

//           // Process RoomImages from req.files
//           if (req.files && req.files["Rooms"]) {
//             const roomFiles = Array.isArray(req.files["Rooms"])
//               ? req.files["Rooms"]
//               : [req.files["Rooms"]];
//             roomFiles.forEach((file, index) => {
//               if (roomsData[index]) {
//                 if (!roomsData[index].RoomImages)
//                   roomsData[index].RoomImages = [];
//                 roomsData[index].RoomImages.push(file.filename);
//               }
//             });
//           }
// console.log(",,,,,,ROOMSDATA,,,,,,", roomsData);
//           // Check for duplicates and save each room
//           const savedRooms = [];
//           for (const roomData of roomsData) {
//             const duplicateProperty = await Roomtype.findOne({
//               Displayname: {
//                 $regex: `^${roomData.Displayname}$`,
//                 $options: "i",
//               },
//               PropertyCode: roomData.PropertyCode,
//             });

//             if (duplicateProperty) {
//               return res.status(400).json({
//                 message: `Display Name "${roomData.Displayname}" already exists for PropertyCode "${roomData.PropertyCode}"`,
//               });
//             }

//             const newRoom = new Roomtype(roomData);
//             console.log(
//               ">>>>>>>>>>>>>>>>Roomdetails<<<<<<<<<<<<<<<<<<",
//               newRoom
//             );
//             await newRoom.save();
//             savedRooms.push(newRoom);
//           }

//           res.status(200).json({
//             message: "Rooms created successfully",
//             data: savedRooms,
//           });
//         } catch (error) {
//           console.error("Error in saving Room Type:", error);
//           res.status(500).json({ error: "Error in saving Room Type" });
//         }
//       }
else if (type === "Roomtype") {
  try {
    const formData = req.body;
    console.log("Roomtype req.body:", JSON.stringify(formData, null, 2));
    console.log("Roomtype req.files:", req.files);

    // Prepare room data from req.body
    const roomData = { ...formData };

    // Process RoomImages from req.files if provided
    if (req.files && req.files["RoomImages"]) {
      const roomFiles = Array.isArray(req.files["RoomImages"])
        ? req.files["RoomImages"]
        : [req.files["RoomImages"]];
      roomData.RoomImages = roomFiles.map((file) => file.filename);
    }

    console.log(",,,,,,ROOMDATA,,,,,,", roomData);

    // Check for duplicate room
    const duplicateProperty = await Roomtype.findOne({
      Displayname: {
        $regex: `^${roomData.Displayname}$`,
        $options: "i",
      },
      PropertyCode: roomData.PropertyCode,
    });

    if (duplicateProperty) {
      return res.status(400).json({
        message: `Display Name "${roomData.Displayname}" already exists for PropertyCode "${roomData.PropertyCode}"`,
      });
    }

    // Save the room
    const newRoom = new Roomtype(roomData);
    console.log(">>>>>>>>>>>>>>>>Roomdetails<<<<<<<<<<<<<<<<<<", newRoom);
    await newRoom.save();

    res.status(200).json({
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (error) {
    console.error("Error in saving Room Type:", error);
    res.status(500).json({ error: "Error in saving Room Type" });
  }
}
      //Amenities
      else if (type === "Amenities") {
        try {
          const AmenitiesData = req.body;
          const duplicateProperty = await Amenities.findOne({
            Amenities: {
              $regex: `^${AmenitiesData.Amenities}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Amenity Name is already exist",
            });
          }
          const newUser = new Amenities(AmenitiesData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Room Type");
        }
      }
      //Amenities Category
      else if (type === "AmenitiesCategory") {
        try {
          const AmenitiesCategoryData = req.body;

          // Normalize the category (adjust this logic based on your schema)
          const normalizedCategory = AmenitiesCategoryData.AmenitiesCategory
            ? AmenitiesCategoryData.AmenitiesCategory.toLowerCase().replace(
                /\s+/g,
                ""
              )
            : null;

          // Check for duplicate normalizedCategory
          const duplicateProperty = await AmenitiesCategory.findOne({
            normalizedCategory: normalizedCategory,
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Amenity Category already exists",
            });
          }

          // Ensure normalizedCategory is included in the data to save
          const newUser = new AmenitiesCategory({
            ...AmenitiesCategoryData,
            normalizedCategory: normalizedCategory || null, // Adjust based on your normalization logic
          });

          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          console.error(error); // Log the error for debugging
          res.status(500).send("Error in saving Amenity Category");
        }
      }
      //Mode of Transport
      else if (type === "Transport") {
        try {
          const TransportData = req.body;
          const duplicateProperty = await Transport.findOne({
            Transport: {
              $regex: `^${TransportData.Transport}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Mode of Transport is already exists",
            });
          }
          const newUser = new Transport(TransportData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Room Type");
        }
      }
      //User
      else if (type === "Usertype") {
        try {
          const { UserName, Password, UserType, Email } = req.body;

          if (!UserName || !Password || !UserType || !Email) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          const duplicateProperty = await User.findOne({
            Email: {
              $regex: `^${Email}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Email already exists",
            });
          }

          const hashedPassword = crypto
            .createHash("sha256")
            .update(Password)
            .digest("hex");

          const newItem = new User({
            UserName,
            Password: hashedPassword,
            UserType,
            Email,
          });

          const savedItem = await newItem.save();

          return res
            .status(201)
            .json({ message: "User created successfully", data: savedItem });
        } catch (error) {
          console.error("Error:", error);
          return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
        }
      }
      //Login
      else if (type === "Logintype") {
        const { Name, Password } = req.body;

        if (!Name || !Password) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const payload = {
          Name,
          Password,
        };

        try {
          if (Name == "admin@gmail.com" && Password == "admin@123") {
            res.status(200).json({
              propertyId: 0,
              Admin: 1,
              Email: "admin@gmail.com",
              message: "Login successful",
            });
          } else {
            const hashedPassword = crypto
              .createHash("sha256")
              .update(Password)
              .digest("hex");

            console.log("hashed", hashedPassword);

            const user = await User.findOne({
              Email: Name,
              Password: hashedPassword,
            });
            console.log("user", user);
            const property = await UserProperty.findOne({
              Email: Name,
            });
            console.log("Property", property);

            const PropertyCode = await Property.findOne({
              Propertycode: property.PropertyName[0],
            });
            console.log("PropertyCode", PropertyCode);

            if (!user) {
              return res.status(404).json({ message: "User not found" });
            } else if (
              user.Email !== Name &&
              user.Password !== hashedPassword
            ) {
              return res
                .status(401)
                .json({ message: "Invalid Username or password" });
            }
            // console.log("propertyCode", PropertyCode.Propertycode);
            res.status(200).json({
              propertyId:
                user.UserType == "Admin" ? 0 : PropertyCode.Propertycode,
              Email: property.Email,
              message: "Login successful",
            });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({
            message: "Invalid Username or password",
            error: error.message,
          });
        }
      }
      //User Property
      else if (type === "Userproperty") {
        try {
          const UserPropertyData = req.body;
          const duplicateProperty = await UserProperty.findOne({
            Amenities: {
              $regex: `^${UserPropertyData.Email}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Email is already exist",
            });
          }
          const newUser = new UserProperty(UserPropertyData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Room Type");
        }
      }
      // Rate Master
      else if (ratetype === "RateMaster") {
        console.log("Received Request Data:", req.body);

        try {
          let updatedRates = req.body;

          if (!Array.isArray(updatedRates) || updatedRates.length === 0) {
            return res.status(400).json({ error: "Invalid request data" });
          }

          // ✅ Fetch the last RateId **once** and ensure it’s a number
          const lastRate = await Rate.findOne().sort({ RateId: -1 });
          console.log("Last Rate from DB:", lastRate);
          let currentRateId =
            lastRate && lastRate.RateId ? Number(lastRate.RateId) : 0;
          console.log("Starting currentRateId:", currentRateId);

          // Ensure EntryDate is formatted correctly
          const formatDate = (date) =>
            moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");

          // Prepare bulk update operations
          const operations = updatedRates.flatMap((rate) => {
            // Strip RateId if it exists in incoming data to avoid interference
            let { RateId, ...rateWithoutId } = rate;
            let {
              PropertyCode,
              RoomCode,
              RatePlan,
              EntryDate,
              SingleTarrif,
              DoubleTarrif,
              ExtraBedCharges,
            } = rateWithoutId;

            // Ensure EntryDate is an array
            if (!Array.isArray(EntryDate)) {
              EntryDate = [EntryDate];
            }

            // Generate a separate update operation for each EntryDate
            return EntryDate.map((date) => ({
              updateOne: {
                filter: {
                  PropertyCode,
                  RoomCode,
                  RatePlan,
                  EntryDate: formatDate(date),
                },
                update: {
                  $set: {
                    SingleTarrif: SingleTarrif ? Number(SingleTarrif) : 0,
                    DoubleTarrif: DoubleTarrif ? Number(DoubleTarrif) : 0,
                    ExtraBedCharges: ExtraBedCharges
                      ? Number(ExtraBedCharges)
                      : 0,
                    EntryDate: formatDate(date),
                  },
                  $setOnInsert: { RateId: ++currentRateId }, // ✅ Unique ID increment
                },
                upsert: true, // ✅ Insert if not exists
              },
            }));
          });

          // Execute bulkWrite
          const result = await Rate.bulkWrite(operations);
          console.log("MongoDB Update Result:", result);

          // Verify the highest RateId after insertion
          const newLastRate = await Rate.findOne().sort({ RateId: -1 });
          console.log("New Last RateId after insertion:", newLastRate?.RateId);

          res
            .status(200)
            .json({ message: "Rates updated successfully!", result });
        } catch (error) {
          console.error("Error updating rates:", error);
          res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        }
      }
      //Inventory Master
      else if (ratetype === "InventoryMaster") {
        try {
          console.log("Received Inventory Data:", req.body);

          const updatedInventory = req.body;

          if (
            !Array.isArray(updatedInventory) ||
            updatedInventory.length === 0
          ) {
            return res.status(400).json({ error: "Invalid request data" });
          }

          // ✅ Fetch the last InventoryId **once** and increment using `$inc`
          const lastInventory = await Inventory.findOne().sort({
            InventoryId: -1,
          });
          let currentInventoryId = lastInventory
            ? lastInventory.InventoryId
            : 0;

          // Function to format date properly
          const formatDate = (date) =>
            moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");

          // Prepare bulk operations
          const bulkOps = updatedInventory.flatMap((inventory) => {
            let {
              PropertyCode,
              RoomCode,
              AvailableDate,
              AvailableRooms,
              StopSales,
            } = inventory;

            let TotalRooms = AvailableRooms;
            // ✅ Ensure AvailableDate is always an array
            if (!Array.isArray(AvailableDate)) {
              AvailableDate = [AvailableDate];
            }

            return AvailableDate.map((date) => ({
              updateOne: {
                filter: {
                  PropertyCode,
                  RoomCode,
                  AvailableDate: formatDate(date),
                },
                update: {
                  $set: {
                    TotalRooms: Number(AvailableRooms),
                    AvailableDate: formatDate(date),
                    AvailableRooms:
                      StopSales == 1
                        ? 0
                        : Number.isFinite(Number(AvailableRooms))
                        ? Number(AvailableRooms)
                        : 0, // ✅ If StopSales is 1, set AvailableRooms to 0
                    StopSales: Boolean(StopSales),
                  },
                  $setOnInsert: { InventoryId: ++currentInventoryId }, // ✅ Unique ID increment
                },
                upsert: true, // ✅ Insert if not exists
              },
            }));
          });

          // ✅ Execute bulk update
          const result = await Inventory.bulkWrite(bulkOps);

          console.log("MongoDB Inventory Update Result:", result);
          res
            .status(200)
            .json({ message: "Inventory updated successfully!", result });
        } catch (error) {
          console.error("Error updating Inventory:", error);
          res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        }
      }
      //Amenities Master
      else if (type === "AmenitiesMaster") {
        try {
          const selectedOptions = req.body;
          const PropertyCode = selectedOptions.PropertyCode;
          const filter = { PropertyCode };
          const update = { $set: selectedOptions };
          const options = { upsert: true, new: true };
          const newUser = await AmenitiesMaster.findOneAndUpdate(
            filter,
            update,
            options
          );
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Room Type");
        }
      }
      //PolicyType
      else if (type === "PolicyType") {
        try {
          const PolicyTypes = req.body;
          const duplicateProperty = await PolicyType.findOne({
            PolicyType: {
              $regex: `^${PolicyTypes.PolicyType.replace(/\s+/g, "\\s*")}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Policy Type is already exist",
            });
          }
          const newUser = new PolicyType(PolicyTypes);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Policy Type");
        }
      }
      //Policy Master
      else if (type === "Policies") {
        try {
          const PolicyData = req.body;
          const PropertyCode = PolicyData.PropertyCode;
          const PolicyType = PolicyData.PolicyType;
          const filter = { PropertyCode, PolicyType };

          if (PolicyType == "Yes/No") {
            // Only create new document without upsert
            const newUser = await PolicyMaster.create(PolicyData);
            res.status(200).send(newUser);
          } else {
            // Use findOneAndUpdate with upsert for other PolicyType values
            const update = { $set: PolicyData };
            const options = { upsert: true, new: true };
            const newUser = await PolicyMaster.findOneAndUpdate(
              filter,
              update,
              options
            );
            res.status(200).send(newUser);
          }
        } catch (error) {
          res.status(500).send(error);
        }
      }
      //Rating & Reviews
      else if (type === "Ratings&Reviews") {
        try {
          const RatingsData = req.body;
          const newUser = new Ratings(RatingsData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Room Type");
        }
      }
      //Rate Plan Master
      else if (type === "RatePlan") {
        console.log("req", req.body);
        try {
          const RatesData = req.body;
          const newUser = new RatePlan(RatesData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving Rate Plan");
        }
      }
      //Room & Rate Link
      else if (type === "RoomRateLink") {
        console.log("req", req.body);
        try {
          const RatesData = req.body;
          const { RoomType, RatePlan, PropertyCode, Status } = RatesData;

          // Ensure RatePlan is an array
          const ratePlans = Array.isArray(RatePlan) ? RatePlan : [RatePlan];

          // Store all updated or created documents
          const savedRates = [];

          for (const rate of ratePlans) {
            // Find the existing document
            const existingRate = await RoomRateLink.findOne({
              RoomType,
              RatePlan: rate,
              PropertyCode,
            });

            if (existingRate) {
              console.log("Found existing rate:", existingRate);

              // Explicitly mark Status as modified to ensure Mongoose tracks the change
              existingRate.Status = Status;
              existingRate.markModified("Status"); // Force Mongoose to recognize the change

              // Save the document and log the result
              const updatedRate = await existingRate.save();
              console.log("Updated rate (in-memory):", updatedRate);

              // Verify the update in the database
              const verifiedRate = await RoomRateLink.findById(
                existingRate._id
              );
              console.log("Verified rate (from DB):", verifiedRate);

              savedRates.push(updatedRate);
            } else {
              console.log("No existing rate found, creating new one:", {
                RoomType,
                RatePlan: rate,
                PropertyCode,
                Status,
              });
              const newRate = new RoomRateLink({
                type: "RoomRateLink",
                RoomType,
                RatePlan: rate,
                PropertyCode,
                Status,
              });

              const savedRate = await newRate.save();
              console.log("Created new rate:", savedRate);
              savedRates.push(savedRate);
            }
          }

          res.status(200).send(savedRates);
        } catch (error) {
          console.error(
            "Error in saving Rate Plan:",
            error.message,
            error.stack
          );
          res.status(500).send("Error in saving Rate Plan: " + error.message);
        }
      }
      //ID Proof Type
      else if (type === "IDProof") {
        try {
          const PropertytypeData = req.body;
          const duplicateProperty = await IDProof.findOne({
            IDProof: {
              $regex: `^${PropertytypeData.IDProof}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "ID Proof Name is already exist",
            });
          }
          const newUser = new IDProof(PropertytypeData);
          await newUser.save();
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send("Error in saving ID Proof Name");
        }
      }
      //Guest Details
      else if (type === "GuestDetails") {
        try {
          const GuestDetails = req.body;
          const Mobile = GuestDetails.Mobile;
          const filter = { Mobile };
          const update = { $set: GuestDetails };
          const options = { upsert: true, new: true };

          const newUser = new Guest.findOneAndUpdate(filter, update, options);
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send(error);
        }
      }
      //Email
      else if (type === "Email") {
        try {
          const EmailData = req.body;
          console.log(EmailData);

          const TemplateType = EmailData.TemplateType;
          const PropertyCode = EmailData.PropertyCode;
          const filter = {
            TemplateType: TemplateType,
            PropertyCode: PropertyCode,
          };
          const update = { $set: EmailData };
          const options = { upsert: true, new: true, returnDocument: "after" };

          const updatedTemplate = await Email.findOneAndUpdate(
            filter,
            update,
            options
          );

          res.status(200).json(updatedTemplate);
        } catch (error) {
          console.error("Error updating email template:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
      //Email Master
      else if (type === "EmailMaster") {
        try {
          const EmailData = req.body;
          const PropertyCode = EmailData.PropertyCode;
          const filter = { PropertyCode };
          const update = { $set: EmailData };
          const options = { upsert: true, new: true };
          const newUser = await EmailMaster.findOneAndUpdate(
            filter,
            update,
            options
          );
          res.status(200).send(newUser);
        } catch (error) {
          res.status(500).send(error);
        }
      }
      //EmailSend
      else if (type === "EmailSend") {
        const { guestEmail, subject, message } = req.body;
        const Email = "ragavendarmicrogenn@gmail.com";
        const Password = "hacm ofji uhua cezv";
        const Port = 465;
        const SMTPHost = "smtp.gmail.com";
        const Secure = true; // Must be true for port 465
        // Configure SMTP dynamically from frontend input
        const transporter = nodemailer.createTransport({
          host: SMTPHost,
          port: parseInt(Port),
          secure: Secure, // Convert string to boolean
          auth: {
            user: Email,
            pass: Password,
          },
          tls: {
            rejectUnauthorized: false, // Prevent SSL certificate validation issues
          },
        });

        const mailOptions = {
          from: Email,
          to: guestEmail,
          subject: subject,
          html: message,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(` Email sent`);
          res.status(200).json({ success: "Email sent successfully!" });
        } catch (error) {
          console.error(` Error sending email:`, error);
          res.status(500).json({ error: "Failed to send email" });
        }
      }
      //Booking Transaction
      else if (type === "Booking") {
        const {
          bookingMas,
          bookingDet,
          bookingDetDatewise,
          bookingPerDayRent,
          guestDetails,
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();
        let saveguestdetails;
        try {
          const guestDetails1 = guestDetails;
          console.log("Incoming guest data:", guestDetails1);
          const newGuest = await BookingSchema(guestDetails1);
          saveguestdetails = await newGuest.save();
          // res.status(201).json({
          //   message: "Guest details saved successfully",
          //   guest: newGuest,
          // });
        } catch (error) {
          console.error("Error saving guest details:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
        try {
          // 1. Save BookingMas
          let savedBookingMas;
          try {
            // console.log("Incoming booking mas data:", bookingMas);
            const newBookingMas = new BookingMas(bookingMas);
            savedBookingMas = await newBookingMas.save();
          } catch (error) {
            console.error("Error saving booking mas details:", error);
            throw error;
          }

          // 2. Save BookingDet
          let savedBookingDet;
          try {
            const bookingDetWithBkid = bookingDet.map((det) => ({
              ...det,
              Bkid: savedBookingMas.Bkid,
            }));
            // console.log("Incoming booking det data:", bookingDetWithBkid);
            savedBookingDet = await BookingDet.insertMany(bookingDetWithBkid);
          } catch (error) {
            console.error("Error saving booking det details:", error);
            throw error;
          }

          // 3. Save BookingDetDatewise
          let savedBookingDetDatewise;
          try {
            if (!savedBookingDet || !Array.isArray(savedBookingDet)) {
              throw new Error("Invalid BookingDet data");
            }

            // Map bookingDetDatewise entries
            const bookingDetDatewiseWithRef = bookingDetDatewise.map((det) => {
              // Find matching ratecode instead of exact Bkdetid if the IDs differ
              const matchingBookingDet = savedBookingDet.find(
                (bd) => bd.ratecode === det.ratecode
              );

              if (!matchingBookingDet) {
                throw new Error(
                  `No matching BookingDet found for ratecode: ${det.ratecode}`
                );
              }

              return {
                ...det,
                Bkdetid: det.Bkdetid, // Keep original Bkdetid from bookingDetDatewise
                ratecode: matchingBookingDet.ratecode, // Ensure ratecode consistency
              };
            });

            // console.log("Processed booking det datewise data:", bookingDetDatewiseWithRef);
            savedBookingDetDatewise = await BookingDetDatewise.insertMany(
              bookingDetDatewiseWithRef
            );
            for (const bookingDate of savedBookingDetDatewise) {
              const { Roomtype_code, Bkdate, Noofrooms } = bookingDate;
              console.log(
                "Roomtype_code, Bkdate, Noofrooms ",
                Roomtype_code,
                Bkdate,
                Noofrooms
              );

              // Find or create the matching inventory record
              let inventory = await Inventory.findOne({
                RoomCode: Roomtype_code,
                AvailableDate: Bkdate,
              });

              inventory.BookedRooms += Noofrooms;
              inventory.AvailableRooms =
                inventory.TotalRooms - inventory.BookedRooms;

              // Check if there are enough rooms available
              if (inventory.BookedRooms > inventory.TotalRooms) {
                throw new Error(
                  `Not enough rooms available for RoomCode: ${Roomtype_code} on ${Bkdate}`
                );
              }

              // Save the updated inventory (AvailableRooms will be calculated by the pre-save hook)
              await inventory.save();
            }
          } catch (error) {
            console.error("Error saving booking det datewise details:", error);
            throw error;
          }

          // 4. Save BookingPerDayRent
          let savedBookingPerDayRent;
          try {
            const bookingPerDayRentWithBkid = bookingPerDayRent.map((rent) => ({
              ...rent,
              Bkid: savedBookingMas.Bkid,
            }));
            // console.log("Incoming booking per day rent data:", bookingPerDayRentWithBkid);
            savedBookingPerDayRent = await BookingPerDayRent.insertMany(
              bookingPerDayRentWithBkid
            );
          } catch (error) {
            console.error("Error saving booking per day rent details:", error);
            throw error;
          }

          // Commit the transaction
          await session.commitTransaction();

          res.status(201).json({
            message: "Booking details saved successfully",
            booking: {
              guest: saveguestdetails,
              bookingMas: savedBookingMas,
              bookingDet: savedBookingDet,
              bookingDetDatewise: savedBookingDetDatewise,
              bookingPerDayRent: savedBookingPerDayRent,
            },
          });
        } catch (error) {
          await session.abortTransaction();
          res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
          });
        } finally {
          session.endSession();
        }
      }
      //Conference Room
      else if (type === "ConferenceRoom") {
        try {
          console.log("ConferenceRoom request received");
          console.log(
            "req.files['ConferenceImage']:",
            req.files ? req.files["ConferenceImage"] : "No files"
          );

          const {
            Slots,
            PropertyCode,
            HallName,
            RoomType,
            Capacity,
            Amenities,
          } = req.body;

          if (!Slots || !PropertyCode) {
            console.log("Missing required fields: Slots or PropertyCode");
            return res.status(400).json({
              message: "Slots and PropertyCode are required",
            });
          }

          const parsedSlots =
            typeof Slots === "string" ? JSON.parse(Slots) : Slots;
          const parsedAmenities =
            typeof Amenities === "string" ? JSON.parse(Amenities) : Amenities;

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
            return {
              slotName: slot.slotName,
              from: slot.from,
              to: slot.to,
              price: Number(slot.price),
              availability: Number(slot.availability),
            };
          });

          console.log("Formatted Slots for DB:", formattedSlots);

          let conferenceImagePath = null;
          if (
            req.files &&
            req.files["ConferenceImage"] &&
            req.files["ConferenceImage"][0]
          ) {
            conferenceImagePath = req.files["ConferenceImage"][0].path;
            console.log("ConferenceImage saved at:", conferenceImagePath);
          } else {
            console.log(
              "No ConferenceImage uploaded. Full req.files:",
              req.files
            );
          }

          const newConference = new Conference({
            Slots: formattedSlots,
            PropertyCode,
            HallName,
            RoomType,
            Capacity: Number(Capacity),
            Amenities: parsedAmenities || [],
            ConferenceImage: conferenceImagePath,
          });

          await newConference.save();
          console.log("Conference saved to DB:", newConference._id);
          res.status(200).json(newConference);
        } catch (error) {
          console.error("Error saving ConferenceRoom:", error);
          res.status(500).json({ message: error.message });
        }
      }
      //Blocking Hall
      else if (type === "BlockHall") {
        try {
          const blockHallData = req.body.blockHall;
          const blkDetData = req.body.blkDet;
          console.log("blockHallData", blockHallData);
          console.log("blkDetData", blkDetData);

          const newConference = new BlockHall(blockHallData);
          await newConference.save();

          const newBlockHall = new BlockHallDet(blkDetData);
          await newBlockHall.save();

          res.status(200).json({
            blockHall: newConference,
            blkDet: newBlockHall,
          });
        } catch (error) {
          console.error("Error:", error);
          res.status(500).send(error.message);
        }
      }
      //Property Owner Type
      if (type === "PropertyOwnerType") {
        try {
          const PropertyOwnerData = req.body;

          // Remove PropertyOwnerId from the incoming data to avoid conflicts
          delete PropertyOwnerData.PropertyOwnerId;

          // Find the latest entry to get the last PropertyOwnerId
          const lastEntry = await PropertyOwnerType.findOne(
            {},
            {},
            { sort: { PropertyOwnerId: -1 } }
          );

          // Set new PropertyOwnerId
          const newPropertyOwnerId =
            lastEntry && Number.isInteger(lastEntry.PropertyOwnerId)
              ? lastEntry.PropertyOwnerId + 1
              : 1;

          // Check for duplicate PropertyOwnerType
          const duplicateProperty = await PropertyOwnerType.findOne({
            PropertyOwnerType: {
              $regex: `^${PropertyOwnerData.PropertyOwnerType}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Property Owner Type already exists",
            });
          }

          // Assign new sequential ID
          PropertyOwnerData.PropertyOwnerId = newPropertyOwnerId;

          // Save the new property owner type
          const newUser = new PropertyOwnerType(PropertyOwnerData);
          await newUser.save();

          res.status(200).send(newUser);
        } catch (error) {
          console.error(error);
          res.status(500).send("Error in Property Owner Type");
        }
      }
      //Utility Type
      if (type === "UtilityType") {
        try {
          const UtilityData = req.body;

          // Remove UtilityId from req.body to avoid conflicts (if sent by mistake)
          delete UtilityData.UtilityId;

          // Find the latest entry to get the last UtilityId
          const lastEntry = await UtilityType.findOne(
            {},
            {},
            { sort: { UtilityId: -1 } }
          );

          // Set new UtilityId
          const newUtilityId =
            lastEntry && Number.isInteger(lastEntry.UtilityId)
              ? lastEntry.UtilityId + 1
              : 1;

          // Check for duplicate UtilityType
          const duplicateProperty = await UtilityType.findOne({
            UtilityType: {
              $regex: `^${UtilityData.UtilityType}$`,
              $options: "i",
            },
          });

          if (duplicateProperty) {
            return res.status(400).json({
              message: "Utility Type already exists",
            });
          }

          // Assign new sequential ID
          UtilityData.UtilityId = newUtilityId;

          // Save the new utility type
          const newUser = new UtilityType(UtilityData);
          await newUser.save();

          res.status(200).send(newUser);
        } catch (error) {
          console.error("Error in UtilityType:", error.message, error.stack);
          res.status(500).json({
            message: "Error in Utility Type",
            error: error.message,
          });
        }
      }
      //Web
      if (type === "Web") {
        try {
          const WebData = req.body;
          console.log("WebData", WebData);

          // if (!req.file) {
          //   return res.status(400).json({ error: "No file uploaded" });
          // }

          // Prepare the update data with the new image filename
          // const Image = req.file.filename;

          // Save the new property owner type
          const newUser = new Web(WebData);
          await newUser.save();

          res.status(200).send(newUser);
        } catch (error) {
          console.error(error);
          res.status(500).send("Error in Saving Web Details");
        }
      }
    } else {
      return res
        .status(400)
        .json({ message: "Type is required in the request body" });
    }
  });
};

module.exports = { Post };
