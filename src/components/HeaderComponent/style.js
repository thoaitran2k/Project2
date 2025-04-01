import { Row } from "antd";
import styled from "styled-components";
import { Link } from "react-router-dom";

export const WrapperHeader = styled(Row)`
  padding: 10px 5px;
  background-color: rgb(255, 255, 255);
  height: 100%;
  display: flex;
  align-items: center;
  border-bottom: solid 2px #ccc;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 10rem;
`;

export const WrapperLogo = styled.span`
  font-size: 24px;
  color: #000;
  font-weight: bold;
`;

export const LoginButton = styled.button`
  width: 130px;
  height: 50px;
  background-color: #2c839e;
  color: white;
  border: solid 2px rgb(44, 131, 158);
  border-radius: 50px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background-color: #1b5c74;
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.98);
  }
`;

export const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const UserAvatar = styled.div`
  justify-content: left;
  gap: 2px;
  align-items: center;

  cursor: pointer;
  padding: 2px;
`;

export const UserName = styled.span`
  font-size: 15px;
  color: red;
  font-weight: 400;
  //max-width: 40px;
`;

export const MenuTrigger = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    text-decoration: underline;
    color: #92c6ff;
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border-radius: 4px;
  padding: 16px;
  max-height: 80vh;
  overflow-y: auto;
`;

export const CloseButton = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 24px;
  height: 24px;

  &:hover {
    background-color: #f5f5f5;
  }
`;
