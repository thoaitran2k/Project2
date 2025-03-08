import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Lấy user từ localStorage nếu có
const getUserFromLocalStorage = () => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

export const updateAddressList = createAsyncThunk(
  "user/updateAddressList",
  async (_, { getState }) => {
    const userState = getState().user;
    const accessToken = userState?.accessToken;

    if (!accessToken) throw new Error("Không có accessToken!");

    const response = await axios.get(
      `http://localhost:3002/api/user/${userState._id}/addresses`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data; // Danh sách địa chỉ mới từ API
  }
);

// ✅ Async action để cập nhật user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (updatedData, { getState }) => {
    const userState = getState().user; // Tránh lấy sai đường dẫn
    const accessToken = userState?.accessToken;

    if (!accessToken) throw new Error("Không có accessToken!");

    const response = await axios.put(
      "http://localhost:3002/api/user/update-profile",
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  }
);

const initialState = getUserFromLocalStorage() || {
  isAuthenticated: false,
  _id: null,
  accessToken: null,
  refreshToken: null,
  username: null,
  email: null,
  phone: null,
  address: [],
  avatar: null,
  dob: null,
  gender: null,
  isLoggingOut: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const payload = action.payload;
      if (!payload) {
        console.error("Payload không hợp lệ!");
        return;
      }

      state.isAuthenticated = true;
      state._id = payload._id || state._id;
      state.accessToken = payload.accessToken || state.accessToken;
      state.refreshToken = payload.refreshToken || state.refreshToken;
      state.username = payload.username || state.username;
      state.email = payload.email || state.email;
      state.phone = payload.phone || state.phone;
      state.address = payload.address || state.address;
      state.avatar = payload.avatar || state.avatar;
      state.dob = payload.dob || state.dob;
      state.gender = payload.gender || state.gender;

      // ✅ Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(state));
    },

    addAddress: (state, action) => {
      const newAddress = action.payload;
      if (newAddress.isDefault) {
        state.address.forEach((addr) => (addr.isDefault = false));
      }
      state.address.push(newAddress);
      localStorage.setItem("user", JSON.stringify(state));
    },

    setDefaultAddress: (state, action) => {
      const addressId = action.payload;
      state.address.forEach((addr) => {
        addr.isDefault = addr._id === addressId;
      });
      localStorage.setItem("user", JSON.stringify(state));
    },
    removeAddress: (state, action) => {
      const addressId = action.payload;
      state.address = state.address.filter((addr) => addr._id !== addressId);
      localStorage.setItem("user", JSON.stringify(state));
    },

    updateUserField: (state, action) => {
      const { field, value } = action.payload;
      if (field in state) {
        state[field] = value;
        localStorage.setItem("user", JSON.stringify(state));
      } else {
        console.error(`Trường ${field} không tồn tại trong state!`);
      }
    },

    logoutUser: (state) => {
      localStorage.removeItem("user"); // ✅ Xóa user khỏi localStorage khi logout
      Object.assign(state, initialState);
    },

    setLoggingOut: (state, action) => {
      state.isLoggingOut = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const { username, email, phone, dob, gender, address, avatar } =
          action.payload;
        state.username = username;
        state.email = email;
        state.phone = phone;
        state.dob = dob;
        state.gender = gender;
        state.address = address;
        state.avatar = avatar;
        localStorage.setItem("user", JSON.stringify(state));
      })

      // ✅ Cập nhật danh sách địa chỉ khi API trả về dữ liệu mới
      .addCase(updateAddressList.fulfilled, (state, action) => {
        state.address = action.payload.data;
        localStorage.setItem("user", JSON.stringify(state));
      });
  },
});

export const {
  setUser,
  logoutUser,
  setLoggingOut,
  updateUserField,
  addAddress,
  setDefaultAddress,
  removeAddress,
} = userSlice.actions;
export default userSlice.reducer;
