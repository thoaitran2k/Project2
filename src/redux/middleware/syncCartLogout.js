import { resetCart } from "/src/redux/slices/cartSlice";
import { logoutUser } from "/src/redux/slices/userSlice";

export const syncCartLogout = (store) => (next) => (action) => {
  return next(action); // Không làm gì thêm
};
