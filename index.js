const express = require("express");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const propertyRoutes1 = require("./Route/Routes");
const propertyRoutes = require("./Route/routes123");
const propertyRoutes2 = require("./Route/routes324");


const EmailMaster = require("./Schema/Property/EmailMasterSchema");

const app = express();

// Increase the request size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());
app.use(express.json());
// app.use(express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("Web"));

const transporterCache = new Map();

const DEFAULT_EMAIL_CONFIG = {
  PropertyCode: "DEFAULT",
  Email: "ragavendarmicrogenn@gmail.com",
  Password: "hacm ofji uhua cezv", // Ensure this is a valid App Password
  Port: 465,
  SMTPHost: "smtp.gmail.com",
  Secure: true, // Must be true for port 465
  Status: "1",
};

const getTransporter = () => {
  if (!transporterCache.has("DEFAULT")) {
    const transporter = nodemailer.createTransport({
      host: DEFAULT_EMAIL_CONFIG.SMTPHost,
      port: DEFAULT_EMAIL_CONFIG.Port,
      secure: DEFAULT_EMAIL_CONFIG.Secure, // Set to true for SSL on port 465
      auth: {
        user: DEFAULT_EMAIL_CONFIG.Email,
        pass: DEFAULT_EMAIL_CONFIG.Password,
      },
      debug: true, // Keep for detailed logs
      logger: true, // Keep for detailed logs
    });
    transporterCache.set("DEFAULT", transporter);
  }
  return transporterCache.get("DEFAULT");
};

app.post("/api/send-email", async (req, res) => {
  const { to, subject, html, propertyCode } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({
      error: "Guest email, subject, and html content are required",
    });
  }

  try {
    const transporter = getTransporter();

    // Verify connection
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    const mailOptions = {
      from: `"Py-Olliv Booking" <${DEFAULT_EMAIL_CONFIG.Email}>`,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent using config: ${info.messageId}`);

    res.status(200).json({
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error in email sending process:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
});

/////////////////////////////////////////////////

const multer = require("multer");
const Web = require("./Schema/Web/WebSchema"); // Your Mongoose model

// Configure multer for multiple file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Web/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanFileName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${timestamp}-${cleanFileName}`);
  },
});

// File filter to allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error("Invalid file type. Allowed types: images, PDF, Word, Excel"),
      false
    );
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Middleware to parse JSON and handle multipart/form-data
app.use(express.json());

// Define the route with multer middleware
app.post("/api/web", upload.any(), async (req, res) => {
  const type = req.body.type || "Web";

  if (type !== "Web") {
    return res.status(400).send("Invalid type");
  }

  try {
    const formData = req.body;

    // Check for duplicate hotel name
    const duplicateProperty = await Web.findOne({
      hotelName: {
        $regex: `^${formData.hotelName}$`,
        $options: "i",
      },
    });

    if (duplicateProperty) {
      return res.status(400).json({
        message: "Hotel Name already exists. Please use a different Name.",
      });
    }
    // 1744108908137-icons8-doctors-60.png
    // Parse the JSON data from the 'data' field
    const webData = JSON.parse(req.body.data || "{}");
    console.log("WebData before file processing:", webData);

    // Handle files if they exist
    if (req.files && req.files.length > 0) {
      const multiFileFields = [
        "cancelledCheque",
        "gst",
        "propertyImages",
        "facadeImages",
        "parkingImages",
        "lobbyImages",
        "receptionImages",
        "corridorsImages",
        "liftElevatorsImages",
        "bathroomImages",
        "otherAreasImages",
        "Utilities",
      ];

      multiFileFields.forEach((field) => {
        const files = req.files
          .filter((f) => f.fieldname === field)
          .map((f) => f.filename);
        if (files.length > 0) {
          webData[field] = files;
        }
      });

      // Handle room images
      if (webData.rooms && Array.isArray(webData.rooms)) {
        webData.rooms = webData.rooms.map((room, index) => {
          const roomImages = req.files
            .filter((file) => file.fieldname === `roomImages_${index}`)
            .map((file) => file.filename);
          return {
            ...room,
            roomImages: roomImages.length > 0 ? roomImages : [],
          };
        });
      }

      // Handle utilities photos
      if (webData.utilities && Array.isArray(webData.utilities)) {
        webData.utilities = webData.utilities.map((utility, index) => {
          const utilityPhotos = req.files
            .filter((file) => file.fieldname === `photos_${index}`)
            .map((file) => file.filename);
          return {
            ...utility,
            photos: utilityPhotos.length > 0 ? utilityPhotos : [],
          };
        });
      }
    }

    // Initialize empty arrays for file fields if not present
    const allFileFields = [
      "cancelledCheque",
      "gst",
      "propertyImages",
      "facadeImages",
      "parkingImages",
      "lobbyImages",
      "receptionImages",
      "corridorsImages",
      "liftElevatorsImages",
      "bathroomImages",
      "otherAreasImages",
    ];

    allFileFields.forEach((field) => {
      if (!webData[field]) {
        webData[field] = [];
      }
    });

    // Save to database
    const newUser = new Web(webData);
    await newUser.save();

    console.log("Saved Web Data:", newUser);
    res.status(200).json(newUser);
  } catch (error) {
    console.error("Error in Saving Web Details:", error);
    res.status(500).json({
      message: "Error in Saving Web Details",
      error: error.message,
    });
  }
});
////////////////////////////////////////////////

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api", propertyRoutes);
app.use("/api", propertyRoutes1);
app.use("/api",propertyRoutes2);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(process.env.DB_PORT, () => {
  console.log(`Server running on port ${process.env.DB_PORT}`);
});
