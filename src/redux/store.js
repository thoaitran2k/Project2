import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
  reducer: {
    user: userReducer, // Đảm bảo rằng bạn đã sử dụng đúng tên user
    profile: profileReducer,
  },
  devTools: true,
});
