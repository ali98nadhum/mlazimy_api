const multer = require("multer");

const photoStorage = multer.memoryStorage();

const photoUpload = multer({
  storage: photoStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "الملف غير مدعوم" }, false);
    }
  },
  limits: { fileSize: 1024 * 1024 * 2 }, // الحد الأقصى لحجم الملف: 2 ميجابايت
});

module.exports = photoUpload;
