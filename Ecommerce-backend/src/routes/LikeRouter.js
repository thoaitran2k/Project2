const express = require("express");
const router = express.Router();
const Like = require("../models/Like");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/most-liked", async (req, res) => {
  try {
    const mostLiked = await Like.aggregate([
      {
        $group: {
          _id: "$product",
          likeCount: { $sum: 1 },
        },
      },
      {
        $sort: { likeCount: -1 },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "products", // tên collection (chữ thường và số nhiều)
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
    ]);

    if (mostLiked.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có sản phẩm nào được thích." });
    }

    res.json(mostLiked[0]);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm được yêu thích nhất:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/most-liked-list", async (req, res) => {
  try {
    const mostLikedList = await Like.aggregate([
      {
        $group: {
          _id: "$product",
          likeCount: { $sum: 1 },
        },
      },
      {
        $sort: { likeCount: -1 },
      },
      {
        $lookup: {
          from: "products", // tên collection của Product (thường viết thường, số nhiều)
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 0,
          product: 1,
          likeCount: 1,
        },
      },
    ]);

    res.json(mostLikedList);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm yêu thích:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/get-liked-products", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const likedProducts = await Like.find({ user: userId }).populate("product");

    res.json(likedProducts);
  } catch (error) {
    console.error("Error getting liked products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
