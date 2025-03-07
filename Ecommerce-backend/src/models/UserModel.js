const mongoose = require("mongoose");
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
          return /^0\d{9,10}$/.test(v); // Số điện thoại phải có 10-11 chữ số và bắt đầu bằng 0
        },
        message: (props) =>
          `${props.value} không phải là số điện thoại hợp lệ!`,
      },
    },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Nam", "Nữ"], required: true },
    access_token: { type: String },
    refresh_token: { type: String },
    address: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
