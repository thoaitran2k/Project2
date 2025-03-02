import React, { useState } from "react";
import styled from "styled-components";
import { Card, Row, Col, Typography } from "antd";
import { Link } from "react-router-dom";
import SliderComponent from "../../components/SliderComponent/SliderComponent";

import slider1 from "../../assets/slider1.png";
import slider2 from "../../assets/slider2.png";
import slider3 from "../../assets/slider3.png";

const { Title } = Typography;

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
      <SliderComponent arrImages={[slider1, slider2, slider3]} />

      <Title level={2} style={{ textAlign: "center", marginTop: "20px" }}>
        Khách hàng luôn là ưu tiên của chúng tôi
        <br /> Hãy lựa chọn theo sở thích của bạn!
      </Title>

      <Row gutter={[16, 16]} justify="center">
        {collections.map((collection, index) => (
          <Col key={index} xs={12} sm={12} md={8} lg={6} xl={6}>
            <StyledLink to="/search" state={{ category: collection.category }}>
              <StyledCard
                hoverable
                cover={
                  <ProductImage
                    src={collection.image}
                    alt={collection.category}
                  />
                }
              >
                <CardTitle>{collection.category}</CardTitle>
              </StyledCard>
            </StyledLink>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
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
  justify-content: space-between;
  border-radius: 10px;
  color: white;
  transition: 0.3s;
  padding: 10px;
  &:hover {
    transform: scale(1.05);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const CardTitle = styled(Title)`
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  color: black;
`;
