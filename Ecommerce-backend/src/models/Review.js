const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],

    userSnapshot: {
      username: String,
      avatar: String,
    },

    size: { type: String },
    color: { type: String },
    diameter: { type: String },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: { type: String, required: true },
        avatar: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },

  {
    timestamps: true,
  }
);

reviewSchema.post("save", async function (doc) {
  const Product = require("./ProductModel");
  try {
    await Product.updateProductRating(doc.product);
  } catch (err) {
    console.error("Error auto-updating rating after review:", err);
  }
});

reviewSchema.post("remove", async function (doc) {
  const Product = require("./ProductModel");
  try {
    await Product.updateProductRating(doc.product);
  } catch (err) {
    console.error("Error auto-updating rating after review removal:", err);
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
