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
  refreshSubscribers.map((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Interceptor bắt lỗi:", error.response?.status);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("Token hết hạn, thử refresh...");
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newAccessToken) => {
            originalRequest.headers["Token"] = `Bearer ${newAccessToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          store.dispatch(logoutUser());
          return Promise.reject(error);
        }

        const res = await axios.post(
          "http://localhost:3002/api/user/refresh-token",
          {
            refreshToken,
          }
        );

        if (res.status === 200) {
          const newAccessToken = res.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          store.dispatch(setUser(newAccessToken));

          axiosInstance.defaults.headers["Token"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Token"] = `Bearer ${newAccessToken}`;

          onRefreshed(newAccessToken);
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        store.dispatch(logoutUser());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
