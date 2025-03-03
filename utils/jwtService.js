import { jwtDecode } from "jwt-decode"; // Import chuẩn

export const isAccessTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token); // Đúng tên hàm
    return decoded.exp * 1000 < Date.now(); // Nếu `exp` nhỏ hơn hiện tại -> Token đã hết hạn
  } catch (error) {
    return true; // Token không hợp lệ
  }
};
