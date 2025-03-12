import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 Action gọi API tạo sản phẩm
export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (newProduct, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL_BACKEND}/product/create`,
        newProduct,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data; // ✅ Trả về dữ liệu khi thành công
    } catch (error) {
      return rejectWithValue(error.response?.data || "Tạo sản phẩm thất bại");
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
