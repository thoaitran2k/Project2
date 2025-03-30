import { resetCart } from "/src/redux/slices/cartSlice";
import { logoutUser } from "/src/redux/slices/userSlice";

export const syncCartLogout = (store) => (next) => (action) => {
  if (action.type === logoutUser.fulfilled.type) {
    // Không cần dispatch PURGE ở đây vì đã xử lý trong logoutUser thunk
    store.dispatch(resetCart());
  }
  return next(action);
};
