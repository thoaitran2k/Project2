const ProductService = require("../services/ProductService");
const uploadImageProductService = require("../services/uploadImageProductService");

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
    } = req.body;

    if (
      !name ||
      !image ||
      !imagesPreview ||
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

    const response = await ProductService.createProduct(req.body);
    return res.status(201).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error creating product", error: e.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Product ID is required" });
    }

    const response = await ProductService.updateProduct(productId, req.body);
    console.log("Cập nhật...");

    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error updating product", error: e.message });
  }
};

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

    const imageUrls = await Promise.all(
      req.files.map((file) =>
        uploadImageProductService.uploadImageToCloudinary(file)
      )
    );

    res.json({ imageUrls }); // ✅ Trả về mảng URLs thay vì chỉ 1 URL
  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    res.status(500).json({ message: "Lỗi tải ảnh lên" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct,
  getAllProduct,
  uploadImageProduct,
  uploadImagePreviewProduct,
};
