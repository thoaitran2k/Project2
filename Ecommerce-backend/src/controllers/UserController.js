const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const MailService = require("../services/MailService");
const { changePasswordUser } = require("../services/UserService");
const bcrypt = require("bcrypt");

const User = require("../models/UserModel");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^0\d{9,10}$/;

const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, dob, gender } = req.body;

    if (!username || !email || !password || !phone || !dob || !gender) {
      return res
        .status(400)
        .json({ message: "Tất cả các trường đều bắt buộc!" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ!" });
    }

    const userExists = await UserService.checkUserExistsByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    //phone = String(phone);

    const newUser = await UserService.createUser({
      username,
      email,
      password,
      phone: String(phone),
      dob,
      gender,
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

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "ERROR",
        message: "Vui lòng nhập đầy đủ thông tin!",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "ERROR",
        message: "Mật khẩu xác nhận không khớp!",
      });
    }

    const result = await changePasswordUser(userId, oldPassword, newPassword);

    if (!result.success) {
      return res.status(400).json({
        status: "ERROR",
        message: result.message, // Đảm bảo rằng thông báo chi tiết lỗi được trả về
      });
    }

    return res.status(200).json({
      status: "SUCCESS",
      message: result.message,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Lỗi server!",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "ERROR",
        message: "Vui lòng nhập mật khẩu mới và mật khẩu xác nhận!",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "WARNING",
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
      return res.status(400).json({
        status: "WARNING",
        message: "Vui lòng nhập đầy đủ email và mật khẩu!",
      });
    }

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: "WARNING", message: "Email không hợp lệ!" });
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
      .json({ status: "ERROR", message: "Vui lòng nhập email!" });
  }

  const userExists = await UserService.checkUserExistsByEmail(email);
  if (userExists) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "Email này đã được sử dụng!" });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  verificationCodes[email] = verificationCode;

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
      .json({ status: "WARNING", message: "Vui lòng nhập email!" });
  }

  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ status: "WARNING", message: "Email không hợp lệ!" });
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

    let { phone, dob } = req.body;
    if (phone && !phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Số điện thoại không hợp lệ!" });
    }

    if (req.body.dob && isNaN(Date.parse(req.body.dob))) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid date format",
      });
    }

    if (phone) req.body.phone = String(phone);

    const response = await UserService.updateUser(userId, req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: "Lỗi khi cập nhật thông tin người dùng",
      error: e.message,
    });
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        status: "ERROR",
        message: "The Token is required",
      });
    }

    const token = authHeader.split(" ")[1];
    const response = await JwtService.refreshTokenJwtService(token);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERROR",
      message: "Server error when refreshing token",
    });
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
  changePassword,
};
