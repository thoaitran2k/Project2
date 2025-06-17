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

    const users = await User.find({ orderHistory: { $exists: true, $ne: [] } });

    let updatedCount = 0;

    for (const user of users) {
      if (Array.isArray(user.orderHistory) && user.orderHistory.length > 13) {
        // Xóa từ index 13 (phần tử thứ 14) đến index 23 (tức là xóa 11 phần tử)
        user.orderHistory.splice(13, 2);
        await user.save();
        updatedCount++;
      }
    }

    console.log(`✅ Đã cập nhật ${updatedCount} user!`);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật:", error);
    mongoose.connection.close();
  }
};

updateUsers();
