import React, { useState, useEffect } from "react";

import { Card } from "antd";
import styled from "styled-components";
// import { CardNameProduct } from "./style";
import { StarFilled } from "@ant-design/icons";

import { Link } from "react-router-dom";
import SideBar from "../SideBar/SideBar";

import { WrapperButtonMore, WrapperButtonContainer } from "./style";

// import {
//   WrapperReportText,
//   WrapperPriceText,
//   WrapperDiscountText,
//   WrapperCardStyle,
// } from "./style";

// const mockProducts = [
//   {
//     id: 1,
//     name: "Túi Nano LV Biker",
//     price: "90.500.000₫",
//     image: "https://via.placeholder.com/450",
//     rating: 5,
//     category: "Túi xách",
//   },
//   {
//     id: 2,
//     name: "Túi Keepit",
//     price: "52.000.000₫",
//     image: "https://via.placeholder.com/450",
//     rating: 4,
//     category: "Túi xách",
//   },
//   {
//     id: 3,
//     name: "Túi Pochette Camille",
//     price: "40.500.000₫",
//     image: "https://via.placeholder.com/450",
//     rating: 4,
//     category: "Túi xách",
//   },
//   {
//     id: 4,
//     name: "Túi Low Key",
//     price: "68.500.000₫",
//     image: "https://via.placeholder.com/450",
//     rating: 5,
//     category: "Túi xách",
//   },
//   {
//     id: 4,
//     name: "Túi Low Key",
//     price: "68.500.000₫",
//     image: "https://via.placeholder.com/450",
//     rating: 5,
//     category: "Túi xách",
//   },
//   {
//     id: 4,
//     name: "Túi Low Key",
//     price: "68.500.000₫",
//     image: "https://via.placeholder.com/450",
//     rating: 5,
//     category: "Túi xách",
//   },
// ];
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
const CardComponent = ({ products }) => {
  return (
    <WrapperCardProduct>
      <ProductWrapper>
        {products.length === 0 ? (
          <p>Không có sản phẩm nào!</p>
        ) : (
          products.map((product) => (
            <StyledLink to={`/product/${product._id}`} key={product._id}>
              <ProductCard>
                <div>
                  <img src={product.image} alt={product.name} />
                  <div style={{ fontSize: "25px", marginTop: "100px" }}>
                    {product.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "22px" }}>
                    <div
                      style={{
                        padding: " 10px 0",
                        display: "flex",
                        flexDirection: "row",
                        // justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "13px" }}>
                        <StarRating rating={product.rating ?? 0} />
                      </span>

                      <span
                        style={{
                          fontSize: "17px",
                          color: "rgb(107, 101, 101)",
                          padding: "0 8px",
                        }}
                      >
                        {" "}
                        | Đã bán {product.selled}
                      </span>
                    </div>
                  </div>

                  <div style={{ color: "#FF4259", fontSize: "20px" }}>
                    {product.price.toLocaleString("vi-VN")}₫
                    <span style={{ fontSize: "20px", padding: "10px" }}>
                      - {product.discount || 5} %
                    </span>
                  </div>
                </div>
              </ProductCard>
            </StyledLink>
          ))
        )}
        <WrapperButtonContainer>
          <WrapperButtonMore type="default">Xem thêm</WrapperButtonMore>
        </WrapperButtonContainer>
      </ProductWrapper>
    </WrapperCardProduct>
  );
};

const WrapperCardProduct = styled.div`
  display: flex;
  justify-content: center; /* 🔥 Căn giữa toàn bộ sản phẩm */
  flex-wrap: wrap;
  gap: 20px;
  margin: 0 auto; /* 🔥 Đảm bảo căn giữa */
  max-width: 1300px; /* 🔥 Định nghĩa giới hạn chiều rộng để có 4 cột */
`;

const ProductWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* 🔥 Căn giữa sản phẩm theo hàng ngang */
  gap: 20px;
  margin: 0 auto;
  max-width: 100%;
  padding: 10px;
`;
const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #f5f5fa;
  border-radius: 10px;

  padding: 20px;
  width: 13vw; /* Giữ kích thước cố định */
  min-height: 500px;
  //text-align: center;

  img {
    width: 100%; /* Chiều rộng vẫn giữ nguyên */
    height: 250px; /* 🔥 Giảm chiều cao xuống */
    min-height: 250px; /* 🔥 Đảm bảo không nhỏ hơn mức này */
    object-fit: contain; /* 🔥 Giữ nguyên tỷ lệ ảnh, không bị mất nội dung */
    border-radius: 5px;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

export default CardComponent;
