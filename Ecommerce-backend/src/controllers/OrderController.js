const Order = require("../models/OrderProduct");

const User = require("../models/UserModel");
const mongoose = require("mongoose");

const PromotionCode = require("../models/PromotionCode");

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer.userId")
      .populate("selectedItems.product");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi truy vấn đơn hàng:", error); // dòng mới để xem lỗi
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message || error,
    });
  }
};

const requestCancel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Chỉ cho phép yêu cầu hủy khi đơn ở trạng thái pending hoặc processing
    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({
        message:
          "Chỉ có thể yêu cầu hủy đơn hàng ở trạng thái 'Chờ xử lý' hoặc 'Đang xử lý'",
      });
    }

    order.status = "requestedCancel";
    await order.save();

    // Cập nhật trạng thái trong orderHistory của user
    await User.updateOne(
      {
        _id: order.customer.userId,
        "orderHistory.orderId": order._id,
      },
      {
        $set: {
          "orderHistory.$.status": "requestedCancel",
        },
      }
    );

    res.status(200).json({
      message: "Yêu cầu hủy đã được gửi chờ admin xác nhận",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderData = req.body;

    // Validate input
    if (
      !orderData.customer ||
      !orderData.selectedAddress ||
      !orderData.selectedItems
    ) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (
      !Array.isArray(orderData.selectedItems) ||
      orderData.selectedItems.length === 0
    ) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Selected items must be a non-empty array" });
    }

    // Extract promotion codes from items
    const promotionCodes = orderData.selectedItems
      .filter((item) => item.promotion)
      .map((item) => item.promotion);

    // 1. Reserve promotion codes first (increase usedCount)
    if (promotionCodes.length > 0) {
      await PromotionCode.updateMany(
        { code: { $in: promotionCodes } },
        { $inc: { usedCount: 1 } },
        { session }
      );
    }

    // 2. Create order
    const newOrder = new Order({
      customer: {
        userId: orderData.customer.userId,
        username: orderData.customer.username,
        phone: orderData.customer.phone,
        email: orderData.customer.email,
      },
      selectedAddress: {
        name: orderData.selectedAddress.name,
        phone: orderData.selectedAddress.phone,
        address: orderData.selectedAddress.address,
      },
      selectedItems: orderData.selectedItems.map((item) => ({
        id: item.id,
        product: item.product,
        productName: item.productName,
        productImage: item.productImage,
        price: item.price,
        color: item.color,
        diameter: item.diameter,
        size: item.size,
        quantity: item.quantity,
        productSubtotal: item.productSubtotal,
        discountAmount: item.discountAmount || 0,
        shippingFee: orderData.shippingFee / orderData.selectedItems.length,
        type: item.type || "",
        promotion: item.promotion || null,
      })),
      paymentMethod: orderData.paymentMethod || "cash",
      discount: orderData.discount || 0,
      subtotal: orderData.subtotal,
      total: orderData.total,
      status:
        orderData.paymentMethod === "cash" ? "pending" : "pending_payment",
      shippingFee: orderData.shippingFee,
      shippingMethod: orderData.shippingMethod,
    });

    const savedOrder = await newOrder.save({ session });

    // 3. Update user
    const user = await User.findById(orderData.customer.userId).session(
      session
    );
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    user.orders.push(savedOrder._id);

    const orderSummary = {
      orderId: savedOrder._id,
      orderDate: savedOrder.createdAt,
      total: savedOrder.total,
      status: savedOrder.status,
      paymentMethod: savedOrder.paymentMethod,
      shippingFee: savedOrder.shippingFee,
      totalDiscount: savedOrder.discount || 0,
      address: {
        name: savedOrder.selectedAddress.name,
        phone: savedOrder.selectedAddress.phone,
        address: savedOrder.selectedAddress.address,
      },
      products: savedOrder.selectedItems.map((item) => ({
        productId: item.product,
        name: item.productName,
        image: item.productImage,
        price: item.price,
        quantity: item.quantity,
        size: item.size || "",
        color: item.color || "",
        diameter: item.diameter || "",
        subtotal: item.productSubtotal,
        discount: item.discountAmount || 0,
        type: item.type,
      })),
    };

    user.orderHistory.push(orderSummary);
    await user.save({ session });

    // 4. Update product quantities (optional)
    if (orderData.updateInventory) {
      const bulkOps = orderData.selectedItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOps, { session });
    }

    // Commit transaction if everything succeeded
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      order: savedOrder,
      orderHistory: orderSummary,
    });
  } catch (err) {
    // If error occurs, abort transaction and rollback
    await session.abortTransaction();

    console.error("Error in createOrder:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: err.message,
    });
  } finally {
    session.endSession();
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, confirmCancel } = req.body;

    console.log("body", req.body);

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Nếu đang ở trạng thái yêu cầu hủy
    if (order.status === "requestedCancel") {
      const allowedStatuses = ["pending", "cancelled"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Không thể cập nhật trạng thái từ 'requestedCancel' sang '${status}'.`,
        });
      }

      if (status === "cancelled" && confirmCancel !== true) {
        return res.status(400).json({
          success: false,
          message: "Cần xác nhận hủy đơn hàng.",
        });
      }
    }

    // ✅ Cập nhật trạng thái trong bảng Order
    order.status = status;
    await order.save();

    // ✅ Tìm người dùng chứa order này trong orderHistory
    const user = await User.findOne({ "orderHistory.orderId": orderId });
    if (user) {
      const history = user.orderHistory.find(
        (entry) => entry.orderId.toString() === orderId
      );
      if (history) {
        history.status = status;
        await user.save();
      }
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Error in updateOrderStatus:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getAllOrders,
  requestCancel,
};
