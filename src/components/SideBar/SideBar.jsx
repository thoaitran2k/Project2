import React, { useEffect, useState } from "react";
import { Checkbox, Slider } from "antd";
import styled from "styled-components";
import { getAllTypeProduct } from "../../Services/ProductService"; // Đường dẫn tuỳ chỉnh theo dự án của bạn

const SideBar = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllTypeProduct();
        const data = response.data;
        console.log("📦 Dữ liệu API:", data); // Kiểm tra dữ liệu

        if (Array.isArray(data)) {
          const formattedCategories = data.map((item, index) => ({
            label: item, // Gán chuỗi làm label
            value: index.toString(), // Dùng index làm giá trị (hoặc item nếu duy nhất)
          }));

          setCategories(formattedCategories);
        } else {
          console.error("🚨 API không trả về mảng:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("🚨 Lỗi lấy danh mục:", error.message);
      }
    };

    fetchCategories();
  }, []);

  return (
    <SidebarContainer>
      <h3>Danh mục</h3>
      <StyledCheckboxGroup
        options={categories}
        onChange={(values) => console.log("Danh mục đã chọn:", values)}
      />
      <h3>Khoảng giá</h3>
      <Slider
        range
        min={0}
        max={100}
        defaultValue={[0, 100]}
        onChange={(value) => console.log("Khoảng giá đã chọn:", value)}
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
