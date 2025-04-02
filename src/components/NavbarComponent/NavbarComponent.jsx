import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  DownOutlined,
  RightOutlined,
  PhoneOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Drawer, Grid } from "antd";

const { useBreakpoint } = Grid;

// Styled Components
const MenuTrigger = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px;
  &:hover {
    background-color: #f5f5f5;
    border-radius: 4px;
  }
`;

const Wrapper = styled.div`
  font-family: "Louis Vuitton Web", "Helvetica Neue", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  width: ${(props) => (props.$expanded ? "560px" : "280px")};
  transition: width 0.3s ease;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftNav = styled.div`
  width: 280px;
  border-right: 1px solid #e8e8e8;
  padding: 16px 0;
  flex-shrink: 0;
`;

const RightNav = styled.div`
  width: 280px;
  padding: 16px 0;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#000" : "#333")};
  background-color: ${(props) => (props.$active ? "#f9f9f9" : "transparent")};
  transition: all 0.2s;
  letter-spacing: 0.5px;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const SubCategoryTitle = styled.div`
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  color: #000;
`;

const SubItem = styled.div`
  padding: 10px 24px 10px 36px;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    color: #000;
    background-color: #f9f9f9;
  }
`;

const SupportInfo = styled.div`
  padding: 24px;
  border-top: 1px solid #e8e8e8;
  background-color: #f9f9f9;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e8e8e8;
  margin: 16px 0;
`;

const SectionTitle = styled.div`
  padding: 12px 24px;
  font-size: 14px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SupportTitle = styled.div`
  font-size: 15px;
  margin-bottom: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
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

const GenderCategories = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GenderCategory = styled.div`
  font-size: 14px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const ArrowIcon = styled.span`
  font-size: 12px;
  display: flex;
  align-items: center;
`;

// Navbar Component
const NavbarComponent = ({
  onClose,
  isOpen,
  mode = "horizontal",
  selectedCategory,
  setSelectedCategory,
  drawerWidth,
}) => {
  const navigate = useNavigate();

  const mainCategories = [
    { title: "Quà tặng", items: ["Sản phẩm mới"] },
    { title: "Túi và Phụ kiện bằng da", items: [] },
    { title: "Đồ Nữ", items: ["Đồ Nam", "Trang sức", "Đồng hồ", "Nước hoa"] },
    { title: "Rương, Phụ kiện du lịch và Trang trí nội thất", items: [] },
    { title: "Dịch vụ", items: [] },
    { title: "Maison Louis Vuitton", items: [] },
    { title: "BST Louis Vuitton x Murakami", items: [] },
  ];

  const viewedCategories = [
    { title: "Phụ kiện thời trang", items: ["Trang phục"] },
    { title: "Túi", items: ["Túi da và Phụ kiện bằng da"] },
    { title: "Giày", items: ["Phụ kiện", "Du lịch"] },
  ];

  const toggleCategory = (category) => {
    setSelectedCategory(
      selectedCategory?.title === category.title ? null : category
    );
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <Wrapper $expanded={!!selectedCategory?.items?.length}>
      <MainContainer>
        <LeftNav>
          {mainCategories.map((category, index) => (
            <div key={index}>
              <CategoryHeader
                onClick={() => {
                  if (category.items.length > 0) {
                    toggleCategory(category);
                  } else {
                    handleNavigate(`/${category.title.toLowerCase()}`);
                  }
                }}
                $active={selectedCategory?.title === category.title}
              >
                {category.title}
                {category.items.length > 0 && (
                  <ArrowIcon>
                    {selectedCategory?.title === category.title ? "" : ""}
                  </ArrowIcon>
                )}
              </CategoryHeader>
            </div>
          ))}

          <Divider />

          <SectionTitle>Danh mục đã xem</SectionTitle>
          {viewedCategories.map((category, index) => (
            <div key={`viewed-${index}`}>
              <CategoryHeader
                onClick={() => toggleCategory(category)}
                $active={selectedCategory?.title === category.title}
              >
                {category.title}
                {category.items.length > 0 && (
                  <ArrowIcon>
                    {selectedCategory?.title === category.title ? (
                      <DownOutlined />
                    ) : (
                      <RightOutlined />
                    )}
                  </ArrowIcon>
                )}
              </CategoryHeader>
            </div>
          ))}
        </LeftNav>

        {selectedCategory?.items?.length > 0 && (
          <RightNav>
            <SubCategoryTitle>{selectedCategory.title}</SubCategoryTitle>
            {selectedCategory.items.map((item, idx) => (
              <SubItem
                key={idx}
                onClick={() =>
                  handleNavigate(
                    `/${selectedCategory.title.toLowerCase()}/${item.toLowerCase()}`
                  )
                }
              >
                {item}
              </SubItem>
            ))}
          </RightNav>
        )}
      </MainContainer>

      <SupportInfo>
        <SupportTitle>Chúng tôi có thể giúp gì cho bạn?</SupportTitle>
        <ContactInfo>
          <PhoneIcon />
          <span>+84 2838614107</span>
        </ContactInfo>

        <Divider style={{ margin: "16px 0" }} />

        <GenderCategories>
          <GenderCategory onClick={() => handleNavigate("/nu")}>
            Dành cho Nữ
          </GenderCategory>
          <GenderCategory onClick={() => handleNavigate("/nam")}>
            Dành cho Nam
          </GenderCategory>
          <GenderCategory onClick={() => handleNavigate("/trang-suc")}>
            Dành cho Trang sức
          </GenderCategory>
        </GenderCategories>
      </SupportInfo>
    </Wrapper>
  );
};

// Sidebar Component
export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drawerWidth, setDrawerWidth] = useState(300);

  useEffect(() => {
    if (selectedCategory?.items?.length > 0) {
      setDrawerWidth(600);
    } else {
      setDrawerWidth(300);
    }
  }, [selectedCategory]);

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      <MenuTrigger onClick={() => setOpen(!open)}>
        <MenuOutlined style={{ fontSize: "18px", marginRight: 8 }} />
        <span style={{ fontSize: screens.xs ? "14px" : "16px" }}>Menu</span>
      </MenuTrigger>

      <Drawer
        title="Danh mục sản phẩm"
        placement="left"
        closable={true}
        onClose={() => {
          setOpen(false);
          setSelectedCategory(null);
        }}
        open={open}
        width={drawerWidth}
        bodyStyle={{ padding: 0, display: "flex" }}
        headerStyle={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <NavbarComponent
          onClose={() => setOpen(false)}
          isOpen={open}
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          mode="vertical"
          drawerWidth={drawerWidth}
        />
      </Drawer>
    </div>
  );
};

export default NavbarComponent;
