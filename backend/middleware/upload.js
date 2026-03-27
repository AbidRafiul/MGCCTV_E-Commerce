const multer = require("multer");

const storage = multer.memoryStorage();

// membatasi ukuran 2MB
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;