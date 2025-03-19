import axios from "axios";
import { store } from "../redux/store";
import { logoutUser, setUser } from "../redux/slices/userSlice";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3002/api", // Thay URL backend của bạn
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Interceptor bắt lỗi:", error.response?.status);
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response.data.status === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      console.log("🔄 Token hết hạn, đang refresh...");

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newAccessToken) => {
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.log("🚨 Không tìm thấy refreshToken, đăng xuất...");
          store.dispatch(logoutUser());
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return Promise.reject(error);
        }

        const res = await axios.post(
          "http://localhost:3002/api/user/refresh-token",
          {
            refreshToken,
          }
        );

        if (res.status === 200) {
          const newAccessToken = res.data.access_token; // ✅ Sửa thành `access_token`
          localStorage.setItem("accessToken", newAccessToken);
          store.dispatch(setUser(newAccessToken));

          axiosInstance.defaults.headers[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          onRefreshed(newAccessToken);
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.log("❌ Refresh token thất bại, đăng xuất...");
        store.dispatch(logoutUser());
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
