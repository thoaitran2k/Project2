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
