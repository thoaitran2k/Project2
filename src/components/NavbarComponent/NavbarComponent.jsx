import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ArrowRightOutlined,
  DownOutlined,
  PhoneOutlined,
  RightOutlined,
} from "@ant-design/icons";

const NavbarComponent = ({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const navigate = useNavigate();

  const toggleCategory = (category) => {
    if (selectedCategory && selectedCategory.title === category.title) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
    }
  }, [isOpen]);

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
      <MainContainer>
        <NavContainer>
          {mainCategories.map((category, index) => (
            <div key={index}>
              <CategoryHeader
                onClick={() => {
                  if (category.items.length > 0) {
                    toggleCategory(category);
                  } else {
                    handleNavigate(category.title);
                  }
                }}
                $active={selectedCategory?.title === category.title}
              >
                {category.title}
                {category.items.length > 0 && (
                  <ArrowIcon
                    $expanded={selectedCategory?.title === category.title}
                  >
                    {selectedCategory?.title === category.title ? (
                      <DownOutlined />
                    ) : (
                      <RightOutlined />
                    )}
                  </ArrowIcon>
                )}
              </CategoryHeader>

              {selectedCategory?.title === category.title && (
                <SubItemsContainer>
                  {selectedCategory.items.map((item, idx) => (
                    <SubItem key={idx} onClick={() => handleNavigate(item)}>
                      {item}
                    </SubItem>
                  ))}
                </SubItemsContainer>
              )}
            </div>
          ))}
        </NavContainer>
      </MainContainer>

      {isOpen && (
        <SupportInfo>
          <SupportTitle>Hỗ trợ khách hàng</SupportTitle>
          <ContactInfo>
            <PhoneIcon />
            <span>+84 0794330648</span>
          </ContactInfo>
        </SupportInfo>
      )}
    </Wrapper>
  );
};

export default NavbarComponent;

// Styled Components
const Wrapper = styled.div`
  font-family: "Helvetica Neue", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
`;

const NavContainer = styled.div`
  width: 280px;
  border-right: 1px solid #e8e8e8;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  padding: 12px;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#000" : "#333")};
  background-color: ${(props) => (props.$active ? "#f5f5f5" : "transparent")};
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ArrowIcon = styled.span`
  transition: transform 0.2s;
  transform: rotate(${({ $expanded }) => ($expanded ? "90deg" : "0deg")});
  font-size: 12px;
`;

const SubItem = styled.div`
  padding: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const SupportInfo = styled.div`
  padding: 20px;
  border-top: 1px solid #e8e8e8;
  margin-top: auto;
`;

const SupportTitle = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: bold;
`;

const SubItemsContainer = styled.div`
  padding-left: 16px;
  margin-top: 4px;
  margin-bottom: 12px;
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
`;

const PhoneIcon = styled(PhoneOutlined)`
  font-size: 14px;
`;
