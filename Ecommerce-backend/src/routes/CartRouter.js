const express = require("express");
const userController = require("../controllers/UserController");
const router = express.Router();
const User = require("../models/UserModel"); // Import đúng

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
      .map((item) => ({
        id: item._id.toString(),
        product: {
          _id: item.product._id.toString(),
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          type: item.product.type,
          discount: item.product.discount,
        },
        quantity: item.quantity || 1,
        ...(item.size && { size: item.size }),
        ...(item.color && { color: item.color }),
        ...(item.diameter && { diameter: item.diameter }),
      }));

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
