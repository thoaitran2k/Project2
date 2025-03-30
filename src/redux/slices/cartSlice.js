import { createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "./userSlice";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    cartCount: 0,
  },
  reducers: {
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
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.cartItems = [];
      state.cartCount = 0;
    });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemAmount,
  clearCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
