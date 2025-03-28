import axios from "axios";

export const getAllProduct = async ({ limit, page }) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_URL_BACKEND}/product/get-all`,
      { params: { limit, page } }
    );
    return response.data;
  } catch (error) {
    console.error("🚨 API lỗi:", error);
    return { data: [], total: 0 }; // ✅ Tránh lỗi undefined khi truy cập dữ liệu
  }
};

const getProductsByType = async (req, res) => {
  try {
    const { type, limit, page } = req.query;
    const skip = (page - 1) * limit;

    // ✅ Chuyển type thành mảng nếu có nhiều giá trị
    const typeArray = type ? type.split(",") : [];

    const filter = typeArray.length ? { type: { $in: typeArray } } : {};

    const products = await Product.find(filter)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(filter);

    res.status(200).json({ data: products, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductType = async ({ type }) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_URL_BACKEND}/product/get-by-type`,
      {
        params: { type },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("🚨 API lỗi:", error);
    throw error;
  }
};
// Trong ProductService.js

export const createProduct = async (data) => {
  try {
    const formattedData = {
      ...data,
      price: Number(data.price),
      countInStock: Number(data.countInStock),
      rating: Number(data.rating),
    };

    const response = await axios.post(
      `${import.meta.env.VITE_URL_BACKEND}/product/create`,
      formattedData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("🚨 API lỗi:", error.response?.data || error.message);
    throw new Error("Tạo sản phẩm thất bại!");
  }
};

export const getDetailProduct = async (productId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_URL_BACKEND}/product/get-details/${productId}`
    );

    return response.data;
  } catch (error) {
    console.error("🚨 API lỗi:", error.response?.data || error.message); // Hiển thị lỗi chi tiết
    throw new Error("Load sản phẩm thất bại!"); // ✅ Thêm thông báo lỗi cụ thể
  }
};

export const getAllTypeProduct = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_URL_BACKEND}/product/get-all-type/`
    );

    return response.data;
  } catch (error) {
    console.error("🚨 API lỗi:", error.response?.data || error.message); // Hiển thị lỗi chi tiết
    throw new Error("Lấy loại sản phẩm thất bại!"); // ✅ Thêm thông báo lỗi cụ thể
  }
};
