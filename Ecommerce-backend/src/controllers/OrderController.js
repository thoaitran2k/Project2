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
        product: item.product._id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        discount: item.product.discount || 0,
        shippingFee: orderData.shippingFee / orderData.selectedItems.length,
        shippingMethod: orderData.shippingMethod,
        type: item.product.type || "", // ✅ Thêm type vào đơn hàng
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
      totalAmount: savedOrder.total,
      status: savedOrder.status,
      paymentMethod: savedOrder.paymentMethod,
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
        type: item.type || "",
        quantity: item.quantity,
        subtotal: item.subtotal,
        discount: item.discount || 0,
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

module.exports = {
  createOrder,
};
