import React from "react";
import CheckoutComponent from "../../components/Checkout/CheckoutComponent";
import styled from "styled-components";
import zaloicon from "../../assets/zaloicon.png";
import { useNavigate } from "react-router";
import logoImage from "../../assets/logo-shop-thoi-trang-04-removebg-preview.png";

const CheckoutPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderCheckoutContainer>
        <CheckoutHeaderWrapper>
          {/* LOGO + Text */}
          <LogoSection onClick={() => navigate("/home")}>
            <LogoImage src={logoImage} alt="The Fashion Shop" />
            <TitleText>Thanh toán</TitleText>
          </LogoSection>

          {/* Zalo Support */}
          <SupportBox>
            <img src={zaloicon} alt="Zalo" width={30} />
            <SupportText>
              <span>0794 330 648</span>
              <span className="sub">8h - 20h, T2 - T6</span>
            </SupportText>
          </SupportBox>
        </CheckoutHeaderWrapper>
      </HeaderCheckoutContainer>

      <CheckoutComponent />
    </>
  );
};

export default CheckoutPage;

// Styled Components
const HeaderCheckoutContainer = styled.div`
  background-color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CheckoutHeaderWrapper = styled.div`
  max-width: 1100px;
  width: 90%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
    transition: all 0.2s ease-in-out;
  }
`;

const LogoImage = styled.img`
  height: 60px;
  object-fit: contain;
`;

const TitleText = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1ab2ff;

  @media (max-width: 600px) {
    font-size: 18px;
  }
`;

const SupportBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f1f8ff;
  border: 2px solid #1ab2ff;
  border-radius: 30px;
  padding: 5px 15px;

  img {
    margin-right: 5px;
  }
`;

const SupportText = styled.div`
  display: flex;
  flex-direction: column;
  color: #1ab2ff;
  font-size: 16px;

  .sub {
    font-size: 13px;
    color: black;
  }
`;
