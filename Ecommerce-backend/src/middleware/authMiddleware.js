const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const dotenv = require("dotenv");
dotenv.config();

// Middleware xác thực token (không cần admin)
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided", status: "ERROR" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        console.log("🔹 JWT Verify Error:", err);

        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Token expired", status: "TOKEN_EXPIRED" });
        }

        return res
          .status(403)
          .json({ message: "Token is not valid", status: "ERROR" });
      }

      // Tải full user từ database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      req.user = user; // Gán bản ghi user đầy đủ
      next();
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

        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Token expired", status: "TOKEN_EXPIRED" });
        }

        return res
          .status(403)
          .json({ message: "Token is not valid", status: "ERROR" });
      }

      req.user = user;

      // Kiểm tra xem người dùng có quyền thay đổi mật khẩu của chính họ hay không
      const userIdFromParams = req.params.id; // Lấy id từ URL params

      // Nếu userId từ params không khớp với userId trong token và người dùng không phải là admin
      if (user.id !== userIdFromParams && !user.isAdmin) {
        return res
          .status(403)
          .json({ message: "You are not authorized", status: "ERROR" });
      }

      next();
    });
  } catch (error) {
    console.error("🔥 Auth Middleware Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: "ERROR" });
  }
};

module.exports = { authMiddleware, authUserMiddleware };
