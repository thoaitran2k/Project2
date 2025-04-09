import React, { useEffect } from "react";
import styled from "styled-components";
import successIcon from "../../assets/the-gioi-bop-da.jpg";
import { useLocation, useNavigate } from "react-router";

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu không có state truyền vào (quay ngược về), redirect
    if (!location.state) {
      navigate("/home", { replace: true });
    }
  }, []);

  const { total, paymentMethod, createdAt } = location.state || {};

  console.log("location.state", location.state);
  return (
    <SuccessContainer>
      <Header>
        <img src={successIcon} alt="success" />
        <div>
          <Title>Chúc mừng, Bạn đã đặt hàng thành công!</Title>
          <SubTitle>
            {`Chuẩn bị ${
              paymentMethod === "cash" ? "tiền mặt" : "thanh toán"
            } ${total?.toLocaleString("vi-VN")} ₫`}
          </SubTitle>
        </div>
      </Header>

      <Content>
        <InfoRow>
          <span>Thời gian đặt hàng</span>
          <span>{createdAt}</span>
        </InfoRow>

        <InfoRow>
          <span>Phương thức thanh toán</span>
          <span>
            {paymentMethod === "cash"
              ? "Thanh toán tiền mặt"
              : "Thanh toán online"}
          </span>
        </InfoRow>

        <InfoRow>
          <span>Tổng cộng</span>
          <TotalAmount>{total?.toLocaleString("vi-VN")} ₫</TotalAmount>
        </InfoRow>
        <VATNote>(Đã bao gồm VAT nếu có)</VATNote>

        <HomeButton onClick={() => (window.location.href = "/home")}>
          Quay về trang chủ
        </HomeButton>
      </Content>
    </SuccessContainer>
  );
};

export default CheckoutSuccess;

// Styled Components

const SuccessContainer = styled.div`
  max-width: 600px;
  margin: 40px auto;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  overflow: hidden;
  font-family: Arial, sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(to right, #1ab2ff, #4fc3f7);
  color: white;
  padding: 20px;

  img {
    width: 60px;
    height: auto;
  }
`;

const Title = styled.h2`
  margin: 0;
`;

const SubTitle = styled.p`
  margin: 4px 0 0;
  font-size: 16px;
`;

const Content = styled.div`
  padding: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  margin: 12px 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const TotalAmount = styled.span`
  font-weight: bold;
`;

const VATNote = styled.p`
  font-size: 12px;
  color: #888;
  text-align: right;
  margin-top: 4px;
`;

const HomeButton = styled.button`
  margin-top: 24px;
  width: 100%;
  padding: 10px;
  background: white;
  color: #1ab2ff;
  border: 1px solid #1ab2ff;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #f0faff;
  }
`;
