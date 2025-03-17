const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("./jwtService");
const moment = require("moment");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const { message } = require("antd");
const MailService = require("../services/MailService");

// Extend plugin customParseFormat
dayjs.extend(customParseFormat);
//_______________________________________________ĐĂNG KÝ TÀI KHOẢN
const createUser = async ({
  username,
  email,
  password,
  phone,
  dob,
  gender,
  address = [],
  avatar = "",
}) => {
  // Kiểm tra độ dài mật khẩu
  if (password.length < 5) {
    throw new Error("Mật khẩu phải có ít nhất 5 ký tự!");
  }

  // Hash mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo người dùng mới
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    phone,
    dob,
    gender,
    address,
    avatar,
  });

  await newUser.save();
  return newUser;
};

const checkUserExistsByEmail = async (email) => {
  return await User.exists({ email });
};

//__________________________________________________QUÊN MẬT KHẨU
const forgotPassword = async (email, newPassword, confirmPassword) => {
  try {
    // Kiểm tra email tồn tại
    const user = await User.findOne({ email });
    if (!user) {
      return {
        status: "ERROR",
        message: "Email không tồn tại trong hệ thống!",
      };
    }

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < 5) {
      return {
        status: "WARNING",
        message: "Mật khẩu phải có ít nhất 5 ký tự!",
      };
    }

    // Kiểm tra xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      return {
        status: "ERROR",
        message: "Mật khẩu mới và xác nhận mật khẩu không khớp!",
      };
    }

    // Hash mật khẩu và cập nhật
    const hashedPassword = await bcrypt.hash(newPassword, 10);
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

//____________________________GỬI MAIL KHÓA TÀI KHOẢN
const sendNotificationBlockUserMail = async ({ email }) => {
  try {
    // Kiểm tra xem email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return { status: "ERROR", message: "Người dùng không tồn tại!" };
    }

    // Kiểm tra xem tài khoản có bị khóa không
    if (!user.isBlocked) {
      return { status: "ERROR", message: "Tài khoản này chưa bị khóa!" };
    }

    // Gửi email thông báo khóa tài khoản
    const response = await MailService.sendVerificationCode(
      email,
      null, // Không cần mã xác nhận
      "account-blocked" // Loại email thông báo khóa tài khoản
    );

    if (response.status === "ERROR") {
      console.error("Lỗi khi gửi email thông báo:", response.message);
      return { status: "ERROR", message: "Không thể gửi email thông báo!" };
    }

    return { status: "SUCCESS", message: "Email thông báo đã được gửi!" };
  } catch (error) {
    console.error("Lỗi khi gửi email thông báo:", error);
    return { status: "ERROR", message: "Không thể gửi email thông báo!" };
  }
};

//______________________HÀM TẠO CAPTCHA
const validateCaptcha = (captcha) => {
  // Kiểm tra mã CAPTCHA hợp lệ
  return captcha === "1234"; // Thay bằng logic thật sự (Google reCAPTCHA)
};
//_______________________________________________________________ĐĂNG NHẬP
const loginUser = async ({ email, password, captcha }) => {
  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return { status: "ERROR", message: "Người dùng không tồn tại" };
    }

    // 🛑 Nếu tài khoản đã bị khóa, không cho đăng nhập
    if (checkUser.isBlocked) {
      return {
        status: "BLOCKED",
        message:
          "Tài khoản của bạn đã bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng liên hệ quản trị viên để mở khóa.",
      };
    }

    if (checkUser.failedAttempts >= 3 && checkUser.failedAttempts < 5) {
      if (!captcha || !validateCaptcha(captcha)) {
        console.log("CHECK CAPTCHA");
        return {
          status: "CAPTCHA_REQUIRED",
          message: "Vui lòng nhập CAPTCHA để tiếp tục.",
        };
      }
    }

    const isMatch = await bcrypt.compare(password, checkUser.password);

    if (!isMatch) {
      checkUser.failedAttempts += 1;
      console.log("SỐ LẦN SAI MẬT KHẨU:", checkUser.failedAttempts);

      if (checkUser.failedAttempts >= 5) {
        const wasBlockedBefore = checkUser.isBlocked;

        checkUser.isBlocked = true;
        await checkUser.save();
        if (!wasBlockedBefore) {
          const emailResponse = await sendNotificationBlockUserMail({
            email: checkUser.email,
          });

          if (emailResponse.status === "ERROR") {
            console.error(
              "Lỗi khi gửi email thông báo:",
              emailResponse.message
            );
          }
        }

        return {
          status: "BLOCKED",
          message:
            "Bạn đã nhập sai mật khẩu quá 5 lần, tài khoản của bạn đã bị khóa.",
        };
      }

      await checkUser.save();

      return {
        status: "ERROR",
        message: `Tài khoản hoặc mật khẩu không chính xác! Bạn còn ${
          5 - checkUser.failedAttempts
        } lần thử.`,
      };
    }

    // ✅ Nếu đăng nhập đúng, reset số lần nhập sai và mở khóa tài khoản
    checkUser.failedAttempts = 0;
    checkUser.isBlocked = false;
    await checkUser.save();

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
  } catch (error) {
    console.error("Lỗi khi xử lý đăng nhập:", error);
    return { status: "ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại sau!" };
  }
};

const updateUserService = async (id, data) => {
  try {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    // Lấy user hiện tại để giữ lại address nếu không có trong data
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return { status: "ERROR", message: "User không tồn tại" };
    }

    // Giữ lại address nếu nó không có trong data
    if (!data.address) {
      data.address = existingUser.address;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    return {
      status: "OK",
      message: "Cập nhật thành công",
      data: updatedUser,
    };
  } catch (e) {
    return { status: "ERROR", message: "Lỗi cập nhật", error: e.message };
  }
};

const deleteUser = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return { status: "ERROR", message: "User not found" };
    }

    // Kiểm tra nếu user là admin
    if (user.isAdmin) {
      return { status: "ERROR", message: "Không thể xóa Admin!" };
    }

    await User.findByIdAndDelete(id);
    return { status: "OK", message: "User deleted successfully" };
  } catch (e) {
    throw e;
  }
};

const getAllUser = async () => {
  try {
    const users = await User.find().select("-password");

    console.log("Raw Users:", users); // Kiểm tra dữ liệu gốc

    const formattedUsers = users.map((user) => {
      let formattedDob = null;

      if (user.dob) {
        if (dayjs(user.dob).isValid()) {
          // Nếu `dob` là Date object, format luôn
          formattedDob = dayjs(user.dob).format("DD-MM-YYYY");
        } else if (typeof user.dob === "string") {
          // Nếu `dob` là string, thử parse lại
          formattedDob = dayjs(user.dob, [
            "YYYY-MM-DD",
            "MM-DD-YYYY",
            "DD-MM-YYYY",
          ]).format("DD-MM-YYYY");
        }
      }

      return {
        ...user.toObject(),
        dob: formattedDob,
      };
    });

    console.log("Formatted Users:", formattedUsers); // Kiểm tra dữ liệu sau khi format

    return {
      status: "OK",
      message: "Lấy danh sách người dùng thành công!",
      data: formattedUsers,
    };
  } catch (e) {
    throw new Error("Lỗi khi lấy danh sách người dùng: " + e.message);
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

    if (newPassword.length < 5) {
      //console.log("❌ Mật khẩu mới quá ngắn!");
      return {
        success: false,
        message: "Mật khẩu mới phải có ít nhất 5 ký tự!",
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    //console.log("✅ Đổi mật khẩu thành công!");
    return { success: true, message: "Đổi mật khẩu thành công!" };
  } catch (error) {
    //console.error("🔥 Lỗi khi đổi mật khẩu:", error.message);
    return {
      success: false,
      // message: "Lỗi khi đổi mật khẩu!",
      error: error.message,
    };
  }
};

const addAddress = async (userId, newAddress) => {
  try {
    // Tìm user bằng userId
    const user = await User.findById(userId);
    if (!user) {
      return { status: "ERROR", message: "Người dùng không tồn tại!" };
    }

    // Kiểm tra nếu `user.address` chưa tồn tại, gán mảng trống
    if (!user.address) {
      user.address = [];
    }

    // Giới hạn tối đa 6 địa chỉ
    if (user.address.length >= 6) {
      return {
        status: "WARNING",
        message: "Danh sách tối đa chỉ gồm 6 địa chỉ!",
      };
    }

    // Nếu địa chỉ mới là mặc định, reset các địa chỉ cũ
    if (newAddress.isDefault) {
      user.address.forEach((addr) => (addr.isDefault = false));
    }

    // Thêm địa chỉ mới vào mảng address
    user.address.push(newAddress);

    // Lưu thay đổi vào database
    await user.save();

    return { status: "OK", message: "Thêm địa chỉ thành công!", data: user };
  } catch (error) {
    console.error("❌ Lỗi trong UserService.addAddress:", error);
    throw new Error("Lỗi khi thêm địa chỉ: " + error.message);
  }
};

const setDefaultAddress = async (userId, addressId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { status: "ERROR", message: "Người dùng không tồn tại!" };
    }

    // Cập nhật lại các địa chỉ khác không phải là mặc định
    user.address.forEach((addr) => {
      addr.isDefault = addr._id.equals(addressId);
    });

    await user.save();

    return {
      status: "OK",
      message: "Cập nhật địa chỉ mặc định thành công!",
      data: user,
    };
  } catch (error) {
    throw new Error("Lỗi khi cập nhật địa chỉ mặc định: " + error.message);
  }
};

const getAddresses = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { status: "ERROR", message: "Người dùng không tồn tại!" };
    }

    return {
      status: "OK",
      message: "Lấy danh sách địa chỉ thành công!",
      data: user.address,
    };
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách địa chỉ: " + error.message);
  }
};

const deleteAddress = async (userId, addressId) => {
  try {
    if (!userId || !addressId) {
      return {
        status: "FAIL",
        message: "Thiếu thông tin userId hoặc addressId!",
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { status: "FAIL", message: "Người dùng không tồn tại!" };
    }

    console.log("Danh sách địa chỉ trước khi xóa:", user.address);
    console.log("ID cần xóa:", addressId);

    // Kiểm tra nếu `address` chưa tồn tại hoặc không phải mảng
    if (!Array.isArray(user.address)) {
      user.address = []; // Gán thành mảng rỗng nếu chưa có
      await user.save();
      return { status: "FAIL", message: "Không có địa chỉ nào để xóa!" };
    }

    // Kiểm tra xem `addressId` có tồn tại không
    const addressExists = user.address.some(
      (addr) => addr._id.toString() === addressId
    );
    if (!addressExists) {
      return { status: "FAIL", message: "Không tìm thấy địa chỉ cần xóa!" };
    }

    // Xóa địa chỉ
    user.address = user.address.filter(
      (addr) => addr._id.toString() !== addressId
    );
    await user.save();

    return {
      status: "OK",
      message: "Xóa địa chỉ thành công!",
      data: user.address,
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: "Lỗi khi xóa địa chỉ!",
      error: error.message,
    };
  }
};

// Hàm cập nhật địa chỉ
const updateAddress = async (userId, addressId, newAddress) => {
  try {
    let updateFields = {};

    // Lặp qua tất cả các trường trong newAddress và chỉ thêm những giá trị hợp lệ vào updateFields
    Object.keys(newAddress).forEach((key) => {
      if (
        newAddress[key] !== undefined &&
        newAddress[key] !== null &&
        newAddress[key] !== ""
      ) {
        updateFields[`address.$.${key}`] = newAddress[key];
      }
    });

    // Kiểm tra xem có trường nào để cập nhật không
    if (Object.keys(updateFields).length === 0) {
      throw new Error("Không có trường hợp lệ để cập nhật");
    }

    console.log("Updating fields:", updateFields);

    // Cập nhật vào database
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "address._id": addressId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("Không tìm thấy người dùng hoặc địa chỉ");
    }

    return updatedUser;
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ:", error.message);
    throw new Error("Lỗi khi cập nhật địa chỉ: " + error.message);
  }
};

const getInfoAddress = async (userId, addressId) => {
  try {
    // Tìm kiếm người dùng theo userId và tìm địa chỉ với addressId trong mảng addresses
    const user = await User.findById(userId); // Tìm người dùng theo userId

    if (!user) {
      return { status: "FAIL", message: "User not found" };
    }

    // Tìm địa chỉ trong mảng addresses của người dùng
    const address = user.addresses.find((addr) => addr.addressId === addressId);

    if (!address) {
      return { status: "FAIL", message: "Address not found" };
    }

    // Trả về thông tin địa chỉ
    return { status: "SUCCESS", data: address };
  } catch (error) {
    // Xử lý lỗi
    console.error("Error getting address:", error);
    return { status: "ERROR", message: "Lỗi máy chủ!", error: error.message };
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUserService,
  deleteUser,
  getAllUser,
  getDetailsUser,
  checkUserExistsByEmail,
  forgotPassword,
  changePasswordUser,
  addAddress,
  setDefaultAddress,
  getAddresses,
  deleteAddress,
  updateAddress,
  getInfoAddress,
  sendNotificationBlockUserMail,
};
