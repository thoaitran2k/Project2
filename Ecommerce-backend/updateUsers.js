const mongoose = require("mongoose");
const User = require("./src/models/UserModel"); // Đường dẫn đúng đến model User

const updateUsers = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://thoaitran007x:ym9Gn5Ofc9F5nr46@cluster0.bpsus.mongodb.net/test",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    // Chỉ cập nhật những user chưa có trường orderHistory
    const result = await User.updateMany(
      { orderHistory: { $exists: true } },
      { $set: { orderHistory: [] } }
    );

    console.log(`✅ Đã cập nhật ${result.modifiedCount} user!`);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật:", error);
    mongoose.connection.close();
  }
};

updateUsers();
