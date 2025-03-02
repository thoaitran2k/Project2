import styled from "styled-components";
import { Card } from "antd";

export const WrapperCardStyle = styled(Card)`
  width: 200px;

  & .ant-card-cover img {
    height: 200px;
    width: 200px;
    // object-fit: cover; /* Đảm bảo ảnh không bị méo */
    border-radius: 5px;
  }
`;

export const CardNameProduct = styled.div`
  font-weight: 800;
  font-size: 20px;
  line-height: 25px;
  color: rgb(56, 56, 61);
`;

export const WrapperReportText = styled.div`
  margin: 20px 0 5px;
  font-size: 13px;
  color: rgb(128, 128, 137);
  display: flex;
  align-items: center;
`;

export const WrapperPriceText = styled.div`
  font-size: 17px;
  color: rgb(255, 56, 78);
  font-weight: 500;
`;

export const WrapperDiscountText = styled.span`
  font-size: 16px;
  color: rgb(32, 22, 23);
  font-weight: 500;
`;
