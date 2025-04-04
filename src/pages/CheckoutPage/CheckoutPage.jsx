import React from "react";
import CheckoutComponent from "../../components/Checkout/CheckoutComponent";
import styled from "styled-components";
import zaloicon from "../../assets/zaloicon.png";

const CheckoutPage = () => {
  return (
    <>
      <HeaderCheckoutContainer>
        <CheckoutHeaderWrapper>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
            <div style={{ borderRight: "solid 1px blue", width: "80px" }}>
              LOGO
            </div>

            <div
              style={{
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                color: "#1AB2FF",
              }}
            >
              Thanh toán
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
        <CheckoutComponent />;
      </div>
    </>
  );
};

export default CheckoutPage;

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
