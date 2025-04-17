import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  removeMultipleFromCart,
  updateCartOnServer,
} from "../../redux/slices/cartSlice";

const MomoReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.user.accessToken);

  useEffect(() => {
    const processMomoReturn = async () => {
      const searchParams = new URLSearchParams(location.search);
      const resultCode = searchParams.get("resultCode");
      const orderId = searchParams.get("orderId");

      // Lấy thông tin đơn hàng từ localStorage
      const pendingOrder = JSON.parse(localStorage.getItem("momoPendingOrder"));

      if (resultCode === "0") {
        // Thanh toán thành công
        try {
          // Cập nhật trạng thái đơn hàng trên server
          await axios.put(
            `http://localhost:3002/api/order/update-status/${pendingOrder.orderId}`,
            {
              status: "paid",
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );

          // Xóa các sản phẩm khỏi giỏ hàng
          const orderedProductIds = pendingOrder.products.map(
            (item) => item.id
          );
          dispatch(removeMultipleFromCart(orderedProductIds));
          dispatch(updateCartOnServer({ forceUpdateEmptyCart: true }));

          //message.success("Thanh toán thành công!");
          navigate("/checkout/success", {
            state: {
              total: pendingOrder.total,
              paymentMethod: "momo",
              createdAt: new Date().toLocaleString(),
            },
          });
        } catch (error) {
          message.error("Có lỗi khi cập nhật đơn hàng");
          navigate("/");
        }
      } else {
        // Thanh toán thất bại
        message.error("Thanh toán MoMo thất bại");
        navigate("/checkout");
      }

      // Xóa dữ liệu tạm
      localStorage.removeItem("momoPendingOrder");
    };

    processMomoReturn();
  }, [location, navigate]);

  return <div>Đang xử lý kết quả thanh toán...</div>;
};

export default MomoReturn;
