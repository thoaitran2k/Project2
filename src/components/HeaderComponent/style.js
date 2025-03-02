import { Row } from "antd";
import styled from "styled-components";
import { Link } from "react-router-dom";

export const WrapperHeader = styled(Row)`
  padding: 10px 5px;
  background-color: #ece9df;
  height: 100%;
  display: flex;
  align-items: center;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 8.7rem;
`;

export const WrapperLogo = styled.span`
  font-size: 24px;
  color: #000;
  font-weight: bold;
`;

export const LoginButton = styled.div`
  background: rgb(213, 224, 231);
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: rgb(8, 61, 129);
  text-shadow: 1px 1px 2px #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
  border: 2px solid #005d9c;
  transition: 0.3s;
  height: 20px;
  width: 100px;

  &:hover {
    opacity: 0.8;
    color: rgb(194, 7, 101);
  }
`;

export const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
