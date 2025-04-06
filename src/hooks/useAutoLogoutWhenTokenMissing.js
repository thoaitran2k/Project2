import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice"; // hoặc đúng path reducer của bạn

const useAutoLogoutWhenTokenMissing = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.warn("🚨 Mất accessToken, tự động logout...");
        dispatch(setUser(null));
      }
    }, 1000); // kiểm tra mỗi giây

    return () => clearInterval(interval);
  }, [dispatch]);
};

export default useAutoLogoutWhenTokenMissing;
