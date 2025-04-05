import React, { useState, useEffect } from "react";
import { Table, Button, message, Space, Tag } from "antd";
import styled from "styled-components";
import axios from "axios";

// Styled Components
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const StatusTag = styled(Tag)`
  margin-right: 0;
`;

const PromotionTable = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

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

  const columns = [
    {
      title: "Mã Giảm Giá",
      dataIndex: "code",
      key: "code",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại Giảm Giá",
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
      render: (_, record) => (
        <span>
          {record.usedCount || 0}/{record.maxUsage || "∞"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const now = new Date();
        const start = new Date(record.startAt);
        const end = new Date(record.expiredAt);
        const isValid = record.isActive && now >= start && now <= end;

        return (
          <StatusTag color={isValid ? "green" : "red"}>
            {isValid ? "Đang hoạt động" : "Không hoạt động"}
          </StatusTag>
        );
      },
    },
    {
      title: "Thời gian hiệu lực",
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
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            Chỉnh sửa
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record)}
            disabled={record.usedCount > 0}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    console.log("Edit promotion", record);
    // Implement edit functionality here
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(
        `http://localhost:3002/api/product/promotion/${record._id}`
      );
      message.success("Xóa mã giảm giá thành công");
      fetchPromotions();
    } catch (error) {
      message.error("Xóa mã giảm giá thất bại");
    }
  };

  return (
    <Container>
      <Title>Danh Sách Mã Giảm Giá</Title>
      <Table
        columns={columns}
        dataSource={promotions}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
    </Container>
  );
};

export default PromotionTable;
