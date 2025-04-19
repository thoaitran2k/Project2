import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Form,
  Tag,
  Modal,
  InputNumber,
  DatePicker,
  Switch,
} from "antd";
import styled from "styled-components";
import dayjs from "dayjs";
import axios from "axios";

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 24px;
  height: calc(100vh - 200px); /* Điều chỉnh theo nhu cầu */
  display: flex;
  flex-direction: column;
`;

const StyledTable = styled(Table)`
  flex: 1;
  overflow: auto;

  .ant-table-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .ant-table-body {
    flex: 1;
    overflow: auto !important;
  }
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) => (props.active ? "#ecfdf5" : "#fef2f2")};
  color: ${(props) => (props.active ? "#059669" : "#dc2626")};
  border: 1px solid ${(props) => (props.active ? "#a7f3d0" : "#fecaca")};
`;

const ActionButton = styled(Button)`
  padding: 0;
  height: auto;
  line-height: 1;
`;

const PromotionTable = ({ refreshKey }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editingPromo, setEditingPromo] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, [refreshKey]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3002/api/product/promotion/list"
      );
      setPromotions(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingPromo(record);
    editForm.setFieldsValue({
      discountValue: record.discountValue,
      maxUsage: record.maxUsage,
      expiredAt: dayjs(record.expiredAt),
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "Mã Giảm Giá",
      dataIndex: "code",
      key: "code",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại Giảm Giá",
      align: "center",
      dataIndex: "discountType",
      key: "discountType",
      render: (text) => (
        <Tag color={text === "percent" ? "blue" : "green"}>
          {text === "percent" ? "Giảm theo %" : "Giảm cố định"}
        </Tag>
      ),
    },
    {
      title: "Giá trị Giảm",
      align: "center",
      key: "discountValue",
      render: (_, record) => (
        <span>
          {record.discountType === "percent"
            ? `${record.discountValue}%`
            : `${record.discountValue.toLocaleString()}₫`}
          {record.maxDiscount && record.discountType === "percent" && (
            <div style={{ fontSize: 12, color: "#888" }}>
              (Tối đa: {record.maxDiscount.toLocaleString()}₫)
            </div>
          )}
        </span>
      ),
    },
    {
      title: "Số lần sử dụng",
      key: "usage",
      align: "center",
      render: (_, record) => (
        <span>
          {record.usedCount || 0}/{record.maxUsage || "∞"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      align: "center",
      key: "status",
      render: (_, record) => {
        const now = new Date();
        const start = new Date(record.startAt);
        const end = new Date(record.expiredAt);
        const isExpired = now > end;
        const isValid = record.isActive && now >= start && now <= end;

        let statusText = "Không hoạt động";
        if (isExpired) statusText = "Hết hạn";
        else if (isValid) statusText = "Đang hoạt động";

        return (
          <StatusTag active={isValid && !isExpired}>{statusText}</StatusTag>
        );
      },
    },
    {
      title: "Thời gian hiệu lực",
      align: "center",
      key: "validity",
      render: (_, record) => (
        <div>
          <div>Từ: {new Date(record.startAt).toLocaleDateString()}</div>
          <div>Đến: {new Date(record.expiredAt).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      title: "Thao Tác",
      align: "center",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <ActionButton type="link" onClick={() => handleEdit(record)}>
            Chỉnh sửa
          </ActionButton>
          <ActionButton
            type="link"
            danger
            onClick={() => handleDelete(record)}
            disabled={record.usedCount > 0}
          >
            Xóa
          </ActionButton>
        </Space>
      ),
    },
  ];

  return (
    <TableContainer>
      <StyledTable
        columns={columns}
        dataSource={promotions}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          position: ["bottomRight"],
        }}
        //scroll={{ x: true }}
      />

      <Modal
        title={`Chỉnh sửa mã: ${editingPromo?.code}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => {
          editForm
            .validateFields()
            .then(async (values) => {
              try {
                await axios.put(
                  `http://localhost:3002/api/product/update-promotion/${editingPromo._id}`,
                  {
                    ...values,
                    expiredAt: values.expiredAt.toISOString(),
                  }
                );
                message.success("Cập nhật thành công");
                fetchPromotions();
                setIsModalVisible(false);
              } catch (err) {
                message.error("Lỗi khi cập nhật");
              }
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={editForm}>
          <Form.Item
            label="Giá trị giảm"
            name="discountValue"
            rules={[{ required: true, message: "Nhập giá trị giảm" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Số lần dùng tối đa" name="maxUsage">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Ngày hết hạn"
            name="expiredAt"
            rules={[{ required: true, message: "Chọn ngày hết hạn" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </TableContainer>
  );
};

export default PromotionTable;
