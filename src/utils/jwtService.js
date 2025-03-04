import axios from "axios";

const refreshTokenApi = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      "http://localhost:3002/api/user/refresh-token",
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
        withCredentials: true,
      }
    );

    if (response.data?.access_token) {
      localStorage.setItem("accessToken", response.data.access_token); // Cập nhật token mới
      return response.data.access_token;
    }

    return null;
  } catch (error) {
    console.error("Lỗi refresh token:", error);
    return null;
  }
};

export default refreshTokenApi;
