import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addLike: (state, action) => {
      const reviewIndex = state.reviews.findIndex(
        (review) => review._id === action.payload.reviewId
      );
      if (reviewIndex !== -1) {
        state.reviews[reviewIndex].likes.push(action.payload.userId);
      }
    },
    addComment: (state, action) => {
      const reviewIndex = state.reviews.findIndex(
        (review) => review._id === action.payload.reviewId
      );
      if (reviewIndex !== -1) {
        if (!Array.isArray(state.reviews[reviewIndex].comments)) {
          state.reviews[reviewIndex].comments = [];
        }
        state.reviews[reviewIndex].comments.push(action.payload.comment);
      }
    },
  },
});

export const { setReviews, setLoading, setError, addLike, addComment } =
  reviewSlice.actions;

export default reviewSlice.reducer;

export const fetchReviews = (productId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(
      `http://localhost:3002/api/review/product/${productId}`
    );
    dispatch(setReviews(response.data));
  } catch (error) {
    dispatch(setError("Lỗi khi lấy đánh giá"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const likeReview = (reviewId) => async (dispatch, getState) => {
  const user = getState().user;
  console.log("USER:", user);
  dispatch(setLoading(true));
  try {
    const response = await axios.put(
      `http://localhost:3002/api/review/like/${reviewId}`,
      null,
      { headers: { Authorization: `Bearer ${user.accessToken}` } }
    );
    dispatch(addLike({ reviewId, userId: user._id }));
  } catch (error) {
    console.error("Lỗi khi like:", error);
    dispatch(setError("Lỗi khi thích đánh giá"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const addCommentToReview =
  (reviewId, comment) => async (dispatch, getState) => {
    const user = getState().user;
    dispatch(setLoading(true));
    try {
      const response = await axios.post(
        `http://localhost:3002/api/review/comment/${reviewId}`,
        { comment },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      dispatch(addComment({ reviewId, comment: response.data.comment }));
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      dispatch(setError("Lỗi khi thêm bình luận"));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const createReview = createAsyncThunk(
  "reviews/createReview",
  async (data, thunkAPI) => {
    const state = thunkAPI.getState();
    const dispatch = thunkAPI.dispatch;
    const user = state.user;

    dispatch(setLoading(true));
    try {
      const res = await axios.post(
        "http://localhost:3002/api/review/create",
        data,
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      return res.data.review;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
