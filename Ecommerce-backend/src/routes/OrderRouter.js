const express = require("express");
const OrderController = require("../controllers/OrderController");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create", OrderController.createOrder);

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

module.exports = router;
