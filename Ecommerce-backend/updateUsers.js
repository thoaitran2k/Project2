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
      if (Array.isArray(user.orderHistory) && user.orderHistory.length > 0) {
        // Xoá phần tử từ index 0 đến 3
        user.orderHistory = user.orderHistory.slice(5); // loại bỏ 4 phần tử đầu
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
