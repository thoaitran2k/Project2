const ProductService = require("../services/ProductService");
const uploadImageProductService = require("../services/uploadImageProductService");
const Product = require("../models/ProductModel");
const PromotionCode = require("../models/PromotionCode");
const PromotionService = require("../services/promotionService");
const Like = require("../models/Like");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      image,
      imagesPreview,
      type,
      price,
      countInStock,
      rating,
      description,
      selled,
      variants,
      diameter, // Lấy diameter từ body
      size, // Lấy size từ body
    } = req.body;

    if (
      !name ||
      // !image ||
      // !imagesPreview ||
      !type ||
      !price ||
      !countInStock ||
      !rating ||
      !variants
    ) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "All fields are required" });
    }

    if (type === "Đồng hồ" && !diameter) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Diameter is required for watches" });
    }

    if ((type === "Quần nam" || type === "Quần nữ") && !size) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Size is required for pants" });
    }

    const response = await ProductService.createProduct(req.body);
    return res.status(201).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error creating product", error: e.message });
  }
};
//____________________________________________GET ALL TYPE
const getAllType = async (req, res) => {
  try {
    const response = await ProductService.getAllType();
    return res.status(200).json({
      status: response.status,
      message: response.message,
      data: response.data,
    });
  } catch (e) {
    return res.status(404).json({
      message: "Có lỗi xảy ra khi lấy loại sản phẩm",
      error: e.message || e,
    });
  }
};

//________________________________________________________________________________
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Product ID is required" });
    }

    const response = await ProductService.updateProduct(productId, req.body);
    // console.log("Cập nhật...");

    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error updating product", error: e.message });
  }
};
//________________________________________________________________________________
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Product ID is required" });
    }

    const response = await ProductService.deleteProduct(productId);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error deleting product", error: e.message });
  }
};
//________________________________________________________________________________
const deleteManyProduct = async (req, res) => {
  try {
    const { ids } = req.body; // Lấy danh sách ID từ body
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Product IDs are required and must be an array",
      });
    }

    const response = await ProductService.deleteManyProduct(ids);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: "Error deleting products",
      error: e.message,
    });
  }
};
//________________________________________________________________________________
const getDetailProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Product ID is required" });
    }

    const response = await ProductService.getDetailProduct(productId);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error getting product details", error: e.message });
  }
};
//________________________________________________________________________________
const getAllProduct = async (req, res) => {
  try {
    const {
      limit,
      page,
      sortField,
      sortOrder,
      type,
      minPrice,
      maxPrice,
      minRating,
    } = req.query;

    const filters = {
      type,
      minPrice,
      maxPrice,
      minRating,
    };

    const response = await ProductService.getAllProduct(
      limit ? Number(limit) : null, // Nếu không có limit, để null
      page ? Number(page) : 0, // Nếu không có page, mặc định là 0
      sortField,
      sortOrder,
      filters
    );

    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error fetching products", error: e.message });
  }
};
//________________________________________________________________________________
const uploadImageProduct = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = await uploadImageProductService.uploadImageToCloudinary(
      req.file
    );
    res.json({ imageUrl });
  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    res.status(500).json({ message: "Lỗi tải ảnh lên" });
  }
};

const uploadImagePreviewProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const imageUrls = await uploadImageProductService.uploadImageToCloudinary(
      req.files
    );

    res.json({ imageUrls });
  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    res.status(500).json({ message: "Lỗi tải ảnh lên" });
  }
};

const getProductsByType = async (req, res) => {
  try {
    const { type, limit, page } = req.query;
    const skip = (page - 1) * limit;

    const query = type ? { type: { $in: type.split(",") } } : {}; // Hỗ trợ nhiều loại

    const products = await Product.find(query)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.status(200).json({ data: products, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductType = async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) {
      return res.status(400).json({ message: "Thiếu type sản phẩm" });
    }

    // Tìm sản phẩm theo type
    const products = await Product.find({ type });

    if (!products.length) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(products);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo type:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const applyCode = async (req, res) => {
  try {
    const { code, cartItems } = req.body;
    const userId = req.user?.id;

    const promo = await PromotionCode.findOne({ code });
    if (!promo || !promo.isActive) {
      return res.status(400).json({ message: "Mã khuyến mãi không hợp lệ" });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

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

    return res.status(200).json({
      success: true,
      discount,
      couponId: promo._id,
      message: `Áp dụng thành công mã giảm ${
        promo.discountType === "percent"
          ? `${promo.discountValue}%`
          : `${promo.discountValue.toLocaleString()}₫`
      }`,
    });
  } catch (err) {
    console.error("Error applying promo code:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

const createPromotionCode = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue = 0,
      appliesTo = "all",
      targetIds = [],
      maxUsage,
      startAt,
      expiredAt,
      maxDiscount,
      isActive = true,
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue || !expiredAt) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    if (
      discountType === "percent" &&
      (discountValue < 1 || discountValue > 100)
    ) {
      return res
        .status(400)
        .json({ message: "Phần trăm giảm giá không hợp lệ" });
    }

    if (await PromotionCode.exists({ code: code.toUpperCase() })) {
      return res.status(400).json({ message: "Mã khuyến mãi đã tồn tại" });
    }

    const newPromo = new PromotionCode({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      appliesTo,
      targetIds,
      maxUsage,
      startAt,
      expiredAt,
      maxDiscount,
      usedCount: 0,
      isActive,
    });

    await newPromo.save();
    return res.status(201).json({
      message: "Tạo mã khuyến mãi thành công",
      promo: newPromo,
    });
  } catch (err) {
    console.error("Lỗi tạo mã khuyến mãi:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

const getPromotionList = async (req, res) => {
  try {
    // Truy vấn tất cả mã giảm giá
    const promotions = await PromotionCode.find().sort({ createdAt: -1 });

    // Kiểm tra nếu không có mã giảm giá nào
    if (promotions.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy mã giảm giá nào" });
    }

    return res.status(200).json(promotions);
  } catch (error) {
    console.error("Lỗi lấy danh sách mã giảm giá:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

const updateSelledCount = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách sản phẩm không hợp lệ" });
    }

    const updatePromises = products.map(async (item) => {
      const { productId, quantity = 0, color, size, diameter } = item;
      const product = await Product.findById(productId);

      if (!product) return;

      // Tăng selled và giảm tồn kho tổng
      product.selled = (product.selled || 0) + quantity;
      product.countInStock = Math.max(
        (product.countInStock || 0) - quantity,
        0
      );

      // Tìm variant phù hợp nếu có
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const isWatch = product.type?.toLowerCase() === "đồng hồ";

        const matchedVariant = product.variants.find((v) => {
          const matchColor = !color || v.color === color;
          const matchSize = !size || String(v.size) === String(size);
          const matchDiameter = isWatch
            ? Number(v.diameter) === Number(diameter)
            : true;

          return matchColor && matchSize && matchDiameter;
        });

        if (matchedVariant) {
          matchedVariant.quantity = Math.max(
            (matchedVariant.quantity || 0) - quantity,
            0
          );
        }
      }

      await product.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Cập nhật selled và tồn kho thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật selled:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const revertSelledToStock = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách sản phẩm không hợp lệ" });
    }

    const updatePromises = products.map(async (item) => {
      const { productId, quantity = 0, color, size, diameter } = item;
      const product = await Product.findById(productId);

      if (!product) return;

      // Giảm số lượng đã bán và tăng tồn kho tổng
      product.selled = Math.max((product.selled || 0) - quantity, 0);
      product.countInStock = (product.countInStock || 0) + quantity;

      // Cập nhật tồn kho biến thể nếu có
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const isWatch = product.type?.toLowerCase() === "đồng hồ";

        const matchedVariant = product.variants.find((v) => {
          const matchColor = !color || v.color === color;
          const matchSize = !size || String(v.size) === String(size);
          const matchDiameter = isWatch
            ? Number(v.diameter) === Number(diameter)
            : true;

          return matchColor && matchSize && matchDiameter;
        });

        if (matchedVariant) {
          matchedVariant.quantity = (matchedVariant.quantity || 0) + quantity;
        }
      }

      await product.save();
    });

    await Promise.all(updatePromises);

    res
      .status(200)
      .json({ message: "Đã hoàn kho và giảm selled sau khi huỷ đơn" });
  } catch (error) {
    console.error("Lỗi khi hoàn kho:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//LIKE SẢN PHẨM
const toggleLike = async (req, res) => {
  const { userId } = req.body;
  const { productId } = req.params;

  if (!userId || !productId) {
    return res.status(400).json({ message: "Missing userId or productId" });
  }

  try {
    // Kiểm tra xem đã like chưa
    const existingLike = await Like.findOne({
      user: userId,
      product: productId,
    });

    if (existingLike) {
      // Nếu đã like => Unlike
      await Like.deleteOne({ _id: existingLike._id });
    } else {
      // Nếu chưa like => Like
      await Like.create({ user: userId, product: productId });
    }

    // Cập nhật số lượng like
    const likeCount = await Like.countDocuments({ product: productId });
    await Product.findByIdAndUpdate(productId, { likeCount });

    res.status(200).json({ liked: !existingLike, likeCount });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//________________________________________________________________________________
module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct,
  getAllProduct,
  uploadImageProduct,
  uploadImagePreviewProduct,
  deleteManyProduct,
  getAllType,
  getProductsByType,
  getProductType,
  applyCode,
  createPromotionCode,
  getPromotionList,
  updateSelledCount,
  toggleLike,
  revertSelledToStock,
};
