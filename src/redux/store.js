import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer, // Đảm bảo rằng bạn đã sử dụng đúng tên user
  },
  devTools: true,
});
