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

productSchema.statics.updateProductRating = async function (productId) {
  try {
    const Review = require("./Review");
    const { Types } = require("mongoose");

    // Lấy tất cả các review của sản phẩm
    const reviews = await Review.find({ product: productId }).select("rating");

    if (reviews.length > 0) {
      // Tính tổng rating
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      // Tính trung bình
      const averageRating = totalRating / reviews.length;
      // Làm tròn đến 0.5 gần nhất
      const roundedRating = Math.round(averageRating * 2) / 2;

      // Cập nhật rating cho sản phẩm
      await this.findByIdAndUpdate(productId, {
        rating: roundedRating,
      });

      return roundedRating;
    }

    // Nếu không có review nào, đặt rating về 0
    await this.findByIdAndUpdate(productId, { rating: 0 });
    return 0;
  } catch (error) {
    console.error("Error updating product rating:", error);
    throw error;
  }
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
