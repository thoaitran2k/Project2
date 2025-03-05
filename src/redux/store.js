import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import profileReducer from "./slices/profileSlice";
import loadingReducer from "./slices/loadingSlice";

export const store = configureStore({
  reducer: {
    user: userReducer, // Đảm bảo rằng bạn đã sử dụng đúng tên user
    profile: profileReducer,
    loading: loadingReducer,
  },
  devTools: true,
});
