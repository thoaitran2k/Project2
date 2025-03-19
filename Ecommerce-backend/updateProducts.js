const mongoose = require("mongoose");
const Product = require("./src/models/ProductModel");

const colorsList = ["red", "white", "blue", "black"];
const sizesList = ["S", "M", "L", "XL", "XXL"];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const updateProducts = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://thoaitran007x:ym9Gn5Ofc9F5nr46@cluster0.bpsus.mongodb.net/test",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    const products = await Product.find({}); // Lấy tất cả sản phẩm

    for (const product of products) {
      const randomVariants = Array.from({ length: 3 }, () => ({
        color: getRandomElement(colorsList),
        size: getRandomElement(sizesList),
        quantity: Math.floor(Math.random() * 50) + 1, // Random số lượng từ 1 - 50
      }));

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            variants: randomVariants,
            colors: [...new Set(randomVariants.map((v) => v.color))], // Lọc ra danh sách màu không trùng
            sizes: [...new Set(randomVariants.map((v) => v.size))], // Lọc ra danh sách size không trùng
            countInStock: 0,
          },
        }
      );
    }

    console.log(`✅ Đã cập nhật variants cho ${products.length} sản phẩm!`);

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật:", error);
    mongoose.connection.close();
  }
};

updateProducts();
