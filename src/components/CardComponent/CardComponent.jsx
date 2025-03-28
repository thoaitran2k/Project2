import React, { useState, useEffect } from "react";

import { Card, Spin } from "antd";
import styled from "styled-components";
// import { CardNameProduct } from "./style";
import { StarFilled } from "@ant-design/icons";

import { Link } from "react-router-dom";

import Loading from "../LoadingComponent/Loading";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";

const columns = 4;

const StarRating = ({ rating }) => {
  const stars = Array(5).fill(0); // Tạo mảng 5 ngôi sao trống
  const fullStars = Math.floor(rating); // Số sao đầy
  const decimalPart = rating - fullStars; // Phần lẻ của sao cuối cùng

  let partialStarWidth = 0;
  if (decimalPart >= 0.9) partialStarWidth = 80; // 4/5 sao
  else if (decimalPart >= 0.75) partialStarWidth = 75; // 3/4 sao
  else if (decimalPart >= 0.5) partialStarWidth = 50; // 1/2 sao
  else if (decimalPart >= 0.25) partialStarWidth = 25; // 1/4 sao

  return (
    <div style={{ display: "flex", color: "#FFD700" }}>
      {stars.map((_, i) => (
        <span key={i} style={{ position: "relative", display: "inline-block" }}>
          <StarFilled style={{ color: "#D3D3D3" }} /> {/* Sao trống */}
          {i < fullStars ? ( // Nếu là sao đầy
            <StarFilled style={{ position: "absolute", top: 0, left: 0 }} />
          ) : i === fullStars && decimalPart > 0 ? ( // Nếu là sao lẻ
            <StarFilled
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${partialStarWidth}%`, // Tô màu theo phần lẻ
                overflow: "hidden",
              }}
            />
          ) : null}
        </span>
      ))}
    </div>
  );
};

const { Meta } = Card;
const CardComponent = ({ products, totalProducts }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);

  const createSlug = (name, id) => {
    return (
      name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
        .replace(/Đ/g, "D") // Chuyển Đ → D
        .replace(/đ/g, "d") // Chuyển đ → d
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-") + `-${id}`
    );
  };
  const columns = 4;

  const handleClick = () => {
    dispatch(setLoading(true));
    setTimeout(() => {
      dispatch(setLoading(false));
    }, 1000);
  };

  return (
    <>
      <WrapperCardProduct onClick={handleClick}>
        {products.length === 0 ? (
          <p>Đang tải...</p>
        ) : (
          products.map((product, index) => (
            <StyledLink
              to={`/product-details/${createSlug(product.name, product._id)}`}
              key={product._id}
            >
              <ProductCard index={index} columns={columns}>
                <img src={product.image} alt={product.name} />

                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <RatingRow>
                    <StarRating rating={product.rating ?? 0} />
                    <SoldText>
                      |{" "}
                      <span style={{ color: "rgb(54, 50, 50)" }}>Đã bán </span>
                      {product.selled}
                    </SoldText>
                  </RatingRow>
                  <ProductPrice>
                    {product.price.toLocaleString("vi-VN")}₫
                    <Discount> - {product.discount || 5}%</Discount>
                  </ProductPrice>
                </ProductInfo>
              </ProductCard>
            </StyledLink>
          ))
        )}
      </WrapperCardProduct>
    </>
  );
};

const WrapperCardProduct = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  //gap: 10px;
  width: 100%;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const ProductCard = styled.div`
  background: ${({ index, columns, $loading }) =>
    $loading
      ? "rgba(0,0,0,0.05)"
      : (Math.floor(index / columns) + index) % 2 === 0
      ? "linear-gradient(to bottom, #D0CECE, #EAE9E9)"
      : "linear-gradient(to bottom, #EAE9E9, #D0CECE)"};
  opacity: ${({ $loading }) => ($loading ? 0.5 : 1)};
  transition: opacity 0.3s ease;

  // Các style khác giữ nguyên
  padding: 15px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 450px;
  justify-content: space-between;

  img {
    width: 100%;
    height: 260px;
    object-fit: cover;
    border-radius: 5px;
    background: transparent;
  }
`;

const ProductInfo = styled.div`
  width: 100%; /* Đảm bảo chiếm toàn bộ chiều rộng */
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start; /* Căn trái nội dung */
  padding: 10px 0;
`;

const ProductName = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: left;
  width: 100%;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: flex-start;
  width: 100%;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  color: #ff4259;
  font-weight: bold;
  text-align: left;
  width: 100%;
`;

const SoldText = styled.span`
  font-size: 14px;
  color: gray;
`;

const Discount = styled.span`
  font-size: 14px;
  color: #ff4259;
  margin-left: 5px;
`;

export default CardComponent;
