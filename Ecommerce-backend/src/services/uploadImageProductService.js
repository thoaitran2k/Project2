const cloudinary = require("./cloudinary");
const streamifier = require("streamifier");
const crypto = require("crypto");

const uploadImageToCloudinary = async (files, folder = "products") => {
  try {
    if (!files) {
      throw new Error("Không có file nào hợp lệ để upload");
    }

    // Nếu chỉ có 1 file, chuyển nó thành mảng để xử lý đồng nhất
    if (!Array.isArray(files)) {
      files = [files];
    }

    const hashes = await Promise.all(
      files.map(async (file) => {
        if (!file || !file.buffer) {
          throw new Error("File không hợp lệ hoặc không tồn tại");
        }
        return {
          file,
          hash: crypto.createHash("sha256").update(file.buffer).digest("hex"),
        };
      })
    );

    const uniqueUploads = [];
    const uploadedImages = {};

    for (const { file, hash } of hashes) {
      //console.log(`🔍 Kiểm tra ảnh trùng với hash: ${hash}`);

      if (uploadedImages[hash]) {
        //console.log("✅ Ảnh đã được xử lý trước đó:", uploadedImages[hash]);
        continue;
      }

      // 🔹 Tìm ảnh theo hash trong Cloudinary
      const existingImages = await cloudinary.search
        .expression(`folder=${folder} AND tags=${hash}`)
        .execute();

      if (existingImages.resources.length > 0) {
        // //console.log(
        //   "✅ Ảnh đã tồn tại:",
        //   existingImages.resources[0].secure_url
        // );
        uploadedImages[hash] = existingImages.resources[0].secure_url;
        continue;
      }

      console.log("🆕 Ảnh chưa có, tiến hành upload...");

      // 🔹 Upload ảnh mới
      const uploadedImage = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, tags: [hash] },
          (error, result) => {
            if (error) {
              console.error("Lỗi Cloudinary:", error);
              return reject(new Error(`Lỗi Cloudinary: ${error.message}`));
            }
            //console.log("✅ Upload thành công:", result.secure_url);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploadedImages[hash] = uploadedImage;
      uniqueUploads.push(uploadedImage);
    }

    return Object.values(uploadedImages);
  } catch (error) {
    console.error("Lỗi kiểm tra ảnh:", error);
    throw new Error(`Lỗi kiểm tra ảnh: ${error.message}`);
  }
};

module.exports = { uploadImageToCloudinary };
