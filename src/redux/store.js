import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import profileReducer from "./slices/profileSlice";
import loadingReducer from "./slices/loadingSlice";
import productReducer from "./slices/productSlice";
import adminUsersReducer from "./reducers/adminUserSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import storage from "redux-persist/lib/storage"; // Lưu vào localStorage
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import { syncCartLogout } from "./middleware/syncCartLogout";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Cấu hình persist cho từng reducer
const persistConfig = {
  key: "root", // Key để lưu trữ trong localStorage
  storage, // Sử dụng localStorage
  whitelist: ["cart", "profile", "product", "adminUsers", "order"], // Chỉ lưu các reducer này
  blacklist: ["user"],
};

// Kết hợp các reducer
const rootReducer = combineReducers({
  user: userReducer,
  profile: profileReducer,
  loading: loadingReducer,
  product: productReducer,
  adminUsers: adminUsersReducer,
  cart: cartReducer,
  order: orderReducer,
});

// Áp dụng cấu hình persist vào rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store với persistedReducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(syncCartLogout),
  devTools: true,
});

// Tạo persistor để quản lý việc lưu trữ và phục hồi state
export const persistor = persistStore(store);
