import React, { useState } from "react";
import { Button, Input, Space, Divider, Card, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const Orders = () => {
  const [activeTab, setActiveTab] = useState("Tất cả đơn");

  const orderHistory = useSelector((state) => state.user.orderHistory);

  const getDisplayStatus = (status) => {
    switch (status) {
      case "pending":
        return {
          type: "Chờ thanh toán",
          tagColor: "orange",
          display: "Chờ thanh toán",
        };
      case "processing":
        return { type: "Đang xử lý", tagColor: "blue", display: "Đang xử lý" };
      case "shipping":
        return {
          type: "Đang vận chuyển",
          tagColor: "blue",
          display: "Đang vận chuyển",
        };
      case "delivered":
        return {
          type: "Đã giao",
          tagColor: "green",
          display: "Giao hàng thành công",
        };
      case "cancelled":
        return { type: "Đã huỷ", tagColor: "red", display: "Đã huỷ" };
      default:
        return { type: "Khác", tagColor: "default", display: status };
    }
  };

  const allOrders = (orderHistory || []).map((order) => {
    const totalQuantity = order.products.reduce(
      (sum, p) => sum + p.quantity,
      0
    );
    const statusInfo = getDisplayStatus(order.status);

    return {
      key: order._id,
      products: order.products,
      address: order.address,
      orderDate: order.orderDate,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      quantity: `x${totalQuantity}`,
      status: statusInfo.display,
      type: statusInfo.type,
      tagColor: statusInfo.tagColor,
      actions: ["Mua lại", "Xem chi tiết"],
    };
  });

  const filteredOrders =
    activeTab === "Tất cả đơn"
      ? allOrders
      : allOrders.filter((order) => order.type === activeTab);

  const filterTabs = [
    "Tất cả đơn",
    "Chờ thanh toán",
    "Đang xử lý",
    "Đang vận chuyển",
    "Đã giao",
    "Đã huỷ",
  ];

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Thanh filter và tìm kiếm */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            {filterTabs.map((tab) => (
              <Button
                key={tab}
                type={activeTab === tab ? "primary" : "text"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
          <Input
            placeholder="Tìm đơn hàng theo Mã đơn hàng, Nhà bán hoặc Tên sản phẩm"
            suffix={<SearchOutlined />}
            style={{ width: "400px" }}
          />
        </div>

        <Divider />

        {/* Danh sách đơn hàng đã lọc */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card
              key={order.key}
              style={{
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: "#F6FCFF",
              }}
            >
              <div style={{ width: "100%" }}>
                {/* Tag trạng thái */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Tag color={order.tagColor}>{order.status}</Tag>
                  <span>
                    {new Date(order.orderDate).toLocaleString("vi-VN")}
                  </span>
                </div>

                {/* Danh sách sản phẩm */}
                {order.products.map((product) => (
                  <div
                    key={product._id}
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "12px",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
                      <div style={{ color: "#666" }}>
                        Số lượng: x{product.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: "bold", color: "#ff4d4f" }}>
                      {product.subtotal.toLocaleString()} đ
                    </div>
                  </div>
                ))}

                <Divider style={{ margin: "10px 0" }} />

                {/* Tổng thanh toán và hành động */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ color: "#666" }}>
                      Thanh toán:{" "}
                      <strong>
                        {order.paymentMethod === "cash"
                          ? "Tiền mặt"
                          : order.paymentMethod}
                      </strong>
                    </div>
                    <div style={{ color: "#666" }}>
                      Giao đến:{" "}
                      <strong>
                        {order.address?.name} - {order.address?.phone}
                      </strong>
                      <br />
                      {order.address?.address}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#ff4d4f",
                      }}
                    >
                      Tổng cộng: {order.totalAmount.toLocaleString()} đ
                    </div>
                    <Space>
                      {order.actions.map((action) => (
                        <Button key={action} type="text">
                          {action}
                        </Button>
                      ))}
                    </Space>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Không có đơn hàng nào trong mục này</p>
          </div>
        )}
      </Space>
    </div>
  );
};

export default Orders;
