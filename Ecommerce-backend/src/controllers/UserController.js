const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const MailService = require("../services/MailService");
const bcrypt = require("bcrypt");

const User = require("../models/UserModel");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, dob } = req.body;

    if (!username || !email || !password || !phone || !dob) {
      return res
        .status(400)
        .json({ message: "Tất cả các trường đều bắt buộc!" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    const userExists = await UserService.checkUserExistsByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    const newUser = await UserService.createUser({
      username,
      email,
      password,
      phone,
      dob,
    });

    res
      .status(201)
      .json({ message: "Tạo người dùng thành công!", user: newUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Đã có lỗi xảy ra trong khi tạo người dùng." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "ERROR",
        message: "Email, mật khẩu mới và xác nhận mật khẩu là bắt buộc!",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Email không hợp lệ!",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "ERROR",
        message: "Mật khẩu mới và xác nhận mật khẩu không khớp!",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "ERROR",
        message: "Người dùng không tồn tại!",
      });
    }

    // Hash mật khẩu mới trước khi cập nhật
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ email }, { password: hashedPassword });

    return res.status(200).json({
      status: "SUCCESS",
      message: "Cập nhật mật khẩu thành công!",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Có lỗi xảy ra khi đặt lại mật khẩu!",
      error: e.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Email và mật khẩu là bắt buộc" });
    }

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Email không hợp lệ!" });
    }

    const checkUser = await UserService.loginUser({ email, password });

    if (checkUser.status === "OK") {
      return res.status(200).json({
        status: "OK",
        message: "Đăng nhập thành công!",
        accessToken: checkUser.accessToken,
        refreshToken: checkUser.refreshToken,
      });
    }

    return res.status(400).json({
      status: "ERROR",
      message: "Email hoặc mật khẩu không đúng",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Đã có lỗi trong quá trình đăng nhập",
      error: e.message,
    });
  }
};

const verificationCodes = {}; // Lưu mã xác minh theo email

const sendRegisterVerificationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "Email là bắt buộc" });
  }

  const userExists = await UserService.checkUserExistsByEmail(email);
  if (userExists) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "Email này đã được sử dụng!" });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  verificationCodes[email] = verificationCode;
  console.log("Generated code for:", email, verificationCode);

  const response = await MailService.sendVerificationCode(
    email,
    verificationCode
  );
  if (response.status === "SUCCESS") {
    return res.status(200).json({
      status: "SUCCESS",
      message: "Mã xác minh đăng ký đã được gửi",
      verificationCode,
    });
  } else {
    return res
      .status(500)
      .json({ status: "ERROR", message: "Không thể gửi mã xác minh!" });
  }
};

// Gửi mã xác nhận quên mật khẩu
const sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "Email là bắt buộc" });
  }

  const userExists = await UserService.checkUserExistsByEmail(email);
  if (!userExists) {
    return res.status(400).json({
      status: "ERROR",
      message: "Email không tồn tại trong hệ thống!",
    });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  verificationCodes[email] = verificationCode;
  console.log("Generated code for:", email, verificationCode);

  const response = await MailService.sendVerificationCode(
    email,
    verificationCode,
    "forgot-password"
  );

  if (response.status === "SUCCESS") {
    return res.status(200).json({
      status: "SUCCESS",
      message: "Mã xác minh quên mật khẩu đã được gửi",
      verificationCode,
    });
  } else {
    return res
      .status(500)
      .json({ status: "ERROR", message: "Không thể gửi mã xác minh!" });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "User ID is required" });
    }

    if (req.body.dob && isNaN(Date.parse(req.body.dob))) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid date format",
      });
    }

    const response = await UserService.updateUser(userId, req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error updating user", error: e.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "User ID is required" });
    }

    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error deleting user", error: e.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error fetching users", error: e.message });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "User ID is required" });
    }

    const response = await UserService.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error deleting user", error: e.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.headers.token.split(" ")[1];
    if (!token) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "The Token is required" });
    }

    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ status: "OK", message: "POST REFRESH TOKEN SUCCESS" });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  sendRegisterVerificationCode,
  forgotPassword,
  sendForgotPasswordCode,
};
