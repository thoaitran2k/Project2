import { Row, Col, Image } from "antd";
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
} from "./style";

const ProductDetailsComponent = () => {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, 10));
  const decreaseQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  return (
    <Row style={{ padding: "16px", background: "white" }}>
      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
        <Image
          style={{ width: "100%", maxWidth: "400px" }}
          src={imageProduct}
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
                src={imageSmallProduct}
                alt="image small product"
                preview={true}
              />
            </WrapperStyleImage>
          ))}
        </Row>
      </Col>

      <Col xs={24} sm={24} md={14} lg={14} xl={14} style={{ padding: "16px" }}>
        <WrapperStyleNameProduct>
          Áo nam - Thương hiệu thời trang cao cấp - Được làm từ sợi bông mềm,
          dịu, co giãn
        </WrapperStyleNameProduct>

        <div>
          {[...Array(3)].map((_, index) => (
            <StarFilled
              key={index}
              style={{ fontSize: "12px", color: "rgb(253,216,54)" }}
            />
          ))}
          <WrapperStyleTextSell> | Đã bán 1000+</WrapperStyleTextSell>
        </div>

        <WrapperStylePriceProduct>
          <WrapperStylePriceTextProduct>
            200.000 VNĐ
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
