import { useLocation } from "react-router-dom";
import { Button, Result } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const PaymentFailed = () => {
  const { state } = useLocation();
  const reason = state?.reason || "Thanh toán không thành công";
  const orderId = state?.orderId || "Không xác định";

  return (
    <div className="container" style={{ padding: "50px 0" }}>
      <Result
        status="error"
        title="Thanh toán thất bại"
        subTitle={`Mã đơn hàng: ${orderId}`}
        extra={[
          <p key="reason" style={{ marginBottom: 20 }}>
            Lý do: {reason}
          </p>,
          <Button
            type="primary"
            icon={<HomeOutlined />}
            href="/home"
            key="home"
          >
            Về trang chủ
          </Button>,
          <Button href="/checkout" key="retry">
            Thử lại thanh toán
          </Button>,
        ]}
      />
    </div>
  );
};

export default PaymentFailed;
