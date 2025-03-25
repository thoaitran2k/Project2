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
