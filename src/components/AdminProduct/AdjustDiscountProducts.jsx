import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  InputNumber,
  Button,
  message,
  Card,
  Typography,
  Space,
} from "antd";
import { getAllProduct } from "../../redux/slices/productSlice";
import axios from "axios";

const { Title } = Typography;

const AdjustDiscountProducts = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [tempDiscount, setTempDiscount] = useState(null);

  useEffect(() => {
    dispatch(getAllProduct());
  }, [dispatch]);

  useEffect(() => {
    if (products?.data?.length > 0) {
      processProductData(products.data);
    }
  }, [products]);

  const processProductData = (products) => {
    const grouped = products.reduce((acc, product) => {
      const { type, countInStock, selled, discount } = product;

      if (!type) return acc;

      if (!acc[type]) {
        acc[type] = {
          key: type,
          name: type,
          countInStock: 0,
          selled: 0,
          discount: discount || 0,
          productCount: 0,
        };
      }

      acc[type].countInStock += countInStock || 0;
      acc[type].selled += selled || 0;
      acc[type].productCount += 1;

      return acc;
    }, {});

    setData(Object.values(grouped));
  };

  const handleEdit = (record) => {
    setEditingKey(record.key);
    setTempDiscount(record.discount);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setTempDiscount(null);
  };

  const handleSave = async (record) => {
    try {
      setLoading(true);
      const response = await axios.put(
        "http://localhost:3002/api/product/update-discount-by-type",
        {
          productType: record.name,
          discount: tempDiscount,
        }
      );

      if (response.data.success) {
        message.success(response.data.message);

        setData((prev) =>
          prev.map((item) =>
            item.key === record.key ? { ...item, discount: tempDiscount } : item
          )
        );

        handleCancel();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Số sản phẩm",
      dataIndex: "productCount",
      key: "productCount",
    },
    {
      title: "Tồn kho",
      dataIndex: "countInStock",
      key: "countInStock",
    },
    {
      title: "Đã bán",
      dataIndex: "selled",
      key: "selled",
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "discount",
      key: "discount",
      render: (_, record) => {
        if (editingKey === record.key) {
          return (
            <InputNumber
              min={0}
              max={100}
              value={tempDiscount}
              onChange={(value) => setTempDiscount(value)}
              formatter={(value) => `${value}%`}
              parser={(value) => value.replace("%", "")}
              style={{ width: "100px" }}
            />
          );
        }

        return <span>{record.discount}%</span>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const isEditing = editingKey === record.key;

        return isEditing ? (
          <Space>
            <Button
              type="primary"
              onClick={() => handleSave(record)}
              loading={loading}
            >
              Lưu
            </Button>
            <Button onClick={handleCancel}>Hủy</Button>
          </Space>
        ) : (
          <Button onClick={() => handleEdit(record)}>Chỉnh sửa</Button>
        );
      },
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginBottom: 24 }}>
        ĐIỀU CHỈNH GIẢM GIÁ THEO LOẠI SẢN PHẨM
      </Title>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="key"
        bordered
      />
    </Card>
  );
};

export default AdjustDiscountProducts;
