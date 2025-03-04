// userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  username: null,
  email: null,
  phone: null,
  dob: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { accessToken, refreshToken, email, phone, dob, username } =
        action.payload;
      state.isAuthenticated = true;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.username = username;
      state.email = email;
      state.phone = phone;
      state.dob = dob;
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.username = null;
      state.email = null;
      state.phone = null;
      state.dob = null;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
