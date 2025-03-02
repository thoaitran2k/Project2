import React from "react";
import CardComponent from "../../components/CardComponent/CardComponent";

const OrderPage = () => {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
      <CardComponent />
      <CardComponent />
      <CardComponent />
    </div>
  );
};

export default OrderPage;
