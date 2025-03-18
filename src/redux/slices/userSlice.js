import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";
import { updateAddress } from "../../Services/UserService";

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
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const userData = action.payload;

      if (!userData) {
        console.error("Payload không hợp lệ!");
        return;
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

    logoutUser: (state) => {
      localStorage.removeItem("user"); // ✅ Xóa user khỏi localStorage khi logout
      Object.assign(state, {
        ...initialState,
        isAuthenticated: false,
        //isAdmin: true,
      });
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
      // .addCase(deleteAddress.fulfilled, (state, action) => {
      //   const addressId = action.payload._id; // Giả sử API trả về dữ liệu địa chỉ đã xóa
      //   state.address = state.address.filter((addr) => addr._id !== addressId);
      //   localStorage.setItem("user", JSON.stringify(state)); // Lưu lại vào localStorage
      // })
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
        console.log("📌 Sau khi làm phẳng:", flattenedAddresses);

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
  logoutUser,
  setLoggingOut,
  updateUserField,
  setDefaultAddress,
  addUserAddress,
  deleteAddress,
  removeAddress,
  updateAddresses,
  setUserAddresses,
  removeUserAddress,
} = userSlice.actions;
export default userSlice.reducer;
