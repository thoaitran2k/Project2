import styled from "styled-components";

export const BreadcrumbWrapper = styled.div`
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  background: #f5f5f5;
  position: relative; /* Giữ vị trí cố định phía trên */
  z-index: 10;
  // box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  // margin-bottom: 8px; /* Đặt khoảng cách 8px với phần dưới */
  margin: 0 auto; /* Căn giữa theo chiều ngang */
  background: transparent;
  max-width: 80vw;
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 16px;
`;
