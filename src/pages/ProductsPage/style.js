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
