import React, { useState } from "react";
import styled from "styled-components";
import { Card, Row, Col, Typography } from "antd";
import { Link } from "react-router-dom";
import SliderComponent from "../../components/SliderComponent/SliderComponent";

import slider1 from "../../assets/slider1.png";
import slider2 from "../../assets/slider2.png";
import slider3 from "../../assets/slider3.png";
import bagBanner from "../../assets/bagBanner.jpg";
import watchBanner from "../../assets/watchBanner.jpg";

import { useQuery } from "@tanstack/react-query";

const { Title } = Typography;

const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

export default function Home() {
  const [collections] = useState([
    { category: "Áo nam", image: "/src/assets/aonamCol.png" },
    { category: "Quần nam", image: "/src/assets/quannamCol.png" },
    { category: "Đồng hồ", image: "/src/assets/watchCol.png" },
    { category: "Áo nữ", image: "/src/assets/aonuCol.png" },
    { category: "Quần nữ", image: "/src/assets/quannuCol.png" },
    { category: "Túi xách", image: "/src/assets/bagCol.png" },
    { category: "Trang sức", image: "/src/assets/trangsucCol.png" },
    { category: "Ví", image: "/src/assets/vi.png" },
  ]);

  return (
    <Container>
      <BannerLink to="/some-link">
        <BannerImage src={bagBanner} alt="Banner" />
      </BannerLink>
      <div style={{ maxWidth: "1400px", padding: "20px" }}>
        <SliderComponent arrImages={[slider1, slider2, slider3]} />

        <Title level={3} style={{ textAlign: "center", marginTop: "20px" }}>
          Khách hàng luôn là ưu tiên của chúng tôi
          <br /> Hãy lựa chọn theo phong cách của bạn!
        </Title>
        <Row gutter={[16, 16]} justify="center">
          {collections.map((collection, index) => (
            <Col key={index} xs={12} sm={12} md={8} lg={6} xl={6}>
              <StyledLink
                to={`/product-type/${removeVietnameseTones(
                  collection.category
                )}`}
              >
                <StyledCard
                  hoverable
                  cover={
                    <ProductImage
                      src={collection.image}
                      alt={collection.category}
                    />
                  }
                >
                  <CardTitleContainer>
                    <StyledCardTitle>{collection.category}</StyledCardTitle>
                  </CardTitleContainer>
                </StyledCard>
              </StyledLink>
            </Col>
          ))}
        </Row>
      </div>

      <BannerLink to="/some-link">
        <BannerImage src={watchBanner} alt="Banner" />
      </BannerLink>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;
const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 450px;
  background: linear-gradient(to right, white, rgb(236, 223, 236));
  border-radius: 10px;
  color: white;
  padding: 10px;
`;
const ProductImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  align-self: center;
`;
const CardTitleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 50px; /* Đảm bảo chiều cao cho container tiêu đề */
  margin-top: 10px;
`;

const StyledCardTitle = styled.div`
  font-size: 26px;
  font-weight: 300;
  color: #333;
  text-align: center;
`;

const BannerLink = styled(Link)`
  width: 100%;
  // margin-top: 20px;
  text-decoration: none;
`;

const BannerImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;
