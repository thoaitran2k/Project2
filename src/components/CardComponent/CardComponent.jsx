import React from "react";
import { Card } from "antd";
import styled from "styled-components";
import { CardNameProduct } from "./style";
import { StarFilled } from "@ant-design/icons";
import {
  WrapperReportText,
  WrapperPriceText,
  WrapperDiscountText,
  WrapperCardStyle,
} from "./style";

const { Meta } = Card;

const CardComponent = () => {
  return (
    <WrapperCardStyle
      hoverable
      style={{ width: 200 }}
      cover={
        <img
          alt="example"
          src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
        />
      }
    >
      <CardNameProduct>Áo Da JK </CardNameProduct>
      <WrapperReportText>
        <span>4.93 </span>
        <StarFilled
          style={{
            fontSize: "14px",
            color: "yellow",
            justifyContent: "center",
          }}
        />
        <span> | Đã bán 100K+</span>
      </WrapperReportText>
      <WrapperPriceText>
        {" "}
        1.000.000 VNĐ
        <WrapperDiscountText> -5%</WrapperDiscountText>
      </WrapperPriceText>
    </WrapperCardStyle>
  );
};

export default CardComponent;
