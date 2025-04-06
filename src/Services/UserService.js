import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_URL_BACKEND;

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/sign-in`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!"
    );
  }
};

export const forgotPasswordUser = async (
  email,
  newPassword,
  confirmPassword
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/forgot-password`, {
      email,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message || "Có lỗi xảy ra khi cập nhật mật khẩu!"
    );
  }
};

export const registerUser = async (formData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/register`,
      formData
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!"
    );
  }
};

export const getUserDetails = async (userId, accessToken) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/get-details/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    throw (
      error.response?.data?.message || "Không lấy được thông tin người dùng!"
    );
  }
};

export const sendVerificationCode = async (email, type) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/send-${type}-code`,
      {
        email,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gửi mã thất bại, vui lòng thử lại!";
  }
};

export const resetPasswordUser = async (email, newPassword) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/reset-password`, {
      email,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Lỗi khi cập nhật mật khẩu!";
  }
};

export const changePasswordUser = async (
  oldPassword,
  newPassword,
  confirmPassword,
  accessToken
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/change-password`,
      {
        oldPassword,
        newPassword,
        confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Lỗi khi đổi mật khẩu!";
  }
};

export const signUpUser = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/sign-up`, {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: String(formData.phone),
      dob: formData.birthDate,
      gender: formData.gender,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Đăng ký thất bại!";
  }
};

export const updateUser = async (userId, data, accessToken) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/user/update-user/${userId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Cập nhật thông tin thất bại!";
  }
};

export const getAddresses = async (userId, accessToken) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/api/user/${userId}/addresses`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    //console.log("Response từ API getAddresses:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa chỉ:", error);
    throw error;
  }
};

export const addNewAddress = async (
  userId,
  address,
  isDefault,
  accessToken,
  name,
  phoneDelivery
) => {
  try {
    const addressData = { address, isDefault, name, phoneDelivery };

    const response = await axios.post(
      `${API_BASE_URL}/user/${userId}/add-addresses`,
      addressData, // Gửi dữ liệu địa chỉ trực tiếp, không cần bọc trong object
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("Phản hồi từ API:", response.data);
    return response.data; // Trả về kết quả từ API
  } catch (error) {
    console.error("Lỗi từ API:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Không thêm được địa chỉ!"
    );
  }
};

export const updateAddress = async (
  userId,
  addressId,
  newAddress,
  accessToken
) => {
  console.log("🔹 userId:", userId);
  console.log("🔹 addressId:", addressId);
  console.log("🔹 newAddress:", newAddress);

  try {
    const response = await axios.put(
      `http://localhost:3002/api/user/${userId}/address/${addressId}/update-address`,
      {
        address: newAddress.address,
        isDefault: newAddress.isDefault,
        phoneDelivery: newAddress.phoneDelivery,
        name: newAddress.name,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Response từ API update:", response.data);
    return response.data; // Trả về dữ liệu địa chỉ đã cập nhật
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

export const deleteUserAddress = async (userId, addressId, accessToken) => {
  try {
    const response = await axios.delete(
      `http://localhost:3002/api/user/${userId}/delete-address/${addressId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Thêm token vào header
        },
      }
    );
    return response.data; // Trả về dữ liệu nếu thành công
  } catch (error) {
    console.error("Có lỗi khi xóa địa chỉ:", error);
    throw error; // Ném lỗi nếu có lỗi xảy ra
  }
};
