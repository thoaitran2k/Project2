import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, InputNumber, Button, message, Card, Typography } from "antd";
import { getAllProduct } from "../../redux/slices/productSlice";
import axios from "axios";

const { Title } = Typography;

const AdjustDiscountProducts = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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

      // Lấy discount từ sản phẩm đầu tiên của loại (nếu chưa có)
      if (discount !== undefined && acc[type].discount === 0) {
        acc[type].discount = discount;
      }

      return acc;
    }, {});

    setData(Object.values(grouped));
  };

  const handleDiscountChange = (value, recordKey) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === recordKey ? { ...item, discount: value } : item
      )
    );
  };

  const handleSave = async (record) => {
    try {
      setLoading(true);
      const response = await axios.put(
        "http://localhost:3002/api/product/update-discount-by-type",
        {
          productType: record.name,
          discount: record.discount,
        }
      );

      if (response.data.success) {
        message.success(response.data.message);
        // Refresh data sau khi cập nhật thành công
        dispatch(getAllProduct());
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
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount}
          onChange={(value) => handleDiscountChange(value, record.key)}
          formatter={(value) => `${value}%`}
          parser={(value) => value.replace("%", "")}
          style={{ width: "100px" }}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleSave(record)}
          loading={loading}
        >
          ÁP DỤNG
        </Button>
      ),
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
