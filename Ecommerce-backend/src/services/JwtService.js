const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config(); // Only call dotenv.config() once

// Function to generate a JWT token for general user authentication (7 days expiration)
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Function to generate Access Token (30 minutes expiration)
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "30m" }); // Increased expiry to 30 minutes
};

// Function to generate Refresh Token (365 days expiration)
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "365d" });
};

// Function to handle Refresh Token and issue a new Access Token
const refreshTokenJwtService = async (token) => {
  console.log("Received refresh token:", token);

  try {
    // Verifying the refresh token
    const decoded = await jwt.verify(token, process.env.REFRESH_TOKEN);
    if (!decoded) {
      throw new Error("Invalid or expired refresh token.");
    }

    // Generate new access token using decoded data from refresh token
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
    console.error("Error refreshing token:", err);
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
};
