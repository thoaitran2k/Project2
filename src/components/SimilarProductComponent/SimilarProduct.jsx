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

// const products = [
//   {
//     id: 1,
//     name: "Michael Kors Jet Set Charm Small Phone Crossbody Bag",
//     price: "$158.00",
//     rating: 4.5,
//     reviews: 182,
//     image: "https://via.placeholder.com/150",
//     prime: true,
//   },
//   {
//     id: 2,
//     name: "DOMAT Crossbody Bag for Women, Chic Lightweight Purse",
//     price: "$27.90",
//     rating: 4.7,
//     reviews: 263,
//     image: "https://via.placeholder.com/150",
//     prime: true,
//   },
//   {
//     id: 3,
//     name: "Michael Kors Jet Set Double Zip Wristlet, Black",
//     price: "$103.82",
//     oldPrice: "$120.00",
//     rating: 4.8,
//     reviews: 570,
//     image: "https://via.placeholder.com/150",
//     prime: true,
//   },
//   {
//     id: 4,
//     name: "The Sak Los Feliz Crossbody Bag in Leather",
//     price: "$149.00",
//     oldPrice: "$179.00",
//     discount: "-17%",
//     rating: 4.6,
//     reviews: 164,
//     image: "https://via.placeholder.com/150",
//     prime: true,
//   },
//   {
//     id: 5,
//     name: "Fossil Women's Taryn Leather Crossbody Purse",
//     price: "$117.00",
//     oldPrice: "$195.00",
//     discount: "-40%",
//     rating: 4.4,
//     reviews: 72,
//     image: "https://via.placeholder.com/150",
//     prime: true,
//   },
// ];

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

  console.log("SIMILAR PRODUCT", products);

  const handlePrev = () => {
    carouselRef.current.prev();
  };

  const handleNext = () => {
    carouselRef.current.next();
  };

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

      {/* Nút điều hướng trái */}
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

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        dots={false}
        slidesToShow={4}
        slidesToScroll={1}
        infinite
      >
        {products?.data.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </Carousel>

      {/* Nút điều hướng phải */}
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
