const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    imagesPreview: [{ type: String, required: true }],
    type: { type: String, required: true }, // Ví dụ: "shirt", "watch", "bag"
    price: { type: Number, required: true },
    countInStock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    description: { type: String },
    discount: { type: Number, default: 0 },
    selled: { type: Number, default: 0 },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    variants: [
      {
        color: { type: String },
        size: { type: String },
        quantity: { type: Number, default: 0 },
        diameter: { type: Number },
      },
    ],
    size: {
      type: String,
      required: function () {
        return this.type === "Quần nam" || this.type === "Quần nữ";
      },
    },
    diameter: {
      type: [Number],
      required: function () {
        return this.type === "Đồng hồ";
      },
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
