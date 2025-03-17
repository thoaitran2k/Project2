const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    imagesPreview: [{ type: String, required: true }],
    type: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    description: { type: String },
    discount: { type: Number },
    selled: { type: Number },
    // Thêm thuộc tính mới
    colors: [{ type: String }],
    sizes: [{ type: String }],
    variants: [
      {
        color: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
