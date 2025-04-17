const mongoose = require("mongoose");
const Order = require("./src/models/OrderProduct"); // Chỉnh sửa đường dẫn đến file model của bạn

// Kết nối đến MongoDB
mongoose
  .connect(
    "mongodb+srv://thoaitran007x:ym9Gn5Ofc9F5nr46@cluster0.bpsus.mongodb.net/test",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Kết nối thành công đến MongoDB");

    // Xóa tất cả các đơn hàng
    return Order.deleteMany({});
  })
  .then((result) => {
    console.log(`${result.deletedCount} đơn hàng đã bị xóa.`);
    mongoose.disconnect(); // Ngắt kết nối sau khi hoàn thành
  })
  .catch((err) => {
    console.error("Lỗi khi kết nối hoặc xóa dữ liệu:", err);
    mongoose.disconnect();
  });
