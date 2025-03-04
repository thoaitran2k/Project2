const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// Middleware xác thực token (không bắt buộc phải là admin)
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided", status: "ERROR" });
    }

    const token = authHeader.split(" ")[1]; // Lấy token sau 'Bearer '

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) {
        console.log("🔹 JWT Verify Error:", err);
        return res
          .status(403)
          .json({ message: "Token is not valid", status: "ERROR" });
      }

      req.user = user; // Gán user vào request
      next(); // Tiếp tục xử lý
    });
  } catch (error) {
    console.error("🔹 Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal Server Error", status: "ERROR" });
  }
};

// Middleware xác thực user hoặc admin
const authUserMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided", status: "ERROR" });
    }

    const token = authHeader.split(" ")[1]; // Lấy token sau 'Bearer '

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) {
        console.log("🔹 JWT Verify Error:", err);
        return res
          .status(403)
          .json({ message: "Token is not valid", status: "ERROR" });
      }

      req.user = user; // Gán user vào request

      const userId = req.params.id;

      // Cho phép nếu là chính chủ hoặc là admin
      if (user.id !== userId && !user.isAdmin) {
        return res
          .status(403)
          .json({ message: "You are not authorized", status: "ERROR" });
      }

      next();
    });
  } catch (error) {
    console.error("🔹 Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal Server Error", status: "ERROR" });
  }
};

module.exports = { authMiddleware, authUserMiddleware };
