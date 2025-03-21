const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const uploadExcel = require("../middleware/ImportExcelMiddleware");
const Product = require("../models/ProductModel"); // Đường dẫn đến file model Product

const xlsx = require("xlsx");

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
router.post(
  "/import-products",

  uploadExcel.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "No file uploaded" });
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const products = data.map((row) => ({
        name: row.name,
        image: row.image,
        imagesPreview: row.imagesPreview ? row.imagesPreview.split(",") : [],
        type: row.type,
        price: row.price,
        countInStock: row.countInStock,
        rating: row.rating,
        description: row.description,
        selled: row.selled || 0,
        variants: row.variants ? JSON.parse(row.variants) : [],
      }));

      const createdProducts = await Product.insertMany(products);
      return res.status(201).json({
        status: "OK",
        message: "Products imported successfully",
        data: createdProducts,
      });
    } catch (e) {
      return res.status(500).json({
        status: "ERROR",
        message: "Error importing products",
        error: e.message,
      });
    }
  }
);

module.exports = router;
