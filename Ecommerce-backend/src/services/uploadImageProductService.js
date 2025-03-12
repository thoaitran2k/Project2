const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const uploadImageToCloudinary = (file, folder = "products") => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("File không hợp lệ hoặc không tồn tại"));
    }

    // Kiểm tra định dạng file
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return reject(new Error("Định dạng file không hợp lệ"));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error("Lỗi Cloudinary:", error);
          return reject(new Error(`Lỗi Cloudinary: ${error.message}`));
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

module.exports = { uploadImageToCloudinary };
