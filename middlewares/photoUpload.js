const path = require("path");
const multer = require("multer");

// photo storeage
const photoStoreage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// photo upload middleware
const photoUpload = multer({
  storage: photoStoreage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "الملف غير مدعوم" }, false);
    }
  },
  limits: { fileSize: 1024 * 1024 * 2 },
});

module.exports = photoUpload;
