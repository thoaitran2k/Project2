import React, { useEffect, useRef } from "react";
import { Card, Rate, Button, Space, Typography, Carousel } from "antd";
import {
  HeartOutlined,
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { getAllProduct } from "../../redux/slices/productSlice";

import { useDispatch, useSelector } from "react-redux";

const { Text, Title } = Typography;

const ProductCard = ({ product }) => {
  return (
    <Card
      hoverable
      style={{ width: 320, margin: "10px", background: "transparent" }}
      cover={<img alt={product.name} src={product.image} />}
    >
      <Title level={5}>{product.name}</Title>
      <Rate disabled defaultValue={product.rating} />
      <Text type="secondary">({product.reviews} reviews)</Text>
      <div style={{ marginTop: "10px" }}>
        {product.oldPrice && (
          <Text delete style={{ marginRight: "10px" }}>
            {product.oldPrice}
          </Text>
        )}
        <Text strong>{product.price.toLocaleString("vi-VN")} VNĐ</Text>
      </div>
      {product.discount && (
        <Text type="danger" style={{ display: "block", marginTop: "5px" }}>
          {product.discount}
        </Text>
      )}
      {product.prime && (
        <Text type="success" style={{ display: "block", marginTop: "5px" }}>
          ✔ Prime
        </Text>
      )}
      <Space style={{ marginTop: "10px" }}>
        <Button icon={<ShoppingCartOutlined />}>Thêm vào giỏ hàng</Button>
        <Button icon={<HeartOutlined />}>Thích</Button>
      </Space>
    </Card>
  );
};

const ProductList = () => {
  const carouselRef = useRef(null);
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getAllProduct());
  }, [dispatch]);

  const handlePrev = () => {
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    carouselRef.current?.next();
  };

  // Thêm kiểm tra products và products.data
  if (!products || !products.data || products.data.length === 0) {
    return <div style={{ padding: "20px" }}>Không có sản phẩm tương tự</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        position: "relative",
        borderTop: "solid 2px rgb(131, 127, 127)",
        borderBottom: "solid 2px rgb(131, 127, 127)",
        margin: "50px 0",
      }}
    >
      <Title level={4}>Sản phẩm tương tự</Title>

      <Button
        shape="circle"
        icon={<LeftOutlined />}
        style={{
          position: "absolute",
          left: "-20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1,
        }}
        onClick={handlePrev}
      />

      <Carousel
        ref={carouselRef}
        dots={false}
        slidesToShow={Math.min(4, products.data.length)}
        slidesToScroll={1}
        infinite={products.data.length > 4}
      >
        {products.data.map((product) => (
          <div key={product._id}>
            {" "}
            {/* Sử dụng product._id thay vì product.id */}
            <ProductCard product={product} />
          </div>
        ))}
      </Carousel>

      <Button
        shape="circle"
        icon={<RightOutlined />}
        style={{
          position: "absolute",
          right: "-20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1,
        }}
        onClick={handleNext}
      />
    </div>
  );
};

export default ProductList;
