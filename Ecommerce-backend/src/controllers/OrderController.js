const Order = require("../models/OrderProduct");

const User = require("../models/UserModel");

const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    if (
      !orderData.customer ||
      !orderData.selectedAddress ||
      !orderData.selectedItems
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (
      !Array.isArray(orderData.selectedItems) ||
      orderData.selectedItems.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Selected items must be a non-empty array" });
    }

    // Tạo đơn hàng mới
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
      })),
      paymentMethod: orderData.paymentMethod || "cash",
      discount: orderData.discount || 0,
      subtotal: orderData.subtotal,
      total: orderData.total,
      status: "pending",
      shippingFee: orderData.shippingFee,
      shippingMethod: orderData.shippingMethod,
    });

    const savedOrder = await newOrder.save();

    // Cập nhật user
    const userId = orderData.customer.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.orders.push(savedOrder._id);

    // ✅ Tạo orderHistory từ dữ liệu đã lưu trong DB (savedOrder)
    const orderSummary = {
      orderId: savedOrder._id,
      orderDate: savedOrder.createdAt,
      total: savedOrder.total,
      status: savedOrder.status,
      paymentMethod: savedOrder.paymentMethod,
      ShippingFee: savedOrder.shippingFee,
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
      })),
    };

    user.orderHistory.push(orderSummary);
    await user.save();

    res.status(201).json({
      success: true,
      order: savedOrder,
      orderHistory: orderSummary,
    });
  } catch (err) {
    console.error("Error in createOrder:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Kiểm tra trạng thái hợp lệ
    const allowedStatuses = [
      "pending",
      "processing",
      "shipping",
      "delivered",
      "paid",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    // Cập nhật trạng thái trong userModel -> orderHistory
    await User.updateOne(
      {
        _id: order.customer.userId,
        "orderHistory.orderId": order._id,
      },
      {
        $set: {
          "orderHistory.$.status": status,
        },
      }
    );

    res.status(200).json({ message: "Cập nhật trạng thái thành công", order });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
};
