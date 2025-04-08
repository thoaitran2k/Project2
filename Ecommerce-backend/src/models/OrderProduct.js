const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Định nghĩa OrderSchema
const OrderSchema = new Schema({
  customer: {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  selectedAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  selectedItems: [
    {
      id: { type: String, required: true },
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      productName: { type: String }, // Tên sản phẩm
      productImage: { type: String }, // Hình ảnh sản phẩm
      price: { type: Number, required: true }, // Giá sản phẩm
      quantity: { type: Number, required: true }, // Số lượng
      size: { type: String }, // Kích thước
      color: { type: String }, // Màu sắc
      diameter: { type: String }, // Đường kính (nếu có)
      productSubtotal: { type: Number, required: true },
      discountAmount: { type: Number }, // Subtotal cho mỗi mặt hàng
    },
  ],
  paymentMethod: {
    type: String,
    enum: ["cash", "momo", "viettelpay"],
    required: true,
  },
  shippingFee: { type: Number, required: true },
  shippingMethod: {
    type: String,
    enum: ["standard", "express"],
    required: true,
  },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipping", "delivered", "paid"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Định nghĩa Order model
const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
