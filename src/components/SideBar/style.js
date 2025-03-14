import { Checkbox } from "antd";
import React from "react";
import styled from "styled-components";

export const SidebarContainer = styled.div`
  width: 300px;
  height: 100vh;
  // position: fixed;
 top 0;
  left: 0;
  background: #f8f9fa;
  padding: 20px;
  border-right: 1px solid #ddd;
  overflow-y: auto;
`;

export const StyledCheckboxGroup = styled(Checkbox.Group)`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 🔥 Chia 2 cột */
  gap: 10px; /* 🔥 Tạo khoảng cách giữa các mục */
`;
