const multer = require("multer");

const storage = multer.memoryStorage(); // ✅ Lưu file vào RAM thay vì ổ cứng

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Chỉ được upload file ảnh!"), false);
  }
  cb(null, true);
};

// Giới hạn kích thước file tối đa 5MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
