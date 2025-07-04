import React from "react";
import CheckoutSuccess from "../../components/Checkout/CheckoutSuccess";
import styled from "styled-components";
import zaloicon from "../../assets/zaloicon.png";
import { useNavigate } from "react-router";
import logoImage from "../../assets/logo-shop-thoi-trang-04-removebg-preview.png";

const CheckoutSuccesPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <HeaderCheckoutContainer>
        <CheckoutHeaderWrapper>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
            <div
              onClick={() => {
                navigate("/home");
              }}
              style={{
                width: "80px",
                cursor: "pointer",
              }}
            >
              <LogoImage src={logoImage} alt="The Fashion Shop" />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              border: "solid 2px #1AB2FF",
              borderRadius: "50px",

              padding: "5px",
              backgroundColor: "#F1F8FF",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={zaloicon} alt="" width={30} />
            </div>
            <div
              style={{
                fontSize: 17,
                display: "flex",
                flexDirection: "column",
                color: "#1AB2FF",
              }}
            >
              <span> 0794330648</span>

              <span style={{ fontSize: 13, color: "black" }}>
                8h - 20h, Từ T2 đến T6
              </span>
            </div>
          </div>
        </CheckoutHeaderWrapper>
      </HeaderCheckoutContainer>
      ;
      <div>
        <CheckoutSuccess />;
      </div>
    </>
  );
};

export default CheckoutSuccesPage;

const HeaderCheckoutContainer = styled.div`
  background-color: white;
  height: 10vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CheckoutHeaderWrapper = styled.div`
  max-width: 70%;
  width: 70%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 25px;
`;

const LogoImage = styled.img`
  height: 60px;
  object-fit: contain;
`;
