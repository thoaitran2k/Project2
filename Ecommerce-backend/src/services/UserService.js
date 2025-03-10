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
  address = [],
  avatar = "",
}) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu

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
      delete data.password;
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

const addAddress = async (userId, newAddress) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { status: "ERROR", message: "Người dùng không tồn tại!" };
    }

    // Kiểm tra nếu `user.address` có tồn tại hay chưa
    if (!user.address) {
      user.address = []; // Gán mảng trống nếu chưa có
    }

    // Giới hạn tối đa 3 địa chỉ
    if (user.address.length >= 3) {
      return {
        status: "WARNING",
        message: "Bạn chỉ có thể lưu tối đa 3 địa chỉ!",
      };
    }

    // Nếu địa chỉ mới là mặc định, reset các địa chỉ cũ
    if (newAddress.isDefault) {
      user.address.forEach((addr) => (addr.isDefault = false));
    }

    // Thêm địa chỉ mới vào danh sách
    user.address.push(newAddress);
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
  updateUser,
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
};
