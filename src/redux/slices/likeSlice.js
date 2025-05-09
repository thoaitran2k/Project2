import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Action để fetch tất cả likes của user
export const fetchUserLikes = createAsyncThunk(
  "like/fetchUserLikes",
  async (_, { getState }) => {
    try {
      const state = getState();
      const token = state.user.accessToken;

      if (!token) throw new Error("No access token available");

      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/product/get-likes/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Validate response data
      if (!Array.isArray(response.data)) {
        console.error(
          "Invalid response format - expected array:",
          response.data
        );
        return [];
      }

      return response.data.filter(
        (id) => id !== null && id !== undefined && typeof id === "string"
      );
    } catch (error) {
      console.error("Fetch likes error:", error);
      return []; // Luôn trả về mảng
    }
  }
);

// Action để toggle like
export const toggleLikeProduct = createAsyncThunk(
  "like/toggleLikeProduct",
  async ({ productId }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const accessToken = state.user.accessToken;
      const userId = state.user._id;

      if (!accessToken || !userId) {
        return rejectWithValue("Bạn cần đăng nhập để thích sản phẩm.");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_URL_BACKEND}/product/like/${productId}`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Trả về dữ liệu như thông tin về like của sản phẩm
      return {
        productId,
        userId,
        liked: response.data.liked,
        likeCount: response.data.likeCount,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi like sản phẩm");
    }
  }
);

const likeSlice = createSlice({
  name: "like",
  initialState: {
    likedProductIds: [], // Luôn là mảng
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLikes.fulfilled, (state, action) => {
        // Lọc bỏ các giá trị null/undefined
        state.likedProductIds = action.payload.filter(
          (id) => id !== null && id !== undefined
        );
      })
      .addCase(fetchUserLikes.rejected, (state) => {
        state.likedProductIds = []; // Reset về mảng rỗng nếu có lỗi
      })
      .addCase(toggleLikeProduct.fulfilled, (state, action) => {
        const { productId, liked } = action.payload;

        if (liked) {
          // Thêm productId nếu chưa có và là giá trị hợp lệ
          if (productId && !state.likedProductIds.includes(productId)) {
            state.likedProductIds.push(productId);
          }
        } else {
          // Xóa productId nếu tồn tại
          state.likedProductIds = state.likedProductIds.filter(
            (id) => id !== productId
          );
        }
      });
  },
});

export default likeSlice.reducer;
