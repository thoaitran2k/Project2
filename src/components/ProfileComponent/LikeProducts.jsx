import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spin, Button, Row, Col } from "antd";
import { HeartFilled } from "@ant-design/icons";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Hàm tạo slug
const createSlug = (name, id) => {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-") + `-${id}`
  );
};

const LikeProducts = () => {
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "http://localhost:3002/api/like/get-liked-products",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const products = response.data.map((item) => item.product);
        setLikedProducts(products);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProducts();
  }, []);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 8, likedProducts.length));
  };

  const handleProductClick = (product) => {
    navigate(`/product-details/${createSlug(product.name, product._id)}`);
  };

  return (
    <Container>
      {loading ? (
        <Spin size="large" />
      ) : likedProducts.length === 0 ? (
        <EmptyMessage>
          Hãy <HeartIcon /> cho sản phẩm bạn yêu thích!
        </EmptyMessage>
      ) : (
        <>
          <ProductsGrid gutter={[10, 10]}>
            {likedProducts.slice(0, visibleCount).map((product) => (
              <Col key={product._id} xs={12} sm={8} md={6} lg={6}>
                <ProductCard
                  onClick={() => handleProductClick(product)}
                  hoverable
                >
                  <ProductImage src={product.image} alt={product.name} />
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice>
                      {product.price.toLocaleString()}₫
                    </ProductPrice>
                  </ProductInfo>
                </ProductCard>
              </Col>
            ))}
          </ProductsGrid>

          {visibleCount < likedProducts.length && (
            <LoadMoreWrapper>
              <Button type="primary" onClick={loadMore}>
                Xem thêm
              </Button>
            </LoadMoreWrapper>
          )}
        </>
      )}
    </Container>
  );
};

// Các styled components giữ nguyên như trước
const Container = styled.div`
  padding: 24px;
`;

const ProductsGrid = styled(Row)`
  margin-bottom: 20px;
`;

const ProductCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  height: 100%;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductPrice = styled.div`
  color: #ff424e;
  font-weight: bold;
`;

const LoadMoreWrapper = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const EmptyMessage = styled.p`
  text-align: center;
  font-size: 16px;
`;

const HeartIcon = styled(HeartFilled)`
  color: #ff4d4f;
  margin: 0 4px;
`;

export default LikeProducts;
