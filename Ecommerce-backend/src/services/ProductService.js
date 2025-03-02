const mongoose = require("mongoose");
const Product = require("../models/ProductModel");

const createProduct = async (newProduct) => {
  try {
    const { name, image, type, price, countInStock, rating, description } =
      newProduct;

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return { status: "ERROR", message: "Product already exists" };
    }

    const createdProduct = await Product.create({
      name,
      image,
      type,
      price,
      countInStock,
      rating,
      description,
    });

    return {
      status: "OK",
      message: "Product created successfully",
      data: createdProduct,
    };
  } catch (e) {
    throw e;
  }
};

const updateProduct = async (id, data) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updatedProduct) {
      return { status: "ERROR", message: "The product is not defined" };
    }

    return {
      status: "OK",
      message: "Product updated successfully",
      data: updatedProduct,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "Error updating product",
      error: e.message,
    };
  }
};

const deleteProduct = async (id) => {
  try {
    await Product.findByIdAndDelete(id);
    return { status: "OK", message: "User deleted successfully" };
  } catch (e) {
    throw e;
  }
};

const getAllProduct = async (limit, page, sortField, sortOrder, filters) => {
  try {
    const totalProduct = await Product.countDocuments();

    let query = Product.find();

    // Áp dụng bộ lọc nếu có
    if (filters) {
      const filterConditions = {};

      // Lọc theo loại sản phẩm (type)
      if (filters.type) {
        filterConditions.type = filters.type;
      }

      // Lọc theo khoảng giá
      if (filters.minPrice || filters.maxPrice) {
        filterConditions.price = {};
        if (filters.minPrice)
          filterConditions.price.$gte = Number(filters.minPrice);
        if (filters.maxPrice)
          filterConditions.price.$lte = Number(filters.maxPrice);
      }

      // Lọc theo rating tối thiểu
      if (filters.minRating) {
        filterConditions.rating = { $gte: Number(filters.minRating) };
      }

      // Áp dụng filter vào query
      query = query.find(filterConditions);
    }

    // Nếu có phân trang
    if (limit) {
      query = query.limit(limit).skip(page * limit);
    }

    // Nếu có yêu cầu sắp xếp theo trường cụ thể
    if (sortField && (sortOrder === "asc" || sortOrder === "desc")) {
      query = query.sort({ [sortField]: sortOrder === "desc" ? -1 : 1 });
    }

    // Thực hiện truy vấn
    const allProducts = await query;

    return {
      status: "OK",
      message: "All Products retrieved successfully!",
      data: allProducts,
      total: totalProduct,
      pageCurrent: Number(page + 1),
      totalPage: limit ? Math.ceil(totalProduct / limit) : 1,
    };
  } catch (e) {
    throw new Error("Error fetching product: " + e.message);
  }
};

const getDetailProduct = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { status: "ERROR", message: "Invalid product ID" };
    }

    const product = await Product.findById(id);

    if (!product) {
      return { status: "ERROR", message: "Product not found" };
    }

    return {
      status: "OK",
      message: "SUCCESS GET DETAILS PRODUCT",
      data: product,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "Error fetching product",
      error: e.message,
    };
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct,
  getAllProduct,
};
