import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logoutUser } from "./userSlice";
import axios from "axios";

export const updateCartOnServer = createAsyncThunk(
  "cart/updateCartOnServer",
  async (
    { forceUpdateEmptyCart = false } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const user = getState().user;
      if (!user) throw new Error("User chưa đăng nhập");

      const { cartItems } = getState().cart;

      if (!forceUpdateEmptyCart && !cartItems.length) {
        return; // Không gửi nếu giỏ hàng trống và không ép cập nhật
      }

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
              discount:
                item.product.discount !== undefined ? item.product.discount : 0,
            },
            id: item.id || item.product._id,
            quantity: item.quantity || 1,
          };
        })
        .filter(Boolean);

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
        discount,
      } = action.payload;

      if (!product || !product.type) {
        console.error("❌ Lỗi: Product không hợp lệ", product);
        return;
      }

      let itemId;
      const productType = product.type?.toLowerCase();

      console.log("productType", productType);

      // Tạo itemId duy nhất dựa trên các thuộc tính của sản phẩm
      if (["áo nam", "áo nữ", "quần nam", "quần nữ"].includes(productType)) {
        // Nếu là áo, quần, sử dụng size và color để tạo itemId duy nhất
        itemId = `${product._id}-${size}-${color}`;
      } else if (productType === "đồng hồ") {
        // Nếu là đồng hồ, sử dụng color và diameter để tạo itemId duy nhất
        itemId = `${product._id}-${color}-${diameter}`;
      } else {
        // Đối với các loại sản phẩm khác, chỉ sử dụng product._id làm itemId duy nhất
        itemId = product._id;
      }

      const existingItem = state.cartItems.find((item) => item.id === itemId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.unshift({
          id: itemId, // Giữ nguyên ID duy nhất
          product,
          quantity,
          ...(size && { size }),
          ...(color && { color }),
          ...(variant && { variant }),
          ...(diameter && { diameter }),
          ...(discount !== undefined && { discount }),
          selected: false,
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
    toggleCartItemSelected: (state, action) => {
      const itemId = action.payload;
      const item = state.cartItems.find((item) => item.id === itemId);

      if (item) {
        item.selected = !item.selected; // Chỉ thay đổi trạng thái selected
      }
    },

    toggleAllCartItemsSelected: (state, action) => {
      const shouldSelect = action.payload; // true/false
      state.cartItems.forEach((item) => {
        item.selected = shouldSelect; // Chỉ thay đổi trạng thái selected
      });
    },
    removeMultipleFromCart: (state, action) => {
      const itemIdsToRemove = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !itemIdsToRemove.includes(item.id)
      );
      state.cartCount = state.cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.cartItems = [];
        state.cartCount = 0;
        if (!state.cartItems.length) {
          return;
        }
      })
      .addCase(updateCartOnServer.fulfilled, () => {
        //console.log("✅ Giỏ hàng đã được cập nhật lên server");
      });
  },
});

export const {
  toggleCartItemSelected,
  toggleAllCartItemsSelected,
  addToCart,
  removeFromCart,
  removeMultipleFromCart,
  updateCartItemAmount,
  setCartFromServer,
  clearCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
