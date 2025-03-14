import styled from "styled-components";
import { Button } from "antd";

export const ProductsContainer = styled.div`
  display: flex;
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  border: solid 4px white;
  justify-content: flex-start; /* 🔥 Sidebar bên trái */
`;

export const WrapperButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 50px;
`;

export const WrapperButtonMore = styled(Button)`
  border: 1px solid rgb(11, 116, 229);
  color: rgb(11, 116, 229);
  width: 240px;
  height: 38px;
  font-weight: 500;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: rgb(18, 96, 190) !important;
    span {
      color: #fff;
    }
  }
`;
export const SidebarContainer = styled.div`
  width: 250px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;
