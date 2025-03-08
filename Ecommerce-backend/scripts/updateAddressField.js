const mongoose = require("mongoose");
const User = require("../src/models/UserModel"); // Import UserModel

async function updateAddressField() {
  try {
    // Kết nối database
    await mongoose.connect(
      "mongodb+srv://thoaitran007x:ym9Gn5Ofc9F5nr46@cluster0.bpsus.mongodb.net/test"
    );

    console.log("Đã kết nối đến MongoDB!");

    // Lấy tất cả người dùng có address là chuỗi hoặc mảng rỗng
    const users = await User.find({
      $or: [
        { address: { $type: "string" } }, // Trường address là chuỗi
        { address: { $eq: [""] } }, // Trường address là mảng rỗng
        { address: { $exists: false } }, // Trường address không tồn tại
      ],
    });

    console.log(`Tìm thấy ${users.length} người dùng cần cập nhật.`);

    // Cập nhật address thành mảng
    for (const user of users) {
      if (typeof user.address === "string") {
        // Nếu address là chuỗi, chuyển đổi thành mảng
        user.address = [{ address: user.address, isDefault: true }];
      } else if (
        Array.isArray(user.address) &&
        user.address.length === 1 &&
        user.address[0] === ""
      ) {
        // Nếu address là mảng rỗng, xóa mảng
        user.address = [];
      } else if (!Array.isArray(user.address)) {
        // Nếu address không phải là mảng, đặt lại thành mảng rỗng
        user.address = [];
      }
      await user.save();
      console.log(`Đã cập nhật địa chỉ cho người dùng ${user._id}`);
    }

    console.log("Cập nhật dữ liệu thành công!");
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Đã ngắt kết nối khỏi MongoDB.");
  }
}

updateAddressField();
