import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ArrowRightOutlined } from "@ant-design/icons";

const NavbarComponent = ({
  onClose,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const navigate = useNavigate();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  const handleNavigate = (type) => {
    navigate(`/product-type/${removeVietnameseTones(type)}`);
    setExpandedSections({});
    if (onClose) onClose();
  };

  const mainCategories = [
    { title: "Đồ nam", items: ["Áo nam", "Quần nam"] },
    { title: "Đồ nữ", items: ["Áo nữ", "Quần nữ"] },

    {
      title: "Phụ kiện dành cho nữ",
      items: ["Túi xách", "Trang sức"],
    },
    {
      title: "Phụ kiện dành cho nam",
      items: ["Ví", "Đồng hồ"],
    },
  ];

  return (
    <Wrapper>
      <NavContainer>
        {/* Nếu chưa chọn danh mục nào, hiển thị danh mục chính */}
        {!selectedCategory ? (
          mainCategories.map((category, index) => (
            <CategorySection key={index}>
              <CategoryHeader onClick={() => setSelectedCategory(category)}>
                {category.title}
                {category.items.length > 0 && <ArrowRightOutlined />}
              </CategoryHeader>
            </CategorySection>
          ))
        ) : (
          <>
            <BackButton onClick={() => setSelectedCategory(null)}>
              ← Trở lại
            </BackButton>
            {selectedCategory.items.map((item, idx) => (
              <SubItem key={idx} onClick={() => handleNavigate(item)}>
                {item}
              </SubItem>
            ))}
          </>
        )}
      </NavContainer>
    </Wrapper>
  );
};

export default NavbarComponent;

// Styled Components
const Wrapper = styled.div`
  font-family: "Helvetica Neue", Arial, sans-serif;
  width: 280px;
`;

const NavContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategorySection = styled.div`
  position: relative;
  border-bottom: 1px solid #e8e8e8;
`;
const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  padding: 12px;
  font-size: 21px;
  font-weight: 700;
  cursor: pointer;
  color: #333;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:hover + div {
    opacity: 1;
    visibility: visible;
  }
`;

const ArrowIcon = styled.span`
  transition: transform 0.2s;
  transform: rotate(${({ $expanded }) => ($expanded ? "90deg" : "0deg")});
  font-size: 12px;
`;

const SubItems = styled.div`
  position: absolute;
  top: 0;
  left: 100%; /* Đẩy sang phải */
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  padding: 10px 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &:hover {
    opacity: 1;
    visibility: visible;
  }
`;

const SubItem = styled.div`
  padding: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #000;
  }
`;

const NewBadge = styled.span`
  background-color: #ff0000;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`;
const BackButton = styled.div`
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 10px;
`;
