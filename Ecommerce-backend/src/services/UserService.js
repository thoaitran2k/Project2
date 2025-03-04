const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("./jwtService");
const moment = require("moment");

const createUser = async ({ username, email, password, phone, dob }) => {
  const hashedPassword = bcrypt.hashSync(password, 10); // Mã hóa mật khẩu

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    phone,
    dob,
  });

  await newUser.save();
  return newUser;
};

const checkUserExistsByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user != null;
};

const forgotPassword = async (email, newPassword, confirmPassword) => {
  try {
    // Kiểm tra xem email có trong hệ thống không
    const user = await User.findOne({ email });
    if (!user) {
      return {
        status: "ERROR",
        message: "Email không tồn tại trong hệ thống!",
      };
    }

    // Kiểm tra mật khẩu nhập vào có trùng khớp không
    if (newPassword !== confirmPassword) {
      return {
        status: "ERROR",
        message: "Mật khẩu mới và xác nhận mật khẩu không khớp!",
      };
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới vào database
    user.password = hashedPassword;
    await user.save();

    return {
      status: "OK",
      message: "Mật khẩu đã được cập nhật thành công!",
    };
  } catch (e) {
    throw new Error("Có lỗi xảy ra khi đặt lại mật khẩu: " + e.message);
  }
};

const loginUser = async ({ email, password }) => {
  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return { status: "ERROR", message: "Người dùng không tồn tại" };
    }

    const isMatch = bcrypt.compareSync(password, checkUser.password);
    if (!isMatch) {
      return { status: "ERROR", message: "Mật khẩu không chính xác" };
    }

    const accessToken = generateAccessToken({
      id: checkUser.id,
      isAdmin: checkUser.isAdmin,
    });
    const refreshToken = generateRefreshToken({
      id: checkUser.id,
      isAdmin: checkUser.isAdmin,
    });

    return {
      status: "OK",
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
    };
  } catch (e) {
    throw e;
  }
};

const updateUser = async (id, data) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
    return {
      status: "OK",
      message: "User updated successfully",
      data: updatedUser,
    };
  } catch (e) {
    throw e;
  }
};

const deleteUser = async (id) => {
  try {
    await User.findByIdAndDelete(id);
    return { status: "OK", message: "User deleted successfully" };
  } catch (e) {
    throw e;
  }
};

const getAllUser = async () => {
  try {
    const allUsers = await User.find(); // Lấy danh sách user từ DB
    console.log(allUsers);
    return {
      status: "OK",
      message: "Get sucess!",
      data: allUsers,
    };
  } catch (e) {
    throw new Error("Error fetching users: " + e.message);
  }
};

const getDetailsUser = async (id) => {
  try {
    const user = await User.findOne({
      _id: id,
    });

    if (user === null) {
      return {
        status: "OK",
        message: "The user is not defined",
      };
    }

    return { status: "OK", message: "SUCESSS GET DETAILS USER", data: user };
  } catch (e) {
    throw e;
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  checkUserExistsByEmail,
  forgotPassword,
};
