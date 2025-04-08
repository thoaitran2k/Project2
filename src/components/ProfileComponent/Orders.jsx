import React, { useState } from "react";
import { Button, Input, Space, Divider, Card, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const Orders = () => {
  const [activeTab, setActiveTab] = useState("Tất cả đơn");

  const orderHistory = useSelector((state) => state.user.orderHistory);

  console.log("orderHistory", orderHistory);

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
      ShippingFee: order.ShippingFee,
      totalDiscount: order.totalDiscount,
      total: order.total,
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
                    <div
                      style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",

                          border: "solid 1px #ccc",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: "0px",
                          right: "0px",
                          background: "#ccc",
                          color: "white",
                          padding: "2px 6px",
                          borderTopLeftRadius: "10px",

                          fontSize: "12px",
                        }}
                      >
                        x{product.quantity}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
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
                    <br />
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",

                      padding: 5,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#ff4d4f",
                      }}
                    >
                      <span style={{ marginRight: "30px" }}>Tổng cộng: </span>
                      <span>{order.total.toLocaleString()} đ</span>
                    </div>
                    <Space
                      style={{
                        textAlign: "right",

                        marginLeft: "320px",
                      }}
                    >
                      {order.actions.map((action) => (
                        <Button
                          style={{ border: "solid 2px black" }}
                          key={action}
                          type="text"
                        >
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
