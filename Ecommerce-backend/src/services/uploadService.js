const cloudinary = require("../Cloudinary/cloudinaryConfig");

const uploadImageToCloudinary = async (file) => {
  try {
    // Tải ảnh lên Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "avatars", // Thư mục lưu trữ trên Cloudinary
    });

    // Trả về URL của ảnh
    return result.secure_url;
  } catch (error) {
    console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
    throw error;
  }
};

module.exports = { uploadImageToCloudinary };
