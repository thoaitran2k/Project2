const express = require("express");
const OrderController = require("../controllers/OrderController");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create", OrderController.createOrder);
router.post("/cancel", OrderController.cancelOrderImmediately);

const Product = require("../models/ProductModel");
const Order = require("../models/OrderProduct");

router.put(
  "/update-status/:orderId",
  authMiddleware,
  OrderController.updateOrderStatus
);

router.get("/get-all", OrderController.getAllOrders);

router.patch(
  "/:id/request-cancel",
  authMiddleware,
  OrderController.requestCancel
);

router.put("/complete-payment/:orderId", authMiddleware, async (req, res) => {
  try {
    const { action, products } = req.body;

    // 1. Cập nhật trạng thái đơn hàng
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: "paid" },
      { new: true }
    );

    // 2. Cập nhật số lượng đã bán (chỉ khi IPN chưa chạy)
    if (action === "momo_success") {
      await Product.updateSoldCount(products);
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:orderId/status", OrderController.getOrderStatus);

module.exports = router;
