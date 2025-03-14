import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import profileReducer from "./slices/profileSlice";
import loadingReducer from "./slices/loadingSlice";
import productReducer from "./slices/productSlice";
import adminUsersReducer from "./reducers/adminUserSlice";
import storage from "redux-persist/lib/storage"; // Lưu vào localStorage
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

// Cấu hình persist cho từng reducer
const persistConfig = {
  key: "root", // Key để lưu trữ trong localStorage
  storage, // Sử dụng localStorage
  whitelist: ["user", "profile", "product", "adminUsers"], // Chỉ lưu các reducer này
};

// Kết hợp các reducer
const rootReducer = combineReducers({
  user: userReducer,
  profile: profileReducer,
  loading: loadingReducer,
  product: productReducer,
  adminUsers: adminUsersReducer,
});

// Áp dụng cấu hình persist vào rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store với persistedReducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Tắt cảnh báo serializable check cho redux-persist
    }),
  devTools: true, // Bật Redux DevTools
});

// Tạo persistor để quản lý việc lưu trữ và phục hồi state
export const persistor = persistStore(store);
