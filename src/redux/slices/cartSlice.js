import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logoutUser } from "./userSlice";
import axios from "axios";

export const updateCartOnServer = createAsyncThunk(
  "cart/updateCartOnServer",
  async (_, { getState, rejectWithValue }) => {
    try {
      const user = getState().user;
      if (!user) throw new Error("User chưa đăng nhập");

      const { cartItems } = getState().cart;

      // console.log("Dữ liệu trả về", cartItems);
      const response = await axios.put(
        "http://localhost:3002/api/cart/update",
        {
          userId: user._id,
          cartItems,
        }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật giỏ hàng:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    cartCount: 0,
  },
  reducers: {
    setCartFromServer: (state, action) => {
      console.log("🟢 Reducer nhận action:", action); // Xem toàn bộ action payload

      const { cartItems = [], cartCount = 0 } = action.payload;

      console.log("🔹 Dữ liệu cartItems trước khi vào reducer:", cartItems);

      if (!Array.isArray(cartItems)) {
        console.error("❌ cartItems không phải là mảng!", cartItems);
        state.cartItems = [];
        state.cartCount = 0;
        return;
      }

      const validatedItems = cartItems
        .map((item) => {
          if (!item.product || !item.product._id) {
            console.warn("⚠️ Bỏ qua item không hợp lệ:", item);
            return null;
          }
          return {
            ...item,
            product: {
              _id: item.product._id,
              name: item.product.name || "Không có tên",
              price: item.product.price || 0,
              image: item.product.image || "",
              type: item.product.type || "unknown",
            },
            id: item.id || `${item.product._id}-${Date.now()}`,
            quantity: item.quantity || 1,
          };
        })
        .filter(Boolean);

      console.log(
        "✅ Số lượng item hợp lệ sau khi filter:",
        validatedItems.length
      );

      state.cartItems = validatedItems;
      state.cartCount = validatedItems.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );
    },

    addToCart: (state, action) => {
      if (!action.payload?.product) {
        console.error("❌ Lỗi: payload không hợp lệ", action.payload);
        return;
      }

      const {
        product,
        quantity = 1,
        size,
        color,
        variant,
        diameter,
      } = action.payload;

      // Kiểm tra product có tồn tại và có thuộc tính type không
      if (!product || !product.type) {
        console.error("❌ Lỗi: Product không hợp lệ", product);
        return;
      }

      // Tạo ID duy nhất theo loại sản phẩm
      let itemId;
      const productType = product.type?.toLowerCase(); // Thêm ?. để phòng trường hợp type undefined

      if (["áo nam", "áo nữ", "quần nam", "quần nữ"].includes(productType)) {
        itemId = variant?._id || `${product._id}-${size}-${color}`;
      } else if (productType === "đồng hồ") {
        itemId = variant?._id || `${product._id}-${color}-${diameter}`;
      } else {
        itemId = product._id; // Cho phụ kiện
      }

      const existingItem = state.cartItems.find((item) => item.id === itemId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({
          id: itemId,
          product,
          quantity,
          ...(size && { size }),
          ...(color && { color }),
          ...(variant && { variant }),
          ...(diameter && { diameter }),
        });
      }

      state.cartCount = state.cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
    },

    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const item = state.cartItems.find((item) => item.id === itemId);

      if (item) {
        state.cartCount -= item.quantity; // Sửa từ amount sang quantity
        state.cartItems = state.cartItems.filter((item) => item.id !== itemId);
      }
    },

    updateCartItemAmount: (state, action) => {
      const { itemId, newAmount } = action.payload;
      const item = state.cartItems.find((item) => item.id === itemId);

      if (item) {
        state.cartCount += newAmount - item.quantity; // Sửa từ amount sang quantity
        item.quantity = newAmount; // Sửa từ amount sang quantity
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.cartCount = 0;
    },

    resetCart: (state) => {
      state.cartItems = [];
      state.cartCount = 0;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.cartItems = [];
        state.cartCount = 0;
      })
      .addCase(updateCartOnServer.fulfilled, () => {
        //console.log("✅ Giỏ hàng đã được cập nhật lên server");
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemAmount,
  setCartFromServer,
  clearCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
