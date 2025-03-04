import refreshTokenApi from "./jwtService";
import { store } from "../redux/store";
import { setUser, logoutUser } from "../redux/slices/userSlice";

let refreshInterval = null;

export const startTokenRefresh = () => {
  stopTokenRefresh(); // Đảm bảo không chạy nhiều lần

  const checkAndRefreshToken = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) return;

    const tokenParts = JSON.parse(atob(accessToken.split(".")[1])); // Giải mã token
    const exp = tokenParts.exp * 1000; // Chuyển về mili giây
    const now = Date.now();
    const timeLeft = exp - now;

    if (timeLeft < 60000) {
      // Nếu còn < 1 phút thì refresh
      const newAccessToken = await refreshTokenApi();
      if (newAccessToken) {
        store.dispatch(setUser(newAccessToken)); // Cập nhật Redux
      } else {
        store.dispatch(logoutUser()); // Đăng xuất nếu lỗi
      }
    }
  };

  checkAndRefreshToken(); // Kiểm tra ngay lúc đăng nhập

  refreshInterval = setInterval(checkAndRefreshToken, 30000); // Kiểm tra mỗi 30 giây
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
