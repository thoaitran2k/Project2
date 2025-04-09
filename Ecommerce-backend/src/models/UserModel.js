const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  address: { type: String },
  isDefault: { type: Boolean, default: false },
  name: { type: String },
  phoneDelivery: {
    type: String,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^0\d{9,10}$/.test(v);
        },
        message: (props) =>
          `${props.value} không phải là số điện thoại hợp lệ!`,
      },
    },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Nam", "Nữ"], required: true },
    access_token: { type: String },
    refresh_token: { type: String },
    address: [AddressSchema],
    // Trường address là một mảng
    avatar: { type: String, default: "" },
    //Khóa tài khoản người dùng nếu vi phạm
    isBlocked: { type: Boolean, default: false },
    failedAttempts: { type: Number, default: 0 },
    blockedUntil: { type: Date, default: null },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    cart: [
      {
        id: { type: String, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: String,
        color: String,
        diameter: String,
        discount: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        selected: {
          type: Boolean,
          default: false,
        },
      },
    ],
    orderHistory: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        orderDate: { type: Date, default: Date.now },
        total: { type: Number, required: true },
        products: [
          {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            name: { type: String },
            image: { type: String },
            price: { type: Number },
            quantity: { type: Number },
            size: { type: String },
            color: { type: String },
            diameter: { type: String },
            subtotal: { type: Number }, // Tổng của từng sản phẩm
            discount: { type: Number },
          },
        ],
        status: {
          type: String,
          enum: [
            "pending",
            "processing",
            "shipping",
            "delivered",
            "paid",
            "cancelled",
          ],
          default: "pending",
        },
        address: {
          name: { type: String },
          phone: { type: String },
          address: { type: String },
        },
        paymentMethod: { type: String },
        ShippingFee: { type: Number },
        totalDiscount: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("users", userSchema);
module.exports = User;
