const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const MailService = require("../services/MailService");
const { changePasswordUser } = require("../services/UserService");
const bcrypt = require("bcrypt");

const User = require("../models/UserModel");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^0\d{9,10}$/;
const { uploadImageToCloudinary } = require("../services/uploadService");

const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, dob, gender, address, avatar } =
      req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password || !phone || !dob || !gender) {
      return res
        .status(400)
        .json({ message: "Tất cả các trường đều bắt buộc!" });
    }

    // Kiểm tra định dạng email
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    // Kiểm tra định dạng số điện thoại
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ!" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const userExists = await UserService.checkUserExistsByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Xử lý trường address
    let userAddress = [];
    if (Array.isArray(address)) {
      userAddress = address; // Nếu address là một mảng, sử dụng nó
    } else if (typeof address === "string") {
      userAddress = [{ address, isDefault: true }]; // Nếu address là chuỗi, chuyển đổi thành mảng
    } else if (address === undefined || address === null) {
      userAddress = []; // Nếu address là undefined hoặc null, đặt lại thành mảng rỗng
    } else {
      return res.status(400).json({ message: "Địa chỉ không hợp lệ!" });
    }

    // Kiểm tra trường avatar
    if (avatar && typeof avatar !== "string") {
      return res.status(400).json({ message: "Avatar phải là một chuỗi!" });
    }

    // Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo người dùng mới
    const newUser = await UserService.createUser({
      username,
      email,
      password: hashedPassword,
      phone: String(phone),
      dob,
      gender,
      address: userAddress, // Sử dụng address đã được xử lý
      avatar,
    });

    res
      .status(201)
      .json({ message: "Tạo người dùng thành công!", user: newUser });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    res.status(500).json({
      message: "Đã có lỗi xảy ra trong khi tạo người dùng.",
      error: error.message,
    });
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

    if (dob && isNaN(Date.parse(dob))) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid date format",
      });
    }

    if (phone) req.body.phone = String(phone);

    // Tìm user hiện tại để giữ lại address nếu nó không được gửi từ frontend
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "User not found" });
    }

    // Giữ lại address nếu nó không có trong req.body
    const updatedData = { ...req.body };
    if (!req.body.address) {
      updatedData.address = existingUser.address;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true } // Trả về dữ liệu đã cập nhật
    );

    return res.status(200).json({
      status: "OK",
      message: "Cập nhật thông tin thành công!",
      data: updatedUser,
    });
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

const uploadAvatar = async (req, res) => {
  try {
    const file = req.file; // File được gửi từ FE
    console.log("File nhận được từ frontend:", req.file);
    if (!file) {
      return res.status(400).json({ message: "Không có file được tải lên!" });
    }

    // Tải ảnh lên Cloudinary
    const imageUrl = await uploadImageToCloudinary(file);
    console.log("URL ảnh sau khi upload:", imageUrl);

    // Trả về URL của ảnh
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tải ảnh lên Cloudinary!" });
  }
};

const addAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { address, isDefault, name, phoneDelivery } = req.body;

    console.log("🟢 Dữ liệu nhận từ FE:", req.body);

    // Kiểm tra địa chỉ là bắt buộc
    if (!address) {
      return res.status(400).json({ message: "Địa chỉ là bắt buộc!" });
    }

    if (phoneDelivery && !/^0\d{9,10}$/.test(phoneDelivery)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ!" });
    }

    // Tạo object newAddress với các trường có thể thiếu
    const newAddress = {
      address,
      isDefault: isDefault || false, // Nếu không có isDefault, default về false
      name: name || "", // Nếu không có name, set mặc định là chuỗi rỗng
      phoneDelivery: phoneDelivery || "", // Nếu không có phoneDelivery, set mặc định là chuỗi rỗng
    };

    // Gọi service để thêm địa chỉ
    const response = await UserService.addAddress(userId, newAddress);

    // Trả về kết quả từ service
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const response = await UserService.setDefaultAddress(userId, addressId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    const response = await UserService.getAddresses(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const response = await UserService.deleteAddress(userId, addressId);

    if (response.status === "FAIL") {
      return res.status(400).json(response);
    }

    if (response.status === "ERROR") {
      return res.status(500).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ!", error: error.message });
  }
};

const updateAddress = async (req, res) => {
  console.log("🔹 userId:", req.params.userId);
  console.log("🔹 addressId:", req.params.addressId);
  try {
    const { userId, addressId } = req.params;
    const { address, isDefault, name, phoneDelivery } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({
        status: "ERROR",
        message: "User ID and Address ID are required",
      });
    }

    // Gọi service để cập nhật địa chỉ
    const updatedUser = await UserService.updateAddress(userId, addressId, {
      address,
      isDefault,
      name,
      phoneDelivery,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "ERROR",
        message: "User or Address not found",
      });
    }

    return res.status(200).json({
      status: "SUCCESS",
      message: "Cập nhật địa chỉ thành công",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi cập nhật địa chỉ",
      error: error.message,
    });
  }
};

const getInfoAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    // Lấy người dùng từ database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Kiểm tra xem mảng address có tồn tại và không rỗng không
    if (!user.address || user.address.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có địa chỉ cho người dùng này" });
    }

    // Tìm địa chỉ theo addressId
    const address = user.address.find(
      (addr) => addr._id.toString() === addressId
    );
    if (!address) {
      return res.status(404).json({ message: "Địa chỉ không tìm thấy" });
    }

    // Trả về thông tin địa chỉ tìm thấy
    return res.status(200).json(address);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ!", error: error.message });
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
  uploadAvatar,
  addAddress,
  setDefaultAddress,
  getAddresses,
  deleteAddress,
  updateAddress,
  getInfoAddress,
};
