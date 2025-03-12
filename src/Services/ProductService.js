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
