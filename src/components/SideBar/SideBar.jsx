import React from "react";
import { Checkbox, Slider } from "antd";
import styled from "styled-components";
import { SidebarContainer, StyledCheckboxGroup } from "./style";

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
