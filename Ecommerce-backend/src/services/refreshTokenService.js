const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const refreshTokenService = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return { status: "ERROR", message: "User not found" };
    }

    const newAccessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.ACCESS_TOKEN,
      { expiresIn: "1h" }
    );

    return {
      status: "OK",
      message: "Token refreshed successfully.",
      access_token: newAccessToken,
    };
  } catch (error) {
    return { status: "ERROR", message: "Invalid refresh token" };
  }
};

module.exports = { refreshTokenService };
