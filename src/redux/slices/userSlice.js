import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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

export const addUserAddress = createAsyncThunk(
  "user/addUserAddress",
  async ({ userId, newAddress }, { getState, dispatch }) => {
    const accessToken = getState().user.accessToken;

    if (!accessToken) throw new Error("Không có accessToken!");

    try {
      const response = await axios.post(
        `http://localhost:3002/api/user/${userId}/add-addresses`,
        newAddress,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Gọi lại API để lấy danh sách địa chỉ mới sau khi thêm thành công
      await dispatch(updateAddressList());

      return response.data; // Trả về dữ liệu địa chỉ mới
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      throw new Error("Không thể thêm địa chỉ!");
    }
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
      state._id = payload._id || state._id;
      state.accessToken = payload.accessToken || state.accessToken;
      state.refreshToken = payload.refreshToken || state.refreshToken;
      state.username = payload.username || state.username;
      state.email = payload.email || state.email;
      state.phone = payload.phone || state.phone;
      state.address = Array.isArray(payload.address)
        ? payload.address
        : state.address;
      state.avatar = payload.avatar || state.avatar;
      state.dob = payload.dob || state.dob;
      state.gender = payload.gender || state.gender;

      // ✅ Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(state));
    },
    updateAddresses: (state, action) => {
      console.log("Dữ liệu nhận vào Redux:", action.payload);
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
      Object.assign(state, { ...initialState, isAuthenticated: false });
    },

    setLoggingOut: (state, action) => {
      state.isLoggingOut = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const { username, email, phone, dob, gender, address, avatar } =
          action.payload;
        state.username = username;
        state.email = email;
        state.phone = phone;
        state.dob = dob;
        state.gender = gender;
        state.address = address;
        state.avatar = avatar;
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

        console.log("🔹 Địa chỉ đã cập nhật:", updatedAddress);

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
  addAddress,
  setDefaultAddress,
  removeAddress,
  updateAddresses,
  setUserAddresses,
} = userSlice.actions;
export default userSlice.reducer;
