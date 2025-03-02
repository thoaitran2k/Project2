import { Image, Col } from "antd";
import styled from "styled-components";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

export const WrapperStyleImageSmall = styled(Image)`
  height: 100px;
  width: 100px;
`;

export const WrapperStyleImage = styled(Col)`
  flex-basis: unset;
  display: flex;
`;

export const WrapperStyleNameProduct = styled.h1`
  color: rgb(36, 36, 36);
  font-size: 24px;
  font-weight: 300;
  line-height: 32px;
  word-break: break-word;
`;

export const WrapperStyleTextSell = styled.span`
  font-size: 15px;
  line-height: 24px;
  color: rgb(120, 120, 120);
`;

export const WrapperStylePriceTextProduct = styled.h1`
  font-size: 32px;
  margin-right: 8px;
  line-height: 40px;
  padding: 10px;
  margin-top: 10px;
  font-weight: 500;
`;

export const WrapperStylePriceProduct = styled.div`
  border-radius: 4px;
  background: rgb(250, 250, 250);
`;

export const WrapperAdressProduct = styled.div`
  span.address {
    text-decoration: underline;
    font-size: 15px;
    line-height: 24px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span.change-address {
    color: rgb(10, 104, 255);
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    cursor: pointer;
  }
`;

export const WrapperQualityProduct = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const WrapperButtonComponent = styled(ButtonComponent)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
`;

export const StyledButton = styled(ButtonComponent)`
  && {
    background: ${(props) => (props.primary ? "red" : "white")};
    color: ${(props) => (props.primary ? "white" : "rgb(21, 18, 196);")};
    border: ${(props) =>
      props.primary ? "none " : "1px solid rgb(21, 18, 196);"};
    font-size: 20px;
    font-weight: bold;
    padding: 12px 24px;
    border-radius: 3px;
    width: 230px;
    height: 55px;
    margin: 10px 0;
    cursor: pointer;
    transition: background 0.3s ease, color 0.3s ease;

    &:hover {
      background: ${(props) =>
        props.primary ? "rgb(202, 10, 58)" : "rgb(9, 9, 65)"};
      color: ${(props) => (props.primary ? "white" : "white")};
    }
  }
`;
