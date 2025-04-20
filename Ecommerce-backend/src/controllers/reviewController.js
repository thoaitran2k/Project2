const Review = require("../models/Review");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");

const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, images, size, color, diameter, title } =
      req.body;
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra nếu người dùng đã đánh giá rồi
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: user._id,
    });

    // if (alreadyReviewed) {
    //   return res
    //     .status(400)
    //     .json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    // }

    // Tạo review mới
    const newReview = new Review({
      product: productId,
      user: user._id,
      rating,
      title,
      comment,
      images,
      size,
      color,
      diameter,
      userSnapshot: {
        username: user.username,
        avatar: user.avatar,
      },
    });

    await newReview.save();

    // Cập nhật rating cho sản phẩm
    await Product.updateProductRating(productId);

    return res.status(201).json({
      message: "Đánh giá thành công",
      review: newReview,
    });
  } catch (error) {
    console.error("Lỗi khi tạo review:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 }) // Mới nhất trước
      .limit(100); // Giới hạn, tùy vào nhu cầu

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách review:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }

    const alreadyLiked = review.likes.some(
      (userId) => userId.toString() === user._id.toString()
    );
    if (alreadyLiked) {
      return res
        .status(400)
        .json({ message: "Bạn đã thích bài đánh giá này rồi" });
    }

    review.likes.push(user._id);
    await review.save();

    return res.status(200).json({
      message: "Thích bài đánh giá thành công",
      likes: review.likes.length,
    });
  } catch (error) {
    console.error("Lỗi khi like review:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const addComment = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    if (!comment || comment.trim() === "") {
      return res
        .status(400)
        .json({ message: "Nội dung bình luận không được để trống" });
    }

    // Tìm review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }

    // Tìm thông tin người dùng
    const userSnapshot = await User.findById(user._id, "username avatar");
    if (!userSnapshot || !userSnapshot.username || !userSnapshot.avatar) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng hoặc thiếu thông tin" });
    }

    review.comments.forEach((comment) => {
      if (!comment.username || !comment.avatar) {
        comment.username =
          userSnapshot.username || "Tên người dùng không xác định";
        comment.avatar = userSnapshot.avatar || "URL ảnh mặc định";
      }
    });

    // Push comment đúng định dạng
    const newComment = {
      user: user._id,
      username: userSnapshot.username,
      avatar: userSnapshot.avatar,
      content: comment,
      createdAt: new Date(),
    };

    if (!Array.isArray(review.comments)) {
      review.comments = []; // đảm bảo comments luôn là array
    }

    review.comments.push(newComment);
    await review.save();

    return res.status(200).json({
      message: "Bình luận thành công",
      comment: newComment,
    });
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { createReview, getReviewsByProduct, likeReview, addComment };
