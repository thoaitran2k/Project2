import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    activePage: "profile", // Mặc định là trang Thông tin tài khoản
  },
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
  },
});

export const { setActivePage } = profileSlice.actions;
export default profileSlice.reducer;
