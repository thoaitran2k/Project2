const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    orderItem: [
      {
        name: { type: String, require: true },
        amount: { type: Number, require: true },
        image: { type: String, require: true },
        price: { type: Boolean, require: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          require: true,
        },
      },
    ],
    shippingAdress: {
      fullName: { type: String, require: true },
      adress: { type: String, require: true },
      city: { type: String, require: true },
      country: { type: String, require: true },
      phone: { type: Number, require: true },
    },
    paymentMethod: { type: String, require: true },
    itemsPrice: { type: Number, require: true },
    shippingPrice: { type: String, require: true },
    taxPrice: { type: Number, require: true },
    totalNumber: { type: String, require: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
    isPaid: { type: Boolean, default: false },
    paiAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
