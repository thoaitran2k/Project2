// UserModel.js
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("users", userSchema);
module.exports = User;
