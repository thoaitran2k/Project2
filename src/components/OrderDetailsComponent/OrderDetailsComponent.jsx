import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Typography,
  Divider,
  Button,
  Descriptions,
  Space,
  Image,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  TruckOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const OrderDetailsComponent = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const orderHistory = useSelector((state) => state.user.orderHistory);

  const order = orderHistory.find((item) => item.orderId === orderId);
  if (!order)
    return (
      <Card>
        <Text>Không tìm thấy đơn hàng</Text>
      </Card>
    );

  const {
    address: userAddress,
    orderDate,
    paymentMethod,
    products,
    total,
    ShippingFee,
    totalDiscount,
    status,
  } = order;

  const { name, phone, address: fullAddress } = userAddress;

  const shippingMethod =
    ShippingFee === 30000
      ? "EXPRESS - Giao hàng nhanh"
      : ShippingFee === 15000
      ? "STANDARD - Giao hàng tiêu chuẩn"
      : "Khác";

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { text: "Chờ xử lý", color: "gold" };
      case "processing":
        return { text: "Đang xử lý", color: "blue" };
      case "shipping":
        return { text: "Đang giao hàng", color: "cyan" };
      case "delivered":
        return { text: "Đã giao", color: "purple" };
      case "paid":
        return { text: "Đã thanh toán", color: "green" };
      case "cancelled":
        return { text: "Đã hủy", color: "red" };
      default:
        return { text: "Không rõ", color: "gray" };
    }
  };

  const { text, color } = getStatusInfo(status);

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Image
            width={60}
            src={record.image}
            alt={record.name}
            preview={false}
          />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary">
              Màu: {record.color}, Size: {record.size}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (price) => `${price.toLocaleString()} đ`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "center",
      render: (discount) => `${discount.toLocaleString()} đ`,
    },
    {
      title: "Tạm tính",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "center",
      render: (subtotal) => `${subtotal.toLocaleString()} đ`,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại đơn hàng của tôi
      </Button>

      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Đơn hàng #{orderId.slice(-8).toUpperCase()}
          </Title>
          <Badge
            count={text}
            color={color}
            style={{
              padding: "1px 8px",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 500,
            }}
          />
        </Row>

        <Text type="secondary" style={{ display: "block", textAlign: "right" }}>
          Ngày đặt hàng: {formatDate(orderDate)}
        </Text>
      </Card>

      <Row gutter={16} style={{ marginTop: 16, marginBottom: 24 }}>
        <Col span={8} style={{ display: "flex" }}>
          <Card
            style={{ width: "100%", height: "100%" }}
            title={
              <Space>
                <HomeOutlined />
                <Text strong>Địa chỉ người nhận</Text>
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item>
                <Text strong>{name}</Text>
              </Descriptions.Item>
              <Descriptions.Item>
                <Text>{fullAddress}</Text>
              </Descriptions.Item>
              <Descriptions.Item>
                <Text>Điện thoại: {phone}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={8} style={{ display: "flex" }}>
          <Card
            style={{ width: "100%", height: "100%" }}
            title={
              <Space>
                <TruckOutlined />
                <Text strong>Hình thức giao hàng</Text>
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item>
                <Text>{shippingMethod}</Text>
              </Descriptions.Item>
              <Descriptions.Item>
                <Text>
                  Dự kiến giao:{" "}
                  {formatDate(
                    new Date(orderDate).getTime() + 3 * 24 * 60 * 60 * 1000
                  )}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item>
                <Text>Phí vận chuyển: {ShippingFee.toLocaleString()} đ</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={8} style={{ display: "flex" }}>
          <Card
            style={{ width: "100%", height: "100%" }}
            title={
              <Space>
                <CreditCardOutlined />
                <Text strong>Hình thức thanh toán</Text>
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item>
                <Text>
                  {paymentMethod === "cash"
                    ? "Thanh toán tiền mặt khi nhận hàng"
                    : paymentMethod === "credit_card"
                    ? "Thẻ tín dụng"
                    : "Ví điện tử"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title="Chi tiết sản phẩm" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          pagination={false}
          bordered
        />
      </Card>

      <Card>
        <Row justify="end">
          <Col span={8}>
            <Descriptions
              column={1}
              size="small"
              layout="horizontal"
              style={{ width: "100%" }}
              labelStyle={{ width: "50%", textAlign: "left" }}
              contentStyle={{ width: "50%", textAlign: "right" }}
            >
              <Descriptions.Item label="Tạm tính">
                <Text>
                  {products
                    .reduce((sum, p) => sum + p.subtotal, 0)
                    .toLocaleString()}{" "}
                  đ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                <Text>{ShippingFee.toLocaleString()} đ</Text>
              </Descriptions.Item>
              {totalDiscount > 0 && (
                <Descriptions.Item label="Đơn hàng được tổng giảm">
                  <Text type="warning">{totalDiscount.toLocaleString()} đ</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="">
                <Divider style={{ margin: "12px 0" }} />
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                  {total.toLocaleString()} đ
                </Title>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OrderDetailsComponent;
