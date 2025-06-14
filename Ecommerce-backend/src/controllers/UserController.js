const UserService = require("../services/UserService");
const JwtService = require("../services/jwtService");
const MailService = require("../services/MailService");
const { sendPromoCodeToUser } = require("../controllers/promotionController");
const mongoose = require("mongoose");
const {
  changePasswordUser,
  updateUserService,
} = require("../services/UserService");
const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const User = require("../models/UserModel");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^0\d{9,10}$/;
const { uploadImageToCloudinary } = require("../services/uploadService");

//_______________________________________UPDATE GIỎ HÀNG
// controllers/UserController.js
const updateCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    if (!userId || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // Chuẩn hóa dữ liệu giỏ hàng theo schema
    const normalizedCart = cartItems.map((item) => ({
      id: item.id,
      product: item.product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      diameter: item.diameter,
      discount: item.discount || 0,
      selected: item.selected || false,
    }));

    const user = await User.findByIdAndUpdate(
      userId,
      { cart: normalizedCart },
      { new: true }
    ).populate("cart.product"); // Populate để lấy thông tin đầy đủ khi trả về

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json({
      success: true,
      message: "Cập nhật giỏ hàng thành công",
      cart: user.cart,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật giỏ hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật giỏ hàng",
      error: error.message,
    });
  }
};

//___________________________________________MỞ - KHÓA TÀI KHOẢN NGƯỜI DÙNG
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const updateData = { isBlocked };

    // Nếu mở khóa thì reset failedAttempts
    if (isBlocked === false) {
      updateData.failedAttempts = 0;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    res.status(200).json({ message: "Cập nhật trạng thái thành công!", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};

//________________________________________________ĐĂNG KÝ TÀI KHOẢN
const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, dob, gender, address, avatar } =
      req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password || !phone || !dob || !gender) {
      return res.status(400).json({
        status: "ERROR",
        message: "Tất cả các trường đều bắt buộc!",
      });
    }

    // Kiểm tra định dạng email
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Email không hợp lệ!",
      });
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 5) {
      return res.status(400).json({
        status: "ERROR",
        message: "Mật khẩu phải có ít nhất 5 ký tự!",
      });
    }

    // Kiểm tra định dạng số điện thoại
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Số điện thoại không hợp lệ!",
      });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const userExists = await UserService.checkUserExistsByEmail(email);
    if (userExists) {
      return res.status(400).json({
        status: "ERROR",
        message: "Email đã tồn tại!",
      });
    }

    // Kiểm tra và xử lý địa chỉ
    let userAddress = [];
    if (Array.isArray(address)) {
      userAddress = address;
    } else if (typeof address === "string") {
      userAddress = [{ address, isDefault: true }];
    } else if (!address) {
      userAddress = [];
    } else {
      return res.status(400).json({
        status: "ERROR",
        message: "Địa chỉ không hợp lệ!",
      });
    }

    // Kiểm tra avatar
    if (avatar && typeof avatar !== "string") {
      return res.status(400).json({
        status: "ERROR",
        message: "Avatar phải là một chuỗi!",
      });
    }

    // Kiểm tra và chuyển đổi ngày sinh
    let isoDob = null;
    if (dob) {
      const parsedDob = dayjs(dob, "DD-MM-YYYY");
      if (!parsedDob.isValid()) {
        return res.status(400).json({
          status: "ERROR",
          message: "Định dạng ngày tháng không hợp lệ! Sử dụng DD-MM-YYYY.",
        });
      }
      isoDob = parsedDob.format("YYYY-MM-DD");
    }

    // Tạo người dùng mới
    const newUser = await UserService.createUser({
      username,
      email,
      password,
      phone: String(phone),
      dob: isoDob,
      gender,
      address: userAddress,
      avatar,
    });

    try {
      await sendPromoCodeToUser(
        {
          body: {
            email: newUser.email,
            userName: newUser.username,
            userId: newUser._id,
            type: "welcome", // hoặc bạn có thể để trống, mặc định là welcome
          },
        },
        {
          status: () => ({ json: () => {} }), // fake res cho service
        }
      );
    } catch (err) {
      console.error("Lỗi gửi mã khuyến mãi khi đăng ký:", err.message);
    }

    return res.status(201).json({
      status: "OK",
      message: "Tạo người dùng thành công!",
      user: newUser,
    });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Đã có lỗi xảy ra trong khi tạo người dùng.",
    });
  }
};

//________________________________________________THAY ĐỔI MẬT KHẨU
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

//_________________________________________________XỬ LÝ QUÊN MẬT KHẨU
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Kiểm tra đầu vào cơ bản
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

    const result = await UserService.forgotPassword(
      email,
      newPassword,
      confirmPassword
    );

    // Trả về response theo result
    if (result.status === "OK") {
      return res.status(200).json(result);
    } else if (result.status === "WARNING") {
      return res.status(400).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (e) {
    return res.status(500).json({
      status: "ERROR",
      message: "Có lỗi xảy ra khi đặt lại mật khẩu!",
      error: e.message,
    });
  }
};

//___________________________________________________ĐĂNG NHẬP

const loginUser = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

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

    const checkUser = await UserService.loginUser({ email, password, captcha });

    if (checkUser.status === "BLOCKED") {
      return res.status(403).json({
        status: "BLOCKED",
        message: checkUser.message,
      });
    }

    if (checkUser.status === "OK") {
      return res.status(200).json({
        status: "OK",
        message: "Đăng nhập thành công!",
        accessToken: checkUser.accessToken,
        refreshToken: checkUser.refreshToken,
      });
    }

    if (checkUser.status === "CAPTCHA_REQUIRED") {
      return res.status(403).json({
        status: "CAPTCHA_REQUIRED",
        message: checkUser.message,
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

//Gửi mail thông báo kháo tài khoản
const sendNotificationBlockUserMail = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await UserService.sendNotificationBlockUserMail({ email });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ status: "ERROR", message: error.message });
  }
};

//Gửi mã đăng ký xác nhận
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
      return res.status(400).json({
        status: "ERROR",
        message: "User ID is required",
      });
    }

    let { phone, dob, defaultAddress } = req.body;

    // Kiểm tra số điện thoại
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Số điện thoại không hợp lệ!",
      });
    }

    // Kiểm tra và chuyển đổi định dạng ngày tháng
    if (dob) {
      const parsedDob = dayjs(dob, "DD-MM-YYYY");
      if (!parsedDob.isValid()) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid date format. Use DD-MM-YYYY.",
        });
      }
      req.body.dob = parsedDob.toISOString();
    }

    if (phone) req.body.phone = String(phone);

    // Gọi service để cập nhật user
    const result = await updateUserService(userId, req.body);

    // Kiểm tra service trả về lỗi hay không
    if (result.status === "ERROR") {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      status: "ERROR",
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

const deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra xem user có yêu cầu xóa không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (!user.requireDelete) {
      return res.status(400).json({
        message: "Người dùng chưa yêu cầu xóa tài khoản",
      });
    }

    // Thực hiện xóa user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Đã xóa tài khoản thành công",
    });
  } catch (err) {
    console.error("Lỗi khi xóa tài khoản:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    //console.log("dob", response.dob);
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
    if (!response) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "User not found" });
    }
    return res.status(200).json(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: e.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader); // Kiểm tra header có đúng không

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        status: "ERROR",
        message: "The Token is required",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token); // Kiểm tra token có được tách đúng không

    const response = await JwtService.refreshTokenJwtService(token);
    console.log("Refresh Token Response:", response); // Kiểm tra kết quả từ JwtService

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error refreshing token:", e.message);
    return res.status(500).json({
      status: "ERROR",
      message: "Server error when refreshing token",
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const file = req.file; // File được gửi từ FE

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

    //console.log("🟢 Dữ liệu nhận từ FE:", req.body);

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

const requestDeleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    if (user.requireDelete)
      return res
        .status(400)
        .json({ message: "Bạn đã yêu cầu xóa tài khoản trước đó." });

    user.requireDelete = true;
    user.deleteRequestedAt = new Date();
    await user.save();

    return res
      .status(200)
      .json({ message: "Yêu cầu xóa tài khoản đã được ghi nhận." });
  } catch (err) {
    console.error("Lỗi yêu cầu xóa tài khoản:", err);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

const cancelRequestDeleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    if (!user.requireDelete)
      return res
        .status(400)
        .json({ message: "Tài khoản này không có yêu cầu xóa." });

    user.requireDelete = false;
    user.deleteRequestedAt = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Đã hủy yêu cầu xóa tài khoản thành công." });
  } catch (err) {
    console.error("Lỗi khi hủy yêu cầu xóa:", err);
    return res.status(500).json({ message: "Lỗi server." });
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
  blockUser,
  sendNotificationBlockUserMail,
  updateCart,
  requestDeleteAccount,
  cancelRequestDeleteAccount,
  deleteUserAccount,
};
