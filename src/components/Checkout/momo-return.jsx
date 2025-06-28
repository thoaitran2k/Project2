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
      const messageParam = searchParams.get("message") || "Không rõ lý do";

      // Lấy thông tin đơn hàng từ localStorage
      const pendingOrder = JSON.parse(localStorage.getItem("momoPendingOrder"));

      if (!pendingOrder || !pendingOrder.orderId) {
        message.error("Không tìm thấy thông tin đơn hàng");
        return navigate("/");
      }

      // Tạo headers với token xác thực
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${
            accessToken || localStorage.getItem("accessToken")
          }`,
        },
      };

      try {
        // Kiểm tra trạng thái mới nhất từ server
        const { data: orderStatus } = await axios.get(
          `http://localhost:3002/api/order/${pendingOrder.orderId}/status`,
          authHeaders
        );

        // Nếu IPN đã xử lý rồi thì follow trạng thái từ server
        if (orderStatus.status !== "pending_payment") {
          if (orderStatus.status === "paid") {
            // Xử lý thành công
            const orderedProductIds = pendingOrder.products.map(
              (item) => item.id
            );
            dispatch(removeMultipleFromCart(orderedProductIds));
            dispatch(updateCartOnServer({ forceUpdateEmptyCart: true }));

            return navigate("/checkout/success", {
              state: {
                total: pendingOrder.total,
                paymentMethod: "momo",
                createdAt: new Date().toLocaleString(),
              },
            });
          } else {
            return navigate("/checkout/payment-failed", {
              state: {
                reason: orderStatus.cancelReason || "Thanh toán thất bại",
                orderId: pendingOrder.orderId,
              },
            });
          }
        }

        // Nếu IPN chưa xử lý (xử lý từ redirect)
        if (resultCode !== "0") {
          // Thanh toán thất bại
          await axios.post(
            "http://localhost:3002/api/order/cancel",
            {
              orderId: pendingOrder.orderId,
              reason: `Thanh toán MoMo thất bại: ${messageParam}`,
            },
            authHeaders
          );

          return navigate("/checkout/payment-failed", {
            state: {
              reason: messageParam,
              orderId: pendingOrder.orderId,
            },
          });
        }

        // Thanh toán thành công từ redirect
        await axios.put(
          `http://localhost:3002/api/order/update-status/${pendingOrder.orderId}`,
          { status: "paid" },
          authHeaders
        );

        // Xóa sản phẩm khỏi giỏ hàng
        const orderedProductIds = pendingOrder.products.map((item) => item.id);
        dispatch(removeMultipleFromCart(orderedProductIds));
        dispatch(updateCartOnServer({ forceUpdateEmptyCart: true }));

        navigate("/checkout/success", {
          state: {
            total: pendingOrder.total,
            paymentMethod: "momo",
            createdAt: new Date().toLocaleString(),
          },
        });
      } catch (error) {
        console.error("Lỗi xử lý thanh toán MoMo:", error);
        message.error("Có lỗi xảy ra khi xử lý kết quả thanh toán");
        navigate("/checkout/payment-failed", {
          state: {
            reason: "Lỗi hệ thống khi xử lý thanh toán",
            orderId: pendingOrder.orderId,
          },
        });
      } finally {
        localStorage.removeItem("momoPendingOrder");
      }
    };

    processMomoReturn();
  }, [location, navigate, dispatch, accessToken]);

  return <div>Đang xử lý kết quả thanh toán...</div>;
};

export default MomoReturn;
