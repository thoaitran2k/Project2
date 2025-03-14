import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 Action gọi API lấy tất cả người dùng_____________________________________
export const getAllUsers = createAsyncThunk(
  "adminUsers/getAllUsers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().user.accessToken;

      if (!accessToken) {
        return rejectWithValue("Bạn cần đăng nhập để thực hiện hành động này.");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/user/getAll`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("response.data", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Lấy danh sách người dùng thất bại"
      );
    }
  }
);

// 🔥 Action gọi API lấy chi tiết người dùng theo ID ___________________________________________
export const getDetailsUserById = createAsyncThunk(
  "adminUsers/getDetailsUserById",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().user.accessToken;

      if (!accessToken) {
        return rejectWithValue("Bạn cần đăng nhập để thực hiện hành động này.");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/user/get-details/${userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Lấy thông tin người dùng thất bại"
      );
    }
  }
);

// 🔥 Action gọi API tạo người dùng mới_______________________________________________
export const createUser = createAsyncThunk(
  "adminUsers/createUser",
  async (newUser, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL_BACKEND}/user/sign-up`,
        newUser,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data; // ✅ Trả về một đối tượng người dùng mới
    } catch (error) {
      return rejectWithValue(error.response?.data || "Tạo người dùng thất bại");
    }
  }
);

// 🔥 Action gọi API cập nhật thông tin người dùng_________________________________________________________
export const updateUser = createAsyncThunk(
  "adminUsers/updateUser",
  async (
    { userId, updatedData, accessToken },
    { rejectWithValue, getState }
  ) => {
    try {
      const accessToken = getState().user.accessToken;

      if (!accessToken) {
        return rejectWithValue("Bạn cần đăng nhập để thực hiện hành động này.");
      }

      const { email, ...dataWithoutEmail } = updatedData;

      const response = await axios.put(
        `${import.meta.env.VITE_URL_BACKEND}/user/update-user/${userId}`,
        dataWithoutEmail,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Cập nhật thông tin người dùng thất bại"
      );
    }
  }
);

// 🔥 Action gọi API xóa người dùng_____________________________________________________________
export const deleteUser = createAsyncThunk(
  "adminUsers/deleteUser",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().user.accessToken;

      if (!accessToken) {
        return rejectWithValue("Bạn cần đăng nhập để thực hiện hành động này.");
      }

      await axios.delete(
        `${import.meta.env.VITE_URL_BACKEND}/user/delete-user/${userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Xóa người dùng thất bại");
    }
  }
);

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState: {
    users: [],
    userDetail: null,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // ✅ Xử lý cập nhật thông tin người dùng________________________________________________________
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật thông tin người dùng trong danh sách
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Xử lý lấy thông tin chi tiết người dùng
      .addCase(getDetailsUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDetailsUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetail = action.payload; // Lưu dữ liệu chi tiết người dùng vào state
      })
      .addCase(getDetailsUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Xử lý xóa người dùng___________________________________________________
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Xóa người dùng khỏi danh sách
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Xử lý lấy tất cả người dùng__________________________________________________________
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.data || []; // Lưu dữ liệu người dùng vào state
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Xử lý tạo người dùng mới___________________________________________________
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        // Thêm người dùng mới vào danh sách
        state.users = [...state.users, action.payload];
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminUsersSlice.reducer;
