const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'image' && file.mimetype.startsWith("image")) {
            cb(null, true);
        } else if (file.fieldname === 'file' && file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file format"), false);
        }
    },
}).fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]);

module.exports = upload;
