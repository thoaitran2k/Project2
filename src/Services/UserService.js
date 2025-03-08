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
      `${API_BASE_URL}/user/${userId}/addresses`, // Gọi đúng API
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data; // Trả về danh sách địa chỉ
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không lấy được danh sách địa chỉ!"
    );
  }
};

export const addAddress = async (userId, address, isDefault, accessToken) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/${userId}/addresses`,
      { address, isDefault }, // Gửi dữ liệu địa chỉ trong body
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data; // Trả về kết quả từ API
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thêm được địa chỉ!"
    );
  }
};

export const updateAddress = async (userId, addressId, newAddress) => {
  try {
    const response = await axios.put(
      `/api/user/${userId}/address/${addressId}/update-address`,
      {
        address: newAddress.address,
        isDefault: newAddress.isDefault, // Nếu bạn muốn thay đổi trạng thái mặc định
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};
