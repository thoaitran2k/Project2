import React from "react";
import { Checkbox, Slider } from "antd";
import styled from "styled-components";

const SideBar = () => {
  return (
    <SidebarContainer>
      <h3>Danh mục</h3>
      <StyledCheckboxGroup
        options={[
          "Áo nam",
          "Đồng hồ",
          "Áo nữ",
          "Trang sức",
          "Quần nam",
          "Ví",
          "Quần nữ",
          "Túi xách",
        ]}
        onChange={(values) => console.log("Danh mục:", values)}
      />
      <h3>Khoảng giá</h3>
      <Slider
        range
        min={0}
        max={100}
        defaultValue={[0, 100]}
        onChange={(value) => console.log("Khoảng giá:", value)}
      />
    </SidebarContainer>
  );
};

export default SideBar;

// 🎨 Style tối ưu hóa
const SidebarContainer = styled.div`
  width: 300px;
  height: 100vh;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const StyledCheckboxGroup = styled(Checkbox.Group)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;
