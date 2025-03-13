import axios from "axios";

export const getAllProduct = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_URL_BACKEND}/product/get-all`
    );
    console.log("✅ API Response:", response.data); // 🔥 In dữ liệu API
    return response.data;
  } catch (error) {
    console.error("🚨 API lỗi:", error.response?.data || error.message); // Hiển thị lỗi chi tiết
    throw new Error("Load sản phẩm thất bại!"); // ✅ Thêm thông báo lỗi cụ thể
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

export const getDetailProduct = async (id) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_URL_BACKEND}/product/get-details/${id}`
    );

    return response.data;
  } catch (error) {
    console.error("🚨 API lỗi:", error.response?.data || error.message); // Hiển thị lỗi chi tiết
    throw new Error("Load sản phẩm thất bại!"); // ✅ Thêm thông báo lỗi cụ thể
  }
};
