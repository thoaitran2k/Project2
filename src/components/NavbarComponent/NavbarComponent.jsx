import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { PhoneOutlined, MenuOutlined } from "@ant-design/icons";
import { Drawer, Grid } from "antd";
import axios from "axios";

const { useBreakpoint } = Grid;

// Styled Components

// Navbar Component
const NavbarComponent = ({
  onClose,
  isOpen,
  mode = "horizontal",
  selectedCategory,
  setSelectedCategory,
  drawerWidth,
  topSellByType = {},
}) => {
  const navigate = useNavigate();

  const mainCategories = [
    { title: "Đồ nam", items: ["Áo nam", "Quần nam"] },
    { title: "Túi và Phụ kiện bằng da", items: ["Túi xách", "Ví da"] },
    { title: "Đồ Nữ", items: ["Áo nữ", "Quần nữ"] },
    {
      title: "Phụ kiện và trang sức cho nữ",
      items: ["Túi xách nữ", "Trang sức nữ"],
    },
    { title: "Phụ kiện thời trang cho nam", items: ["Ví", "Đồng hồ"] },
    { title: "Dịch vụ", items: ["Chăm sóc khách hàng", "Liên hệ trả hàng"] },
  ];

  const viewedCategories = topSellByType
    ? Object.keys(topSellByType).map((type) => ({
        title: type,
        items: topSellByType[type],
      }))
    : [];

  const toggleCategory = (category) => {
    setSelectedCategory(
      selectedCategory?.title === category.title ? null : category
    );
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  console.log("topSellByType", topSellByType);

  return (
    <Wrapper $expanded={!!selectedCategory?.items?.length}>
      <MainContainer>
        <LeftNav>
          {mainCategories.map((category, index) => (
            <div key={index}>
              <CategoryHeader
                data-active={
                  selectedCategory?.title === category.title ? "true" : "false"
                } // Thêm thuộc tính data-active
                onClick={() => {
                  if (category.items.length > 0) {
                    toggleCategory(category);
                  } else {
                    handleNavigate(`/${category.title.toLowerCase()}`);
                  }
                }}
                $active={selectedCategory?.title === category.title}
              >
                <UnderlineText>{category.title}</UnderlineText>
                {category.items.length > 0 && (
                  <ArrowIcon>
                    {selectedCategory?.title === category.title ? "" : ""}
                  </ArrowIcon>
                )}
              </CategoryHeader>
            </div>
          ))}

          <Divider />

          <SectionTitle>SẢN PHẨM BÁN CHẠY</SectionTitle>
          {viewedCategories.map((category, index) => (
            <div key={`viewed-${index}`}>
              <CategoryHeader
                onClick={() => toggleCategory(category)}
                $active={selectedCategory?.title === category.title}
                data-active={
                  selectedCategory?.title === category.title ? "true" : "false"
                }
              >
                <UnderlineText>{category.title}</UnderlineText>
              </CategoryHeader>
            </div>
          ))}
        </LeftNav>

        {selectedCategory?.items?.length > 0 && (
          <RightNav>
            {selectedCategory?.items?.[0]?.image ? (
              <>
                <SubCategoryTitle>
                  Các sản phẩm{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {selectedCategory.title.charAt(0).toUpperCase() +
                      selectedCategory.title.slice(1)}{" "}
                  </span>
                  bán chạy
                </SubCategoryTitle>
                <ProductGrid>
                  {selectedCategory.items.map((item, idx) => {
                    // Tạo slug từ tên sản phẩm
                    const productSlug = item.name
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/Đ/g, "D")
                      .replace(/đ/g, "d")
                      .toLowerCase()
                      .replace(/[^a-z0-9 ]/g, "")
                      .replace(/\s+/g, "-");

                    return (
                      <ProductCard
                        key={idx}
                        onClick={() =>
                          handleNavigate(
                            `/product-details/${productSlug}-${item._id}`
                          )
                        }
                      >
                        <ProductImage src={item.image} alt={item.name} />
                        <ProductName>{item.name}</ProductName>
                      </ProductCard>
                    );
                  })}
                </ProductGrid>
              </>
            ) : (
              selectedCategory?.items.map((item, idx) => {
                const rawType = typeof item === "string" ? item : item.type;
                const categorySlugMap = {
                  "Áo nam": "ao-nam",
                  "Quần nam": "quan-nam",
                  "Ví da": "vi",
                  "Đồng hồ": "dong-ho",
                  "Túi xách nữ": "tui-xach",
                  "Túi xách": "tui-xach",
                  Ví: "vi",
                  "Trang sức nữ": "trang-suc",
                  "Áo nữ": "ao-nu",
                  "Quần nữ": "quan-nu",
                };

                const categorySlug =
                  categorySlugMap[rawType] ||
                  rawType
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w\-]+/g, "");

                return (
                  <SubItem
                    key={idx}
                    onClick={() =>
                      handleNavigate(`/product-type/${categorySlug}`)
                    }
                  >
                    {typeof item === "string" ? item : item.name}
                  </SubItem>
                );
              })
            )}
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
  const [topSellByType, setTopSellByType] = useState({});

  useEffect(() => {
    if (selectedCategory?.items?.length > 0) {
      setDrawerWidth(800);
    } else {
      setDrawerWidth(300);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (open) {
      console.log("Chạy useEffect...........");
      axios.get("http://localhost:3002/api/product/top-sell").then((res) => {
        const grouped = {};
        res.data.topProducts.forEach((p) => {
          if (!grouped[p.type]) grouped[p.type] = [];
          grouped[p.type].push(p);
        });
        setTopSellByType(grouped);
      });
    }
  }, [open]);

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
          //borderBottom: "1px solid #f0f0f0",
        }}
      >
        <NavbarComponent
          onClose={() => setOpen(false)}
          isOpen={open}
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          mode="vertical"
          drawerWidth={drawerWidth}
          topSellByType={topSellByType}
        />
      </Drawer>
    </div>
  );
};

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
  width: ${(props) => (props.$expanded ? "800px" : "280px")};
  transition: width 0.3s ease;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftNav = styled.div`
  width: 280px;
  //border-right: 1px solid #e8e8e8;
  padding: 16px 0;
  flex-shrink: 0;
`;

const RightNav = styled.div`
  width: 520px;
  padding: 16px 0;
  border-left: 1px solid rgb(56, 53, 53);
  flex-shrink: 0;
  overflow-y: auto;
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
  background-color: ${(props) => (props.$active ? "" : "transparent")};
  transition: background-color 0.2s;
  letter-spacing: 0.5px;
`;

const UnderlineText = styled.span`
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px; /* Khoảng cách với chữ */
    width: 0;
    height: 1px;
    background-color: currentColor;
    transition: width 0.3s ease-in-out;
  }

  /* Khi không active, sẽ có underline khi hover */
  ${CategoryHeader}:not([data-active='true']) &:hover::after {
    width: 100%;
  }

  /* Không có underline khi active */
  ${CategoryHeader}[data-active='true'] &::after {
    width: 100%; /* Giữ underline khi active */
  }

  /* Đảm bảo khi không active, hover chỉ có hiệu ứng từ trái sang phải */
  ${CategoryHeader}:not([data-active='true']) &:not(:hover)::after {
    width: 0; /* Khi không hover, không có underline */
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
  font-size: 16px;
  cursor: pointer;
  color: black;
  transition: all 0.2s;

  &:hover {
    color: #000;
    background-color: rgb(241, 239, 239);
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
  font-size: 13px;
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

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
`;

const ProductCard = styled.div`
  cursor: pointer;
  text-align: center;
  border: 1px solid #f0f0f0;
  padding: 12px;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

export default NavbarComponent;
