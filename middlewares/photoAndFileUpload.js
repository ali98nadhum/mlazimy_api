const path = require("path");
const multer = require("multer");

// إعداد تخزين الصور
const photoStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "../images"));
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    }
});

// إعداد تخزين الملفات
const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "../files"));
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    }
});

// إعداد Multer للصور
const photoUpload = multer({
    storage: photoStorage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file format for images"), false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 2 } // 2 ميغابايت
});

// إعداد Multer للملفات
const fileUpload = multer({
    storage: fileStorage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file format for files"), false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 5 } // 5 ميغابايت
});

// إعداد Multer لرفع الملفات المتعددة بحقول مختلفة
const upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            if (file.fieldname === 'image') {
                cb(null, path.join(__dirname, "../images"));
            } else if (file.fieldname === 'file') {
                cb(null, path.join(__dirname, "../files"));
            }
        },
        filename: function(req, file, cb) {
            cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
        }
    }),
    fileFilter: function(req, file, cb) {
        if (file.fieldname === 'image' && file.mimetype.startsWith("image")) {
            cb(null, true);
        } else if (file.fieldname === 'file' && file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file format"), false);
        }
    }
}).fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]);

module.exports = upload;