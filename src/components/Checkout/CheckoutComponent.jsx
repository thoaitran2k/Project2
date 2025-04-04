import React, { useState } from "react";
import styled from "styled-components";
import { Card, Radio, Button, Input, Typography, Divider, Tag } from "antd";
import {
  CreditCardOutlined,
  WalletOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  TagOutlined,
  RightOutlined,
} from "@ant-design/icons";

import cash from "../../assets/cash.png";
import momo from "../../assets/momoicon.jpg";
import zalopay from "../../assets/zalopayicon.png";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;

const CheckoutComponent = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");

  return (
    <CheckoutContainer>
      <LeftColumn>
        {/* Product Section */}
        <Section>
          <ProductItem>
            <ProductImage src="https://via.placeholder.com/60" alt="product" />
            <ProductInfo>
              <ProductName>Chuột không dây LOGITECH M331</ProductName>
              <div>SL: x2</div>
              <PriceText>
                <Text delete>319.800 ₫</Text>
                <br />
                <Text type="danger">312.620 ₫</Text>
              </PriceText>
            </ProductInfo>
          </ProductItem>
          <Divider style={{ margin: "12px 0" }} />

          {/* Promotion Section */}
          <div>
            <ArrowLink>
              <span>
                <TagOutlined /> Thêm mã khuyến mãi của Shop
              </span>
              <RightOutlined />
            </ArrowLink>
            <PromotionButtons>
              <PromotionButton type="primary" icon={<GiftOutlined />}>
                Giảm 3% tối đa
              </PromotionButton>
              <PromotionButton icon={<GiftOutlined />}>
                Giảm 50K
              </PromotionButton>
            </PromotionButtons>
            <Input placeholder="Nhập mã khuyến mãi khác" />
          </div>
        </Section>

        {/* Payment Method Section */}
        <Section>
          <SectionTitle>Chọn hình thức thanh toán</SectionTitle>
          <Radio.Group
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <PaymentOption
              value="cash"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={cash}
                  alt="Cash"
                  style={{ width: 20, height: 25, marginRight: 8 }}
                />
                Thanh toán tiền mặt
              </div>
            </PaymentOption>
            <PaymentOption
              value="viettel"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={zalopay}
                  alt="ZaloPay"
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                ZaloPay
              </div>
            </PaymentOption>
            <PaymentOption
              value="momo"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={momo}
                  alt="MoMo"
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                Ví MoMo
              </div>
            </PaymentOption>
          </Radio.Group>
        </Section>
      </LeftColumn>

      <RightColumn>
        {/* Shipping Section */}
        <Section>
          <SectionTitle>
            <EnvironmentOutlined />{" "}
            <span style={{ fontSize: 16 }}>Thông tin giao hàng</span>
          </SectionTitle>
          <AddressInfo>
            <div>
              <strong>Nguyễn Văn A</strong>
            </div>
            <div>0987654321</div>
            <div>123 Đường ABC, Phường XYZ, Quận 1, TP.HCM</div>
          </AddressInfo>
          <Divider style={{ margin: "12px 0" }} />
          <ArrowLink>
            <span>Thay đổi địa chỉ giao hàng</span>
            <RightOutlined />
          </ArrowLink>
        </Section>

        {/* Price Summary */}
        <div style={{ backgroundColor: "white" }}>
          <OrderInfo>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Đơn hàng</span>
              <span
                onClick={() => {
                  navigate(-1);
                  console.log("Trở về ");
                }}
                style={{ color: "#1AB2FF", cursor: "pointer" }}
              >
                Thay đổi
              </span>
            </div>
            <span>Chi tiết: 2 sản phẩm</span>
          </OrderInfo>
          <Section>
            <PriceRow>
              <span>Tạm tính</span>
              <span>312.620 ₫</span>
            </PriceRow>
            <PriceRow>
              <span>Giảm giá</span>
              <span>-7.180 ₫</span>
            </PriceRow>
            <PriceRow>
              <span>Phí giao hàng</span>
              <span>0 ₫</span>
            </PriceRow>

            <Divider style={{ margin: "16px 0" }} />

            <PriceRow>
              <TotalPrice>Tổng tiền thanh toán</TotalPrice>
              <TotalPrice>312.620 ₫</TotalPrice>
            </PriceRow>

            <SavingsTag>Tiết kiệm 7.180₫</SavingsTag>

            <VATText>(Bao gồm VAT nếu có)</VATText>
          </Section>
        </div>

        <CheckoutButton type="primary" block>
          Đặt hàng
        </CheckoutButton>
      </RightColumn>
    </CheckoutContainer>
  );
};

export default CheckoutComponent;

// Styled components (giữ nguyên như trước)

const CheckoutContainer = styled.div`
  display: flex;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const LeftColumn = styled.div`
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RightColumn = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Section = styled(Card)`
  margin-bottom: 0;
  //border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  .ant-card-body {
    padding: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddressInfo = styled.div`
  line-height: 1.6;
  font-size: 14px;
`;

const ArrowLink = styled.div`
  color: #1890ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const PaymentOption = styled(Radio)`
  display: block;
  height: 40px;
  line-height: 40px;
  margin-bottom: 8px;
  align-items: center;
  font-size: 18px;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
`;

const PriceText = styled.div`
  text-align: left;
  min-width: 100px;
`;

const PromotionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin: 12px 0;
`;

const PromotionButton = styled(Button)`
  flex: 1;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: 14px;
`;

const TotalPrice = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
`;

const SavingsTag = styled(Tag)`
  background-color: #fff2f0;
  color: #ff4d4f;
  border-color: #ffccc7;
  margin-top: 8px;
  width: 100%;
  text-align: center;
`;

const VATText = styled.div`
  color: #999;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

const CheckoutButton = styled(Button)`
  width: 100%;
  height: 48px;
  font-weight: 600;
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: white;

  &:hover {
    background-color: #ff7875;
    border-color: #ff7875;
    color: white;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-bottom: solid 1px #ccc;
  padding: 16px;
  font-size: 14px;
`;
