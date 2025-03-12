import styled from "styled-components";
import { Button } from "antd";

export const ProductsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* 🔥 Căn giữa card theo chiều ngang */
  gap: 20px;

  max-width: 1200px; /* Giới hạn chiều rộng */
  margin: 0 auto; /* Căn giữa toàn bộ container */
  padding: 20px;
  width: 100%;
  box-sizing: border-box; /* Đảm bảo padding không làm tăng kích thước */
  // background: rgb(184, 65, 65);
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
