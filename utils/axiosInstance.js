import axios from "axios";

// Tạo instance của Axios
const axiosInstance = axios.create({
  baseURL: "http://localhost:3002/", // Thay URL backend của bạn
  headers: { "Content-Type": "application/json" },
});

// Thêm interceptor để xử lý token hết hạn
axiosInstance.interceptors.response.use(
  (response) => response, // Nếu request thành công, trả về bình thường
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Đánh dấu đã thử refresh

      try {
        // Gửi request làm mới token
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post("http://localhost:5000/api/auth/refresh", {
          refresh_token: refreshToken,
        });

        if (res.data.status === "OK") {
          const newAccessToken = res.data.access_token;
          localStorage.setItem("accessToken", newAccessToken);

          // Cập nhật header Authorization cho request gốc và gửi lại
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.log("🔹 Refresh token failed, logging out...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // Điều hướng về trang đăng nhập
      }
    }

    return Promise.reject(error); // Nếu không thể refresh, trả lỗi về
  }
);

export default axiosInstance;
