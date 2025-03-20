const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const uploadService = require("../services/uploadService");
const multer = require("multer");

// Cấu hình multer (lưu file trong bộ nhớ)

// Routes CRUD sản phẩm
router.post("/create", ProductController.createProduct);
router.put("/update/:id", authMiddleware, ProductController.updateProduct);
router.get("/get-details/:id", ProductController.getDetailProduct);
router.delete("/delete/:id", authMiddleware, ProductController.deleteProduct);
router.get("/get-all", ProductController.getAllProduct);
router.delete(
  "/delete-many",
  authMiddleware,
  ProductController.deleteManyProduct
);

// Route upload ảnh sản phẩm
router.post(
  "/upload-image",
  upload.single("image"),
  ProductController.uploadImageProduct
);

router.post(
  "/upload-images",
  upload.array("images", 4),
  ProductController.uploadImagePreviewProduct
);

//Import sản phẩm từ file excel

module.exports = router;
