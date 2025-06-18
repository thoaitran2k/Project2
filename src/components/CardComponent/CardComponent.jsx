import React, { useState, useEffect } from "react";
import { Card, Spin, Tooltip } from "antd";
import styled from "styled-components";
import { StarFilled, HeartOutlined, HeartFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import { useSearch } from "../Layout/SearchContext";

const StarRating = ({ rating }) => {
  const stars = Array(5).fill(0);
  const fullStars = Math.floor(rating);
  const decimalPart = rating - fullStars;

  return (
    <div style={{ display: "flex", color: "#FFD700" }}>
      {stars.map((_, i) => (
        <span key={i} style={{ position: "relative", display: "inline-block" }}>
          <StarFilled style={{ color: "#D3D3D3" }} />
          {i < fullStars ? (
            <StarFilled style={{ position: "absolute", top: 0, left: 0 }} />
          ) : i === fullStars && decimalPart > 0 ? (
            <StarFilled
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${decimalPart * 100}%`,
                overflow: "hidden",
              }}
            />
          ) : null}
        </span>
      ))}
    </div>
  );
};

const CardComponent = ({ products, totalProducts }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);
  const [localLoading, setLocalLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState([]);
  const { isSearchOpen, toggleSearch } = useSearch();

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

  const handleLike = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleClick = () => {
    dispatch(setLoading(true));
    setTimeout(() => dispatch(setLoading(false)), 1000);
    if (isSearchOpen) toggleSearch();
  };

  useEffect(() => {
    setLocalLoading(true);
    const timeout = setTimeout(() => setLocalLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [products]);

  return (
    <ProductsGrid>
      {localLoading ? (
        <LoadingContainer>
          <Spin size="large" />
        </LoadingContainer>
      ) : products.length === 0 ? (
        <EmptyState>
          <img src="/empty-state.png" alt="No products" />
          <p>Không tìm thấy sản phẩm phù hợp</p>
        </EmptyState>
      ) : (
        products.map((product) => (
          <StyledLink
            to={`/product-details/${createSlug(product.name, product._id)}`}
            key={product._id}
            onClick={handleClick}
          >
            <ProductCard>
              <ProductImageContainer>
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                />
                {product.discount > 0 && (
                  <DiscountBadge>-{product.discount}%</DiscountBadge>
                )}
              </ProductImageContainer>

              <ProductInfo>
                <Tooltip title={product.name} placement="top">
                  <ProductName>{product.name}</ProductName>
                </Tooltip>

                <RatingContainer>
                  <StarRating rating={product.rating ?? 0} />
                  <RatingText>{product.rating?.toFixed(1) || "0.0"}</RatingText>
                  <SoldText>| Đã bán {product.selled || 0}</SoldText>
                </RatingContainer>

                <PriceContainer>
                  {product.discount > 0 ? (
                    <>
                      <CurrentPrice>
                        {Math.round(
                          (product.price * (100 - product.discount)) / 100
                        ).toLocaleString()}
                        ₫
                      </CurrentPrice>
                      <OriginalPrice>
                        {product.price.toLocaleString()}₫
                      </OriginalPrice>
                    </>
                  ) : (
                    <CurrentPrice>
                      {product.price.toLocaleString()}₫
                    </CurrentPrice>
                  )}
                </PriceContainer>
              </ProductInfo>
            </ProductCard>
          </StyledLink>
        ))
      )}
    </ProductsGrid>
  );
};

// Styled Components
const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
  padding: 0 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 0;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;

  img {
    width: 120px;
    opacity: 0.7;
  }

  p {
    font-size: 16px;
    color: #666;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #e0e0e0;
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f8f9fa;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${ProductCard}:hover & {
    transform: scale(1.03);
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: red;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1;
  letter-spacing: 0.5px;
`;

const ProductInfo = styled.div`
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  background: white;
`;

const ProductName = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #343a40;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 44px;
  line-height: 1.4;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
`;

const RatingText = styled.span`
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
`;

const SoldText = styled.span`
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
`;

const CurrentPrice = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: #212529;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: #adb5bd;
  text-decoration: line-through;
`;

export default CardComponent;
