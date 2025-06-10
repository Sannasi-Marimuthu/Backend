// middleware/multerConfig.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "Uploads/";

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
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
}).any(); // Allow any field names, with validation in the backend

module.exports = upload;
