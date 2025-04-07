const express = require("express");
const userController = require("../controllers/UserController");
const router = express.Router();
const User = require("../models/UserModel");

router.put("/update", userController.updateCart);

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    const user = await User.findById(userId).populate("cart.product");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Validate và xử lý từng item trong giỏ hàng
    const validCartItems = user.cart
      .filter((item) => item.product)
      .map((item) => {
        const { product, size, color, diameter } = item;
        const productType = product.type?.toLowerCase();

        // Tạo itemId duy nhất dựa trên loại sản phẩm
        let itemId;
        if (["áo nam", "áo nữ", "quần nam", "quần nữ"].includes(productType)) {
          // Nếu là áo, quần, sử dụng size và color để tạo itemId duy nhất
          itemId = `${product._id.toString()}-${size}-${color}`;
        } else if (productType === "đồng hồ") {
          // Nếu là đồng hồ, sử dụng color và diameter để tạo itemId duy nhất
          itemId = `${product._id.toString()}-${color}-${diameter}`;
        } else {
          // Đối với các loại sản phẩm khác, chỉ sử dụng product._id làm itemId duy nhất
          itemId = product._id.toString();
        }

        return {
          id: itemId, // Kết hợp _id, size, và color thành id tương ứng với addToCart
          product: {
            _id: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            type: product.type,
            discount: product.discount,
          },
          quantity: item.quantity || 1,
          ...(size && { size }),
          ...(color && { color }),
          ...(diameter && { diameter }),
          selected: item.selected,
        };
      });

    res.json({
      cartItems: validCartItems,
      cartCount: validCartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    });
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

module.exports = router;
