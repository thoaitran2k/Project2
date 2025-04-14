const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const uploadExcel = require("../middleware/ImportExcelMiddleware");
const Product = require("../models/ProductModel"); // Đường dẫn đến file model Product
const PromotionCode = require("../models/PromotionCode");
const PromotionService = require("../services/promotionService");
const promotionController = require("../controllers/promotionController");

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
const removeDiacritics = (str) =>
  str
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");

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

      const products = data.map((row) => {
        const normalizedType = removeDiacritics(row.type);

        let sizes = row.sizes ? row.sizes.split(",") : [];
        let additionalFields = {};
        console.log(
          `Normalized Type: ${normalizedType}, Original Type: ${row.type}`
        );
        if (normalizedType === "dong-ho") {
          if (!row.diameter) {
            throw new Error(
              `Sản phẩm "${row.name}" thiếu thông tin đường kính (diameter).`
            );
          }
          additionalFields.diameter = parseFloat(row.diameter);
        } else if (
          normalizedType === "quan-nam" ||
          normalizedType === "quan-nu"
        ) {
          sizes = ["28", "29", "30", "31", "32"];
        } else if (["trang-suc", "vi", "tui-xach"].includes(normalizedType)) {
          sizes = [];
        }
        console.log(`Tên: ${row.name}, diameter: ${row.diameter}`);
        return {
          name: row.name,
          image: row.image,
          imagesPreview: row.imagesPreview ? row.imagesPreview.split(",") : [],
          type: row.type, // Giữ nguyên type có dấu
          price: row.price,
          countInStock: row.countInStock,
          rating: row.rating,
          description: row.description,
          selled: row.selled || 0,
          colors: row.colors ? row.colors.split(",") : [],
          sizes: sizes,
          variants: row.variants ? JSON.parse(row.variants) : [],
          ...additionalFields,
        };
      });
      console.log("Products chuẩn bị import:", products);

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

//GET ALL TYPE
router.get("/get-all-type", ProductController.getAllType);

router.get("/get-all", ProductController.getProductsByType);

router.get("/get-by-type", ProductController.getProductType);

//SEARCH
router.get("/search", async (req, res) => {
  try {
    const query = req.query.query?.trim() || "";
    if (!query) return res.json([]);

    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).limit(20); // Lấy 20 kết quả để lọc tốt hơn ở frontend

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm" });
  }
});

//ADJUST DISCOUNT BASED ON TYPE
router.put("/update-discount-by-type", async (req, res) => {
  try {
    const { productType, discount } = req.body;

    // Validate input
    if (
      !productType ||
      discount === undefined ||
      discount < 0 ||
      discount > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input. productType is required and discount must be between 0-100",
      });
    }

    // Cập nhật tất cả sản phẩm có type trùng khớp
    const result = await Product.updateMany(
      { type: productType },
      { $set: { discount: discount } }
    );

    res.json({
      success: true,
      message: `Đã cập nhật discount thành ${discount}% cho ${result.modifiedCount} sản phẩm loại ${productType}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

//MÃ GIẢM GIÁ
router.post("/promotion/apply", ProductController.applyCode);
router.post("/create-promotion", ProductController.createPromotionCode);
router.get("/promotion/list", ProductController.getPromotionList);
router.post("/check-coupon", async (req, res) => {
  try {
    const { code, items: cartItems, totalAmount, userId } = req.body;

    const promo = await PromotionCode.findOne({ code: code.toUpperCase() });
    if (!promo || !promo.isActive) {
      return res
        .status(404)
        .json({ message: "Mã không hợp lệ hoặc đã hết hạn" });
    }

    const validation = await PromotionService.validatePromotion(
      promo,
      userId,
      cartItems,
      totalAmount
    );

    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const discount = await PromotionService.calculateDiscount(
      promo,
      validation.applicableItems,
      totalAmount
    );

    return res.json({
      message: "Áp dụng mã thành công",
      discount,
      couponId: promo._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

router.post("/send-promo-email", promotionController.sendPromoCodeToUser);

router.get("/:productId/discount", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "discount"
    );
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
    res.json({ discount: product.discount || 0 });
  } catch (err) {
    console.error("Lỗi lấy discount:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

router.post("/update-selled", ProductController.updateSelledCount);

module.exports = router;
