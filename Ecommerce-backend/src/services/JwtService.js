const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const isAccessTokenExpired = (token) => {
  if (!token) {
    console.log("TOKEN HẾT HẠN");
    return true;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded || !decoded.exp) {
      console.log("Token không hợp lệ hoặc không có `exp`");
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.log("Access Token đã hết hạn!");
      return true;
    }

    return false; // Token vẫn còn hiệu lực
  } catch (error) {
    console.error("Lỗi khi kiểm tra token:", error);
    return true;
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "30m" });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "7d" });
};

const refreshTokenJwtService = async (token) => {
  console.log("Received refresh token:", token);

  try {
    if (!process.env.REFRESH_TOKEN) {
      console.error("REFRESH_TOKEN is not set in environment variables.");
      return {
        status: "ERROR",
        message: "Server error: Missing refresh token secret",
      };
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN);
    if (!decoded) {
      console.error("Invalid or expired refresh token.");
      return { status: "ERROR", message: "Invalid or expired refresh token" };
    }

    const access_token = generateAccessToken({
      id: decoded.id,
      isAdmin: decoded.isAdmin,
    });

    console.log("Generated new access token:", access_token);
    return {
      status: "OK",
      message: "Token refreshed successfully.",
      access_token,
    };
  } catch (err) {
    console.error("Error refreshing token:", err.message);
    return {
      status: "ERROR",
      message: "Authentication failed. Please log in again.",
    };
  }
};

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  refreshTokenJwtService,
  isAccessTokenExpired,
};
