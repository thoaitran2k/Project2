import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Space,
  Divider,
  Card,
  Tag,
  message,
  Empty,
  Typography,
  Modal,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { addToCart, updateCartOnServer } from "../../redux/slices/cartSlice";
import axios from "axios";
import styled from "styled-components";

const { Text } = Typography;

const filterTabs = [
  "Tất cả đơn",
  "Chờ xử lý",
  "Đã tiếp nhận",
  "Đang vận chuyển",
  "Đã giao",
  "Đã huỷ",
];

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [processedOrders, setProcessedOrders] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const [activeTab, setActiveTab] = useState(filterTabs[0]);

  const orderHistory = useSelector((state) => state.user.orderHistory);

  useEffect(() => {
    // Process and sort orders whenever orderHistory or searchQuery changes
    if (orderHistory) {
      const processed = processOrders(orderHistory);
      setProcessedOrders(processed);
    }
  }, [orderHistory, searchQuery]);

  const handleBuyAgain = async (orderId) => {
    const order = orderHistory.find((o) => o._id === orderId);
    if (!order) {
      message.warning("Không tìm thấy đơn hàng");
      return;
    }

    try {
      for (const item of order.products) {
        const {
          productId,
          name,
          image,
          price,
          type,
          quantity,
          size,
          color,
          diameter,
        } = item;

        const isClothing = ["Áo nam", "Áo nữ"].includes(type);
        const isPants = ["Quần nam", "Quần nữ"].includes(type);
        const isWatch = type === "Đồng hồ";
        const isAccessory = ["Trang sức", "Ví", "Túi xách"].includes(type);

        let discount = 0;
        try {
          const res = await axios.get(
            `http://localhost:3002/api/product/${productId}/discount`
          );
          discount = res.data.discount || 0;
        } catch (err) {
          console.error(
            `❌ Không lấy được discount cho sản phẩm ${productId}:`,
            err
          );
        }

        const itemToAdd = {
          product: {
            _id: productId,
            name,
            image,
            price,
            type,
            discount,
          },
          quantity,
          amount: isAccessory ? quantity : 1,
          ...(isClothing || isPants ? { size, color } : {}),
          ...(isWatch ? { diameter, color } : {}),
        };

        dispatch(addToCart(itemToAdd));
      }

      dispatch(updateCartOnServer());
      message.success("🛒 Đã thêm các sản phẩm từ đơn cũ vào giỏ hàng");
    } catch (error) {
      message.error("Có lỗi xảy ra khi mua lại đơn hàng");
      console.error("Error in handleBuyAgain:", error);
    }
  };

  const getDisplayStatus = (status) => {
    switch (status) {
      case "pending":
        return {
          type: "Chờ xử lý",
          tagColor: "orange",
          display: "Chờ xử lý",
          priority: 1,
        };
      case "processing":
        return {
          type: "Đã tiếp nhận",
          tagColor: "blue",
          display: "Đã tiếp nhận",
          priority: 2,
        };
      case "shipping":
        return {
          type: "Đang vận chuyển",
          tagColor: "geekblue",
          display: "Đang vận chuyển",
          priority: 3,
        };
      case "delivered":
        return {
          type: "Đã giao",
          tagColor: "green",
          display: "Giao hàng thành công",
          priority: 4,
        };
      case "cancelled":
        return {
          type: "Đã huỷ",
          tagColor: "red",
          display: "Đã huỷ",
          priority: 5,
        };
      case "requestedCancel": // Thêm trạng thái yêu cầu hủy
        return {
          type: "Yêu cầu huỷ",
          tagColor: "gold",
          display: "Chờ xét duyệt huỷ",
          priority: 1.5,
        };
      default:
        return {
          type: "Khác",
          tagColor: "default",
          display: status,
          priority: 6,
        };
    }
  };

  const processOrders = (orders) => {
    return orders
      .map((order) => {
        const totalQuantity = order.products.reduce(
          (sum, p) => sum + p.quantity,
          0
        );
        const statusInfo = getDisplayStatus(order.status);

        let actions = ["Xem chi tiết"];

        // Thêm nút "Mua lại" cho đơn đã giao hoặc đã hủy
        if (["delivered", "cancelled"].includes(order.status)) {
          actions.unshift("Mua lại");
        }
        // Thêm nút "Huỷ" cho đơn chờ xử lý hoặc đã tiếp nhận
        else if (["pending", "processing"].includes(order.status)) {
          actions.unshift("Huỷ");
        }

        return {
          key: order._id,
          orderId: order.orderId,
          products: order.products,
          address: order.address,
          orderDate: order.orderDate,
          paymentMethod: order.paymentMethod,
          ShippingFee: order.ShippingFee,
          totalDiscount: order.totalDiscount,
          total: order.total,
          quantity: `x${totalQuantity}`,
          status: statusInfo.display,
          statusType: statusInfo.type,
          tagColor: statusInfo.tagColor,
          priority: statusInfo.priority,
          actions,
          originalStatus: order.status,
        };
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return new Date(b.orderDate) - new Date(a.orderDate);
      });
  };

  const filterOrders = () => {
    let filtered = [...processedOrders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(query) ||
          order.products.some((p) => p.name.toLowerCase().includes(query))
      );
    }

    if (activeTab !== "Tất cả đơn") {
      filtered = filtered.filter((order) => order.statusType === activeTab);
    }

    return filtered;
  };

  const filteredOrders = filterOrders();

  const activeIndex = filterTabs.indexOf(activeTab);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCancelClick = (orderId) => {
    setOrderToCancel(orderId);
    setIsCancelModalOpen(true);
  };

  const handleRequestCancel = async (orderId) => {
    try {
      const token = localStorage.getItem("accessToken");

      // Gửi yêu cầu huỷ
      await axios.patch(
        `http://localhost:3002/api/order/${orderId}/request-cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success(
        "✅ Đã gửi yêu cầu huỷ đơn hàng. Vui lòng chờ xác nhận từ quản trị viên."
      );

      // Cập nhật trạng thái của đơn hàng
      setProcessedOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status: "Chờ xét duyệt huỷ",
                statusType: "Yêu cầu huỷ",
                tagColor: "gold",
                originalStatus: "requestedCancel",
                actions: ["Xem chi tiết"],
              }
            : order
        )
      );
    } catch (err) {
      message.error("❌ Gửi yêu cầu huỷ thất bại");
      console.error("Cancel request error:", err);
    } finally {
      setIsCancelModalOpen(false);
    }
  };

  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Filter and search bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <TabsWrapper activeIndex={activeIndex}>
            {filterTabs.map((tab) => (
              <TabItem
                key={tab}
                active={tab === activeTab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </TabItem>
            ))}
          </TabsWrapper>
          <Input
            placeholder="Tìm đơn hàng theo Mã đơn hàng hoặc Tên sản phẩm"
            suffix={<SearchOutlined />}
            style={{ width: "400px", maxWidth: "100%" }}
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <Divider />

        {/* Order list */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card
              key={order.key}
              style={{
                marginBottom: "20px",
                borderRadius: "8px",
                borderColor: "#f0f0f0",
                backgroundColor: "#E6F4FF",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <div style={{ width: "100%" }}>
                {/* Order header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    alignItems: "center",
                  }}
                >
                  <Tag color={order.tagColor} style={{ margin: 0 }}>
                    {order.status}
                  </Tag>
                  <Text type="secondary">
                    {new Date(order.orderDate).toLocaleString("vi-VN")}
                  </Text>
                </div>

                {/* Products list */}
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
                    <div style={{ position: "relative", minWidth: "80px" }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          border: "1px solid #f0f0f0",
                          borderRadius: "4px",
                        }}
                      />
                      <Tag
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          borderTopLeftRadius: "8px",
                          margin: 0,
                        }}
                      >
                        x{product.quantity}
                      </Tag>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong>{product.name}</Text>
                      {product.color && (
                        <div>
                          <Text type="secondary">Màu: {product.color}</Text>
                        </div>
                      )}
                      {product.size && (
                        <div>
                          <Text type="secondary">Size: {product.size}</Text>
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, color: "#ff4d4f" }}>
                      {product.subtotal.toLocaleString()} đ
                    </div>
                  </div>
                ))}

                <Divider style={{ margin: "12px 0" }} />

                {/* Order footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Text strong>Phương thức thanh toán: </Text>
                    <Text>
                      {order.paymentMethod === "cash"
                        ? "Tiền mặt khi nhận hàng"
                        : order.paymentMethod}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text strong style={{ marginRight: "8px" }}>
                        Tổng cộng:
                      </Text>
                      <Text
                        strong
                        style={{ color: "#ff4d4f", fontSize: "16px" }}
                      >
                        {order.total.toLocaleString()} đ
                      </Text>
                    </div>
                    <Space>
                      {order.actions.map((action) => (
                        <Button
                          key={action}
                          type={
                            action === "Huỷ"
                              ? "default"
                              : action === "Mua lại"
                              ? "primary"
                              : "default"
                          }
                          danger={action === "Huỷ"}
                          onClick={() => {
                            if (action === "Mua lại") {
                              handleBuyAgain(order.key);
                            } else if (action === "Xem chi tiết") {
                              navigate(`/order/view/${order.orderId}`);
                            } else if (action === "Huỷ") {
                              handleCancelClick(order.orderId);
                            }
                          }}
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
          <Card>
            <Empty
              description={
                <Text type="secondary">
                  Không có đơn hàng nào trong mục này
                </Text>
              }
            />
          </Card>
        )}
      </Space>
      {/* Modal xác nhận Hủy đơn hàng */}
      <Modal
        title="Xác nhận hủy đơn hàng"
        open={isCancelModalOpen}
        onOk={() => handleRequestCancel(orderToCancel)}
        onCancel={() => setIsCancelModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy bỏ"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có thực sự muốn hủy đơn hàng này không?</p>
        <p>Hãy liên hệ với Nhân viên shop để được hỗ trợ</p>
      </Modal>
    </div>
  );
};

export default Orders;

const TabsWrapper = styled.div`
  position: relative;
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9fb;
  padding: 10px;
  width: 100%;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    height: 2px;
    width: calc(100% / 6); /* 6 tabs */
    background-color: #1677ff;
    transition: all 0.3s;
    left: ${({ activeIndex }) =>
      `calc(${100 / 6}% * ${activeIndex})`}; /* chuyển theo index */
  }
`;

const TabItem = styled.div`
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: ${({ active }) => (active ? "#1677ff" : "#8c8c8c")};
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  transition: color 0.3s;
`;
