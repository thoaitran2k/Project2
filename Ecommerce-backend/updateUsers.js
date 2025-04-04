const mongoose = require("mongoose");
const User = require("./src/models/UserModel"); // Đường dẫn đến file UserModel.js của bạn

const updateUsers = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://thoaitran007x:ym9Gn5Ofc9F5nr46@cluster0.bpsus.mongodb.net/test",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    const result = await User.updateMany(
      { cart: { $exists: false } }, // Chỉ cập nhật những user chưa có trường cart
      { $set: { cart: [] } } // Thêm trường cart với giá trị mặc định là mảng rỗng
    );

    console.log(`✅ Đã cập nhật ${result.modifiedCount} user!`);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật:", error);
    mongoose.connection.close();
  }
};

updateUsers();
