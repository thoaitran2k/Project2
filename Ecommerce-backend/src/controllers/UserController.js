const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const MailService = require("../services/MailService");

const User = require("../models/UserModel");

const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, dob } = req.body;

    if (!username || !email || !password || !phone || !dob) {
      return res
        .status(400)
        .json({ message: "Tất cả các trường đều bắt buộc!" });
    }

    // Kiểm tra xem email đã tồn tại hay chưa
    const userExists = await UserService.checkUserExistsByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Tạo người dùng mới
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

module.exports = { createUser };

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra xem email và password có được truyền lên hay không
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Email và mật khẩu là bắt buộc" });
    }

    // Kiểm tra thông tin người dùng
    const checkUser = await UserService.loginUser({ email, password });

    if (checkUser.status === "OK") {
      // Đăng nhập thành công, trả về token
      return res.status(200).json({
        status: "OK",
        message: "Đăng nhập thành công!",
        accessToken: checkUser.accessToken,
        refreshToken: checkUser.refreshToken,
      });
    }

    // Nếu đăng nhập không thành công, trả về lỗi
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

const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "Email là bắt buộc" });
  }

  // Kiểm tra xem email đã tồn tại hay chưa
  const userExists = await UserService.checkUserExistsByEmail(email);
  if (userExists) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "Email này đã được sử dụng!" });
  }

  // Tạo mã xác minh
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // Mã 6 chữ số
  verificationCodes[email] = verificationCode; // Lưu mã xác minh theo email

  // Gửi mã xác minh qua email
  const response = await MailService.sendVerificationCode(
    email,
    verificationCode
  );

  if (response.status === "SUCCESS") {
    return res.status(200).json({
      status: "SUCCESS",
      message: "Mã xác minh đã được gửi",
      verificationCode, // Bổ sung mã xác nhận vào response
    });
  } else {
    return res.status(500).json({
      status: "ERROR",
      message: "Vui lòng nhập đúng định dạng email!",
    });
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
  sendVerificationCode,
};
