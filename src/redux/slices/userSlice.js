import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";
import { updateAddress } from "../../Services/UserService";
import { resetCart } from "./cartSlice";
import { message } from "antd";

// ✅ Lấy user từ localStorage nếu có
const getUserFromLocalStorage = () => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch }) => {
    try {
      const persistedRoot = localStorage.getItem("persist:root");

      let savedCart = null;
      if (persistedRoot) {
        try {
          const parsedRoot = JSON.parse(persistedRoot);
          if (parsedRoot.cart) {
            savedCart = parsedRoot.cart; // 🔹 Vẫn là string JSON, cần parse thêm
          }
        } catch (err) {
          console.error("❌ Lỗi khi đọc persist:root:", err);
        }
      }

      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          localStorage.setItem("savedCart", JSON.stringify(parsedCart)); // ✅ Lưu lại
        } catch (err) {
          console.error("❌ Lỗi khi parse cart từ persist:", err);
        }
      }

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      dispatch(setUser(null));
      dispatch(resetCart()); // 🔹 Không dùng clearCart() để giữ localStorage

      // 🔹 Lưu lại giỏ hàng

      return true;
    } catch (error) {
      throw new Error("Logout failed!");
    }
  }
);

export const fetchCart = createAsyncThunk(
  "user/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:3002/api/cart/${userId}`
      );

      console.log("response", response);
      // Đảm bảo trả về đúng định dạng mà cartSlice mong đợi
      return {
        cartItems:
          response.data.cartItems.map((item) => ({
            ...item,
            product: {
              ...item.product,
              discount: item.product.discount || 0,
              selected: item.selected || false, // Chỉ set default khi không có
            },
          })) || [],
        cartCount: response.data?.cartItems?.length || 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi lấy giỏ hàng!");
    }
  }
);

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

export const updateUserAddress = createAsyncThunk(
  "user/updateUserAddress",
  async ({ userId, addressId, newAddress }, { getState, dispatch }) => {
    const accessToken = getState().user.accessToken;

    if (!accessToken) throw new Error("Không có accessToken!");

    // Gọi API để cập nhật địa chỉ
    const updatedAddress = await updateAddress(
      userId,
      addressId,
      newAddress,
      accessToken
    );

    await dispatch(updateAddressList());
    // Trả về dữ liệu địa chỉ đã cập nhật
    return updatedAddress;
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

export const requestDeleteAccount = createAsyncThunk(
  "user/requestDeleteAccount",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      const response = await axios.post(
        "http://localhost:3002/api/user/request-delete",
        {},
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelDeleteRequest = createAsyncThunk(
  "user/cancelDeleteRequest",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      const response = await axios.patch(
        `http://localhost:3002/api/user/cancel-request-delete/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const confirmDeleteAccount = createAsyncThunk(
  "user/confirmDeleteAccount",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      const response = await axios.delete(
        `http://localhost:3002/api/user/delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
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
  isAdmin: false,
  isBlocked: false,
  orderHistory: [],
  orders: [],
  requireDelete: false,
  deleteRequestedAt: null,
};

const getInitialState = () => ({
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
  isAdmin: false,
  isBlocked: false,
  orderHistory: [],
  orders: [],
});

console.log("initialState", initialState);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setDeleteRequest: (state, action) => {
      state.requireDelete = action.payload.requireDelete;
      state.deleteRequestedAt = action.payload.deleteRequestedAt;
      localStorage.setItem("user", JSON.stringify(state));
    },
    setUser: (state, action) => {
      const userData = action.payload;

      if (!action.payload) {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Khi logout (payload = null)
        return initialState; // Reset user state nhưng không ảnh hưởng cart
      }

      if (!userData) {
        Object.assign(state, initialState);
        localStorage.removeItem("user");

        return;
      }

      if (userData.orderHistory) {
        state.orderHistory = userData.orderHistory;
      }

      if (userData.orders) {
        state.orders = userData.orders;
      }

      state.address = Array.isArray(userData.address)
        ? userData.address
        : state.address;

      state.isAuthenticated = true;
      state._id = userData._id;
      state.username = userData.username;
      state.email = userData.email;
      state.phone = userData.phone;
      //state.address = userData.address || [];
      state.avatar = userData.avatar || "";
      state.dob = userData.dob;
      state.gender = userData.gender;

      state.isAdmin =
        userData.isAdmin !== undefined ? userData.isAdmin : state.isAdmin;
      state.isBlocked = userData.isBlocked ?? false;
      state.createdAt = userData.createdAt;
      state.updatedAt = userData.updatedAt;

      if (userData.accessToken) state.accessToken = userData.accessToken;
      if (userData.refreshToken) state.refreshToken = userData.refreshToken;

      // Lưu vào localStorage
      // const pureState = current(state);
      // console.log("Dữ liệu state:", pureState);

      // console.log(
      //   "Dữ liệu state sau khi cập nhật:",
      //   JSON.parse(JSON.stringify(state))
      // );
      // Lưu vào localStorage
      localStorage.setItem("user", JSON.stringify(state));
    },
    removeUserAddress: (state, action) => {
      const addressId = action.payload;
      // Loại bỏ địa chỉ có id trùng với addressId
      state.address = state.address.filter(
        (addr) => addr._id !== action.payload
      );
      localStorage.setItem("user", JSON.stringify(state)); // Lưu lại vào localStorage
    },
    updateAddresses: (state, action) => {
      const updatedAddress = action.payload;
      const index = state.address.findIndex(
        (addr) => addr._id === updatedAddress._id
      );
      if (index !== -1) {
        state.address[index] = updatedAddress;
        localStorage.setItem("user", JSON.stringify(state));
      } else {
        console.error("Địa chỉ không tồn tại!");
      }
    },
    setUserAddresses: (state, action) => {
      if (!action.payload || !Array.isArray(action.payload)) {
        console.error("❌ Dữ liệu không hợp lệ!", action.payload);
        return;
      }
      const flattenedAddresses = action.payload.flat();

      const uniqueAddresses = Array.from(
        new Map(flattenedAddresses.map((addr) => [addr._id, addr])).values()
      );

      state.address = uniqueAddresses;
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

    setLoggingOut: (state, action) => {
      state.isLoggingOut = action.payload;
    },

    addUserAddress: (state, action) => {
      const newAddresses = action.payload; // Mảng địa chỉ mới từ API

      if (!Array.isArray(newAddresses)) return;

      // Khởi tạo state.address nếu chưa có
      if (!state.address) state.address = [];

      // Nếu có địa chỉ mới là mặc định, đặt lại isDefault của địa chỉ cũ
      const hasNewDefault = newAddresses.some((addr) => addr.isDefault);

      if (hasNewDefault) {
        state.address = state.address.map((addr) => ({
          ...addr,
          isDefault: false, // Đặt tất cả địa chỉ cũ về không mặc định
        }));
      }

      // Thêm hoặc cập nhật địa chỉ mới vào Redux store
      newAddresses.forEach((newAddress) => {
        const index = state.address.findIndex(
          (addr) => addr._id === newAddress._id
        );
        if (index !== -1) {
          // Nếu địa chỉ đã tồn tại, cập nhật thông tin
          state.address[index] = newAddress;
        } else {
          // Nếu chưa có, thêm vào danh sách
          state.address.push(newAddress);
        }
      });

      // Lưu vào localStorage
      localStorage.setItem("userAddresses", JSON.stringify(state.address));
      console.log("✅ Đã cập nhật danh sách địa chỉ vào Redux:", state.address);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(cancelDeleteRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelDeleteRequest.fulfilled, (state, action) => {
        state.requireDelete = false;
        state.deleteRequestedAt = null;
        localStorage.setItem("user", JSON.stringify(state));
        state.isLoading = false;
        message.success("Đã hủy yêu cầu xóa tài khoản");
      })
      .addCase(cancelDeleteRequest.rejected, (state, action) => {
        state.isLoading = false;
        message.error(action.payload?.message || "Hủy yêu cầu thất bại");
      })
      .addCase(confirmDeleteAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(confirmDeleteAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        message.success("Đã xóa tài khoản thành công");
      })
      .addCase(confirmDeleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        message.error(action.payload?.message || "Xóa tài khoản thất bại");
      })
      .addCase(requestDeleteAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestDeleteAccount.fulfilled, (state, action) => {
        state.requireDelete = true;
        state.deleteRequestedAt = new Date().toISOString();
        localStorage.setItem("user", JSON.stringify(state));
        state.isLoading = false;
      })
      .addCase(requestDeleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {})
      .addCase(logoutUser.fulfilled, (state) => {
        return getInitialState();
      })

      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const {
          username,
          email,
          phone,
          dob,
          gender,
          address,
          avatar,
          isAdmin,
        } = action.payload;
        state.username = username;
        state.email = email;
        state.phone = phone;
        state.dob = dob;
        state.gender = gender;
        state.address = address;
        state.avatar = avatar;
        state.isAdmin = isAdmin;
        localStorage.setItem("user", JSON.stringify(state));
      })

      .addCase(updateAddressList.fulfilled, (state, action) => {
        console.log("🚀 API trả về danh sách địa chỉ mới:", action.payload);

        if (!action.payload || !Array.isArray(action.payload.data)) {
          console.error(
            "❌ Dữ liệu từ API không phải là mảng!",
            action.payload
          );
          return;
        }

        // ❌ Có thể mảng đã phẳng nhưng bạn lại tiếp tục `.flat()`
        console.log("📌 API trả về:", action.payload.data);
        const flattenedAddresses = Array.isArray(action.payload.data[0])
          ? action.payload.data.flat()
          : action.payload.data;

        // Loại bỏ địa chỉ trùng lặp dựa trên `_id`
        const uniqueAddresses = Array.from(
          new Map(flattenedAddresses.map((addr) => [addr._id, addr])).values()
        );

        // ✅ Cập nhật state đúng cách
        state.address = uniqueAddresses;
        localStorage.setItem("user", JSON.stringify(state));
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        const newAddress = action.payload;
        if (!newAddress || typeof newAddress !== "object") return;

        if (!action.payload || !action.payload.data) {
          console.error("❌ API không trả về dữ liệu hợp lệ!", action.payload);
          return;
        }

        let updatedAddress = action.payload.data.address;

        // Kiểm tra nếu updatedAddress là mảng, chỉ lấy phần tử đầu tiên
        updatedAddress = Array.isArray(updatedAddress)
          ? updatedAddress[0]
          : updatedAddress;

        //console.log("🔹 Địa chỉ đã cập nhật:", updatedAddress);

        const index = state.address.findIndex(
          (addr) => addr._id === updatedAddress._id
        );
        if (index !== -1) {
          state.address[index] = updatedAddress;
        } else {
          console.warn(
            "🚨 Địa chỉ không tồn tại trong Redux! Thêm vào danh sách..."
          );
          state.address.push(updatedAddress);
        }

        // Lưu lại vào localStorage
        localStorage.setItem("user", JSON.stringify(state));
      });
  },
});

export const {
  setUser,
  setLoggingOut,
  updateUserField,
  setDefaultAddress,
  addUserAddress,
  deleteAddress,
  removeAddress,
  updateAddresses,
  setUserAddresses,
  removeUserAddress,
  setDeleteRequest,
} = userSlice.actions;
export default userSlice.reducer;
