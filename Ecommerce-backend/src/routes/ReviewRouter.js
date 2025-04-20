const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

const reviewController = require("../controllers/reviewController");

router.post("/create", authMiddleware, reviewController.createReview);

router.get("/product/:productId", reviewController.getReviewsByProduct);

router.put("/like/:reviewId", authMiddleware, reviewController.likeReview);

router.post("/comment/:reviewId", authMiddleware, reviewController.addComment);

module.exports = router;
