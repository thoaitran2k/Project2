import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag, Modal, message } from "antd";
import {
  fetchAllOrders,
  updateOrderStatus,
  requestCancelOrder,
} from "../../redux/slices/orderSlice";

const OrderManage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleConfirmChange = async () => {
    if (selectedOrder && newStatus) {
      try {
        // Xử lý đặc biệt khi chuyển sang trạng thái hủy
        if (newStatus === "cancelled") {
          Modal.confirm({
            title: "Xác nhận hủy đơn hàng",
            content: "Bạn có chắc chắn muốn hủy đơn hàng này?",
            onOk: async () => {
              try {
                await dispatch(
                  updateOrderStatus({
                    orderId: selectedOrder._id,
                    status: newStatus,
                    ...(selectedOrder.status === "requestedCancel" &&
                      newStatus === "cancelled" && { confirmCancel: true }),
                  })
                );
                message.success("✅ Đã xác nhận hủy đơn hàng thành công.");
                dispatch(fetchAllOrders());
              } catch (error) {
                message.error("❌ Xác nhận hủy đơn hàng thất bại.");
              }
            },
            onCancel() {
              message.info("Đã hủy thao tác xác nhận");
            },
          });
        } else {
          // Xử lý các trạng thái khác
          await dispatch(
            updateOrderStatus({
              orderId: selectedOrder._id,
              status: newStatus,
            })
          );
          message.success("✅ Trạng thái đơn hàng đã được cập nhật.");
          dispatch(fetchAllOrders());
        }
      } catch (error) {
        message.error("❌ Cập nhật trạng thái thất bại.");
      }
    }
    setIsModalOpen(false);
    setSelectedOrder(null);
    setNewStatus("");
  };

  const handleStatusChange = (order, value) => {
    setSelectedOrder(order);
    setNewStatus(value);
    setIsModalOpen(true);
  };

  const statusLabels = {
    pending: "Chờ xử lý",
    processing: "Đã tiếp nhận",
    shipping: "Giao hàng",
    delivered: "Giao hàng thành công",
    paid: "Đã thanh toán",
    cancelled: "Hủy",
    requestedCancel: "Yêu cầu hủy",
  };

  const statusColors = {
    pending: "orange",
    processing: "blue",
    shipping: "geekblue",
    delivered: "green",
    paid: "purple",
    cancelled: "red",
    requestedCancel: "gold",
  };

  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "_id",
      key: "_id",
      align: "center",
    },
    {
      title: "Email Người Dùng",
      dataIndex: ["customer", "userId", "email"],
      key: "email",
      align: "center",
      render: (email, record) => {
        // Kiểm tra nếu có email từ customer.userId
        if (email) return email;

        // Fallback nếu không có thông tin user
        return record.customer?.email || "Không có thông tin";
      },
    },
    {
      title: "SĐT Khách hàng",
      dataIndex: ["customer", "userId", "phone"],
      key: "phone",
      align: "center",
      render: (phone, record) => {
        // Kiểm tra nếu có email từ customer.userId
        if (phone) return phone;

        // Fallback nếu không có thông tin user
        return record.customer?.phone || "Không có thông tin";
      },
    },
    {
      title: "Ngày Đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Danh Sách Sản Phẩm",
      dataIndex: "selectedItems",
      key: "selectedItems",
      align: "center",
      render: (items) =>
        items.map((item) => (
          <Tag key={item.product._id}>{item.product.name}</Tag>
        )),
    },
    {
      title: "Tổng Giá Trị",
      dataIndex: "total",
      key: "total",
      align: "center",
      render: (text) => `${text.toLocaleString()} VND`,
    },
    {
      title: "Phương Thức Thanh Toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      align: "center",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status] || "Chưa rõ"}
        </Tag>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      align: "center",
      render: (text, record) => {
        const isDisabled =
          record.status === "cancelled" || record.status === "delivered";

        if (record.status === "requestedCancel") {
          return (
            <div
              style={{ display: "flex", gap: "8px", justifyContent: "center" }}
            >
              <button
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận hủy đơn hàng",
                    content: "Bạn có chắc chắn muốn hủy đơn hàng này?",
                    onOk: async () => {
                      try {
                        await dispatch(
                          updateOrderStatus({
                            orderId: record._id,
                            status: "cancelled",
                            confirmCancel: true,
                          })
                        );
                        message.success(
                          "✅ Đã xác nhận hủy đơn hàng thành công."
                        );
                        dispatch(fetchAllOrders());
                      } catch (error) {
                        message.error("❌ Xác nhận hủy đơn hàng thất bại.");
                      }
                    },
                    onCancel() {
                      message.info("Đã hủy thao tác xác nhận");
                    },
                  });
                }}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(record);
                  setNewStatus("pending");
                  setIsModalOpen(true);
                }}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#faad14",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Hủy yêu cầu
              </button>
            </div>
          );
        }

        return (
          <select
            value={record.status}
            onChange={(e) => handleStatusChange(record, e.target.value)}
            disabled={isDisabled}
          >
            {Object.entries(statusLabels).map(([key, label]) => {
              if (key === "requestedCancel") return null;

              const currentStatus = record.status;

              const shouldHide =
                (key === "pending" || key === "processing") &&
                ["paid", "shipping", "delivered"].includes(currentStatus);

              if (shouldHide) return null;

              return (
                <option
                  key={key}
                  value={key}
                  disabled={
                    key === "cancelled" && currentStatus !== "requestedCancel"
                  }
                >
                  {label}
                </option>
              );
            })}
          </select>
        );
      },
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <h2>Danh sách đơn hàng</h2>
      {loading && <p>Đang tải...</p>}

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={isModalOpen}
        onOk={handleConfirmChange}
        onCancel={() => setIsModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          Bạn có chắc muốn cập nhật trạng thái đơn hàng{" "}
          <strong>{selectedOrder?._id}</strong> thành{" "}
          <strong>{statusLabels[newStatus]}</strong>?
        </p>
        {newStatus === "cancelled" && (
          <p style={{ color: "red" }}>
            ** Lưu ý: Bạn đang yêu cầu hủy đơn hàng.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default OrderManage;
