import React, { useEffect, useRef } from "react";
import { Card, Rate, Button, Space, Typography, Carousel } from "antd";
import { CarouselStyled } from "./style";
import {
  HeartOutlined,
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { getAllProduct } from "../../redux/slices/productSlice";

import { useDispatch, useSelector } from "react-redux";

const { Text, Title } = Typography;

const ProductCard = ({ productSimilar }) => {
  return (
    <Card
      hoverable
      style={{ width: 320, margin: "10px", background: "transparent" }}
      cover={<img alt={productSimilar.name} src={productSimilar.image} />}
    >
      <Title level={5}>{productSimilar.name}</Title>
      <Rate disabled defaultValue={productSimilar.rating} />
      <Text type="secondary">({productSimilar.reviews} reviews)</Text>
      <div style={{ marginTop: "10px" }}>
        {productSimilar.oldPrice && (
          <Text delete style={{ marginRight: "10px" }}>
            {productSimilar.oldPrice}
          </Text>
        )}
        <Text strong>{productSimilar.price.toLocaleString("vi-VN")} VNĐ</Text>
      </div>
      {productSimilar.discount && (
        <Text type="danger" style={{ display: "block", marginTop: "5px" }}>
          {productSimilar.discount}
        </Text>
      )}
      {productSimilar.prime && (
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

const ProductList = ({ productType }) => {
  const carouselRef = useRef(null);
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.product);

  const handlePrev = () => {
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    carouselRef.current?.next();
  };

  // Thêm kiểm tra products và products.data
  if (!products || products.length === 0) {
    return <div style={{ padding: "20px" }}>Không có sản phẩm tương tự</div>;
  }

  const productSimilars = products.filter(
    (product) => product.type === productType
  );

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

      <CarouselStyled
        ref={carouselRef}
        dots={false}
        slidesToShow={Math.min(4, productSimilars?.length || 0)}
        slidesToScroll={1}
        infinite={productSimilars?.length > 4}
        arrows={productSimilars?.length >= 4} // Chỉ hiện mũi tên khi có đủ 4 sản phẩm
        variableWidth={true} // Tắt nếu bạn muốn các item có width bằng nhau
        // centerPadding="40px" // Khoảng cách padding khi center mode
        className="custom-carousel" // Thêm class riêng
      >
        {productSimilars?.map((productSimilar) => (
          <div
            key={productSimilar._id}
            className="carousel-item" // Thêm class cho item
          >
            <ProductCard productSimilar={productSimilar} />
          </div>
        ))}
      </CarouselStyled>

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
