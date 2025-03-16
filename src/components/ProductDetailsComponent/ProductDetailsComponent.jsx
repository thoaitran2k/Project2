import { Row, Col, Image, Breadcrumb } from "antd";
import React, { useState } from "react";
import imageProduct from "../../assets/aonam.jpg";
import imageSmallProduct from "../../assets/vi.jpg";
import { PlusOutlined, StarFilled, MinusOutlined } from "@ant-design/icons";
import {
  WrapperStyleImageSmall,
  WrapperStyleImage,
  WrapperStyleNameProduct,
  WrapperStyleTextSell,
  WrapperStylePriceProduct,
  WrapperStylePriceTextProduct,
  WrapperAdressProduct,
  WrapperQualityProduct,
  StyledButton,
  StyledImagePreview,
} from "./style";

const ProductDetailsComponent = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, 10));
  const decreaseQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const rating = product.rating; // Giả sử rating là một số từ 0 đến 5
  const fullStars = Math.floor(rating); // Số sao đầy
  const partialStar = rating - fullStars; // Phần sao chưa đầy

  const getPartialStarWidth = (partialStar) => {
    if (partialStar >= 0.75) return 100; // >= 75% -> 100%
    if (partialStar >= 0.5) return 50; // >= 50% -> 50%
    if (partialStar >= 0.25) return 25; // >= 25% -> 25%
    return 0; // < 25% -> 0%
  };

  const partialStarWidth = getPartialStarWidth(partialStar);

  return (
    <Row style={{ padding: "16px", background: "white" }}>
      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
        <StyledImagePreview
          className="custom-image-preview"
          style={{ width: "100%", maxWidth: "400px" }}
          src={product?.image || imageProduct}
          alt="image product"
          preview={true}
        />
        <Row
          style={{
            borderTop: "3px solid #ccc",
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "row",
            background: "#ccc",
            marginTop: "16px",
          }}
        >
          {[...Array(6)].map((_, index) => (
            <WrapperStyleImage key={index} xs={4} sm={4} md={4} lg={4} xl={4}>
              <WrapperStyleImageSmall
                src={product?.image || imageSmallProduct}
                alt="image small product"
                preview={true}
              />
            </WrapperStyleImage>
          ))}
        </Row>
      </Col>

      <Col xs={24} sm={24} md={14} lg={14} xl={14} style={{ padding: "16px" }}>
        <WrapperStyleNameProduct>{product?.name}</WrapperStyleNameProduct>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              lineHeight: "16px",
            }}
          >
            {/* Hiển thị các sao đầy */}
            {[...Array(fullStars)].map((_, index) => (
              <StarFilled
                key={index}
                style={{
                  fontSize: "16px",
                  color: "rgb(253,216,54)",
                  verticalAlign: "middle",
                }}
              />
            ))}

            {/* Hiển thị phần sao chưa đầy */}
            {partialStar > 0 && (
              <div
                style={{
                  position: "relative",
                  width: "16px",
                  height: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  verticalAlign: "middle",
                }}
              >
                {/* Sao nền (màu xám) */}
                <StarFilled
                  style={{
                    fontSize: "16px",
                    color: "#ccc",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                {/* Sao vàng (phần được tô) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${partialStarWidth}%`,
                    overflow: "hidden",
                  }}
                >
                  <StarFilled
                    style={{
                      fontSize: "16px",
                      color: "rgb(253,216,54)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Hiển thị các sao trống */}
            {[...Array(5 - fullStars - (partialStar > 0 ? 1 : 0))].map(
              (_, index) => (
                <StarFilled
                  key={index}
                  style={{
                    fontSize: "16px",
                    color: "#ccc",
                    verticalAlign: "middle",
                  }}
                />
              )
            )}
          </div>
          <WrapperStyleTextSell> | Đã bán 1000+</WrapperStyleTextSell>
        </div>

        <WrapperStylePriceProduct>
          <WrapperStylePriceTextProduct>
            {product?.price.toLocaleString("vi-VN")} VNĐ
          </WrapperStylePriceTextProduct>
        </WrapperStylePriceProduct>

        <WrapperAdressProduct>
          <span>Giao đến </span>
          <span className="address">
            KP6, P. Linh Trung, TP Thủ Đức, TP.HCM
          </span>{" "}
          -<span className="change-address"> Đổi địa chỉ</span>
        </WrapperAdressProduct>

        <WrapperQualityProduct>
          <div
            style={{
              fontWeight: "300",
              fontSize: "25px",
            }}
          >
            Số lượng
          </div>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              flexDirection: "row",
              border: "1px solid #ccc",
              alignItems: "center",
              padding: "5px",
              borderRadius: "7px",
              margin: "30px 20px",
            }}
          >
            <MinusOutlined
              onClick={decreaseQuantity}
              style={{
                fontSize: "16px",
                padding: "5px",
                cursor: "pointer",
                userSelect: "none",
              }}
            />
            <span
              style={{
                width: "40px",
                height: "20px",
                textAlign: "center",
                border: "none",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {quantity}
            </span>
            <PlusOutlined
              onClick={increaseQuantity}
              style={{
                fontSize: "16px",
                padding: "5px",
                cursor: "pointer",
                userSelect: "none",
              }}
            />
          </div>
        </WrapperQualityProduct>
        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          <StyledButton primary textButton="Chọn mua" />
          <StyledButton textButton="Mua trả sau" />
        </div>
      </Col>
    </Row>
  );
};

export default ProductDetailsComponent;
