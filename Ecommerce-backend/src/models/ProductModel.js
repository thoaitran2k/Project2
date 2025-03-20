const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    imagesPreview: [{ type: String, required: true }],
    type: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    description: { type: String },
    discount: { type: Number, default: 0 },
    selled: { type: Number, default: 0 },
    colors: [{ type: String }], // Có thể dùng enum nếu cần
    sizes: [{ type: String }], // Ví dụ: enum: ["S", "M", "L", "XL"]
    variants: [
      {
        color: { type: String },
        size: { type: String },
        quantity: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
