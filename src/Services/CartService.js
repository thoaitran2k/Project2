import axios from "axios";

export const updateCart = () => async (dispatch, getState) => {
  try {
    const { user } = getState().auth; // Lấy user từ Redux
    if (!user) return;

    const { cartItems } = getState().cart; // Lấy giỏ hàng từ Redux

    await axios.post("/api/cart/update", { userId: user._id, cartItems });
  } catch (error) {
    console.error("Lỗi cập nhật giỏ hàng:", error);
  }
};
