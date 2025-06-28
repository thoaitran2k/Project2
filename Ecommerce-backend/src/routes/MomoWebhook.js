const express = require("express");

const router = express.Router();

// routes/MomoWebhook.js
router.post("/ipn", async (req, res) => {
  console.log("MoMo IPN received:", req.body);

  try {
    const { orderId, resultCode, message } = req.body;

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      console.log(`Order ${orderId} not found`);
      return res.status(404).json({ message: "Order not found" });
    }

    // Chỉ xử lý nếu đơn hàng còn ở trạng thái pending_payment
    if (order.status === "pending_payment") {
      if (resultCode === "0") {
        order.status = "paid";
        console.log(`✅ Updated order ${orderId} to paid`);
      } else {
        order.status = "cancelled";
        order.cancelReason = `MoMo payment failed: ${
          message || "Unknown reason"
        }`;
        console.log(`❌ Updated order ${orderId} to cancelled`);
      }

      order.updatedAt = new Date();
      await order.save();

      // Cập nhật user order history
      await User.updateOne(
        { "orderHistory.orderId": order._id },
        { $set: { "orderHistory.$.status": order.status } }
      );
    }

    res.status(200).json({ message: "IPN processed" });
  } catch (error) {
    console.error("IPN processing error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
