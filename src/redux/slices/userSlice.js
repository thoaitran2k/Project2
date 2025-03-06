import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async action để cập nhật thông tin người dùng
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (updatedData, { getState }) => {
    const { accessToken } = getState().user;
    const response = await axios.put(
      `http://localhost:3002/api/user/update-profile`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data; // Trả về dữ liệu cập nhật
  }
);

const initialState = {
  isAuthenticated: false,
  _id: null,
  accessToken: null,
  refreshToken: null,
  username: null,
  email: null,
  phone: null,
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
      state._id = payload._id || null;
      state.accessToken = payload.accessToken || null;
      state.refreshToken = payload.refreshToken || null;
      state.username = payload.username || null;
      state.email = payload.email || null;
      state.phone = payload.phone || null;
      state.dob = payload.dob || null;
      state.gender = payload.gender || null;
    },
    updateUserField: (state, action) => {
      const { field, value } = action.payload;
      if (field in state) {
        state[field] = value;
      } else {
        console.error(`Trường ${field} không tồn tại trong state!`);
      }
    },
    logoutUser: (state) => {
      Object.assign(state, initialState);
    },
    setLoggingOut: (state, action) => {
      state.isLoggingOut = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      const { username, email, phone, dob, gender } = action.payload;
      state.username = username;
      state.email = email;
      state.phone = phone;
      state.dob = dob;
      state.gender = gender;
    });
  },
});

export const { setUser, logoutUser, setLoggingOut, updateUserField } =
  userSlice.actions;
export default userSlice.reducer;
