const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("./jwtService");
const moment = require("moment");

const createUser = async ({
  username,
  email,
  password,
  phone,
  dob,
  gender,
}) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    phone,
    dob,
    gender,
  });

  await newUser.save();
  return newUser;
};

const checkUserExistsByEmail = async (email) => {
  return await User.exists({ email });
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
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password; // Không cập nhật nếu không có mật khẩu mới
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
    return {
      status: "OK",
      message: "Cập nhật thành công",
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
    const users = await User.find().select("-password");
    //const allUsers = await User.find(); // Lấy danh sách user từ DB
    console.log(allUsers);
    return {
      status: "OK",
      message: "Lấy danh sách người dùng thành công!",
      data: allUsers,
    };
  } catch (e) {
    throw new Error("Lỗi khi lấy danh sách người dùng: " + e.message);
  }
};

const changePasswordUser = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ Người dùng không tồn tại!");
      return { success: false, message: "Người dùng không tồn tại!" };
    }

    console.log("🔍 Mật khẩu cũ từ client:", oldPassword);
    console.log("🔍 Mật khẩu hash trong database:", user.password);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      //console.log("❌ Mật khẩu cũ không khớp!");
      return { success: false, message: "Mật khẩu cũ không chính xác!" };
    }

    if (newPassword.length < 3) {
      //console.log("❌ Mật khẩu mới quá ngắn!");
      return {
        success: false,
        message: "Mật khẩu mới phải có ít nhất 3 ký tự!",
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    //console.log("✅ Đổi mật khẩu thành công!");
    return { success: true, message: "Đổi mật khẩu thành công!" };
  } catch (error) {
    console.error("🔥 Lỗi khi đổi mật khẩu:", error.message);
    return {
      success: false,
      message: "Lỗi khi đổi mật khẩu!",
      error: error.message,
    };
  }
};

const getDetailsUser = async (id) => {
  try {
    const user = await User.findOne({
      _id: id,
    }).select("-password");

    if (user === null) {
      return {
        status: "OK",
        message: "Người dùng không tồn tại",
      };
    }

    return {
      status: "OK",
      message: "Lấy thông tin người dùng thành công",
      data: user,
    };
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
  changePasswordUser,
};
