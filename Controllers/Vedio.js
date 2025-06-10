const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

const conn = mongoose.connection;

let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("videos"); // Collection name
});

// Upload Video Controller
const uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Ensure _id is valid before using it
  if (!req.file.id) {
    return res.status(500).json({ error: "File upload failed" });
  }

  res.json({
    file: req.file,
    url: `/api/videos/${req.file.filename}`,
  });
};

// Get Video Controller
const getVideo = (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ error: "No video found" });
    }

    const readStream = gfs.createReadStream(file.filename);
    res.set("Content-Type", "video/mp4");
    readStream.pipe(res);
  });
};

module.exports = { uploadVideo, getVideo };
