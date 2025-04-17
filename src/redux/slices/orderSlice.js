import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Giả sử bạn lưu token trong localStorage hoặc Redux state
const getToken = () => {
  // Nếu token được lưu trong localStorage
  return localStorage.getItem("accessToken");
};

// Lấy tất cả đơn hàng
export const fetchAllOrders = createAsyncThunk(
  "order/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = getToken(); // Lấy access token
      const response = await axios.get(
        "http://localhost:3002/api/order/get-all",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm Authorization header
          },
        }
      );
      console.log("response", response);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async ({ orderId, status, confirmCancel }, thunkAPI) => {
    try {
      const token = getToken(); // Lấy access token
      const response = await axios.put(
        `http://localhost:3002/api/order/update-status/${orderId}`,
        {
          status,
          confirmCancel, // Thêm confirmCancel vào body của request
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm Authorization header
          },
        }
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Cập nhật trạng thái yêu cầu hủy đơn hàng
export const requestCancelOrder = createAsyncThunk(
  "order/requestCancel",
  async (orderId, thunkAPI) => {
    try {
      const token = getToken();
      const response = await axios.patch(
        // Thay PUT bằng PATCH
        `http://localhost:3002/api/order/${orderId}/request-cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [], // Đảm bảo orders là mảng trống ban đầu
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload; // Cập nhật danh sách đơn hàng
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật lại đơn hàng trong state
        const updated = action.payload.order;
        const index = state.orders.findIndex((o) => o._id === updated._id);
        if (index !== -1) {
          state.orders[index] = updated;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
