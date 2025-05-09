import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleLikeProduct } from "./likeSlice";

// 🔥 Action gọi API lấy tất cả sản phẩm_____________________________________
export const getAllProduct = createAsyncThunk(
  "product/getAllProduct",
  async ({ limit, page }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/product/get-all`,
        {
          params: { limit, page }, // ✅ Truyền limit và page vào API
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lấy sản phẩm thất bại");
    }
  }
);

// 🔥 Action gọi API tạo sản phẩm_______________________________________________
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
      return response.data; // ✅ Trả về một đối tượng sản phẩm mới
    } catch (error) {
      return rejectWithValue(error.response?.data || "Tạo sản phẩm thất bại");
    }
  }
);

//Action gọi API lấy sản phẩm theo ID_____________________________________________________________
export const getDetailsProductById = createAsyncThunk(
  "product/getProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/product/get-details/${productId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lấy sản phẩm thất bại");
    }
  }
);

//Action gọi API cập nhật sản phẩm_________________________________________________________
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async (
    { productId, updatedData, accessToken },
    { rejectWithValue, getState }
  ) => {
    try {
      const accessToken = getState().user.accessToken;

      if (!accessToken) {
        return rejectWithValue("Bạn cần đăng nhập để thực hiện hành động này.");
      }
      const response = await axios.put(
        `${import.meta.env.VITE_URL_BACKEND}/product/update/${productId}`,
        updatedData,
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
        error.response?.data || "Cập nhật sản phẩm thất bại"
      );
    }
  }
);

//Action gọi API xóa sản phẩm_____________________________________________________________
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (productId, { rejectWithValue, getState }) => {
    // ✅ Không dùng destructuring { productId }
    try {
      const accessToken = getState().user.accessToken;

      if (!accessToken) {
        return rejectWithValue("Bạn cần đăng nhập để thực hiện hành động này.");
      }

      await axios.delete(
        `${import.meta.env.VITE_URL_BACKEND}/product/delete/${productId}`, // ✅ Đảm bảo productId không undefined
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Xóa sản phẩm thất bại");
    }
  }
);
//______________________________________________Action gọi API xóa nhiều sản phẩm
export const deleteManyProduct = createAsyncThunk(
  "product/deleteManyProduct",
  async (productIds, { rejectWithValue, getState }) => {
    try {
      const accessToken = getState().user.accessToken;

      if (!accessToken) {
        return rejectWithValue("Bạn cần đăng nhập để thực hiện hành động này.");
      }

      await axios.delete(
        `${import.meta.env.VITE_URL_BACKEND}/product/delete-many`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          data: { ids: productIds }, // Gửi danh sách ID sản phẩm cần xóa trong body
        }
      );

      return productIds; // Trả về danh sách ID sản phẩm đã xóa
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Xóa nhiều sản phẩm thất bại"
      );
    }
  }
);

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    productDetail: null,
    loading: false,
    error: null,
    searchTerm: "",
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload; // Lưu danh sách sản phẩm
    },
    setProductDetail: (state, action) => {
      state.productDetail = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      //Xử lý like
      .addCase(toggleLikeProduct.fulfilled, (state, action) => {
        const { productId, liked, likeCount } = action.payload;

        // Cập nhật lại trạng thái likedByCurrentUser của sản phẩm trong danh sách
        state.products = state.products.map((product) =>
          product._id === productId
            ? { ...product, likedByCurrentUser: liked, likeCount } // Cập nhật like
            : product
        );
      })
      //✅ Xử lý xóa nhiều sản phẩm cùng lúc
      .addCase(deleteManyProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyProduct.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.products)) {
          state.products = [];
        }

        state.products = state.products.filter(
          (product) => !action.payload.includes(product._id)
        );
      })
      .addCase(deleteManyProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ✅ Xử lý cập nhật sản phẩm________________________________________________________
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật sản phẩm trong danh sách
        //console.log("State Product", state.products);

        if (!Array.isArray(state.products)) {
          state.products = [];
        }

        // Cập nhật sản phẩm trong danh sách
        state.products = state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //Xử lý xóa sản phẩm___________________________________________________
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.products)) {
          state.products = []; // Đảm bảo products luôn là mảng
        }

        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Xử lý lấy tất cả sản phẩm__________________________________________________________
      .addCase(getAllProduct.pending, (state) => {
        //state.loading = true;
      })
      .addCase(getAllProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload; // Giữ nguyên danh sách sản phẩm

        // Cập nhật trạng thái likedByCurrentUser cho từng sản phẩm nếu đã có
        if (state.products.length > 0 && state.user) {
          state.products = state.products.map((product) => {
            // Kiểm tra xem người dùng đã like sản phẩm này chưa
            const likedByCurrentUser = product.likedByCurrentUser || false; // Đảm bảo trạng thái likedByCurrentUser tồn tại
            return { ...product, likedByCurrentUser }; // Cập nhật lại thông tin sản phẩm
          });
        }
      })
      .addCase(getAllProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Xử lý tạo sản phẩm mới___________________________________________________
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        if (!Array.isArray(state.products)) {
          state.products = [];
        }
        // Thêm sản phẩm mới vào mảng products
        state.products = [...state.products, action.payload];
        state.loading = false;
      })

      // ✅ Xử lý lấy sản phẩm theo ID________________________________________________________
      .addCase(getDetailsProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDetailsProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetail = action.payload; // Lưu sản phẩm chi tiết
      })
      .addCase(getDetailsProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setProducts, setProductDetail } =
  productSlice.actions;
export default productSlice.reducer;
