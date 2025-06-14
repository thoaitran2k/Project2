import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Card, Row, Col, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import shop1Banner from "../../assets/thiet-ke-shop-quan-ao-a.jpg";
import shop2Banner from "../../assets/thiet-ke-shop-quan-ao-dep.jpg";
import shop3Banner from "../../assets/Best_Selling_banner.webp";
import shop4banner from "../../assets/Cac-san-pham-can-duoc-trung-bay-sao-cho-thu-hut-khach-hang.jpg";
import shop5banner from "../../assets/banner-1-2496631j15489.webp";

import shopwallet from "../../assets/the-gioi-bop-da.jpg";
import shopwatch from "../../assets/thiet-ke-shop-dong-ho-1.jpg";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import axios from "axios";

const { Title } = Typography;

const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

const HomePage = () => {
  const collections = [
    { category: "Áo nam", image: "/src/assets/aonamCol.png" },
    { category: "Quần nam", image: "/src/assets/quannamCol.png" },
    { category: "Đồng hồ", image: "/src/assets/dong-ho-products.png" },
    { category: "Áo nữ", image: "/src/assets/aonuCol.png" },
    { category: "Quần nữ", image: "/src/assets/quannuCol.png" },
    { category: "Túi xách", image: "/src/assets/bagCol.png" },
    { category: "Trang sức", image: "/src/assets/trangsucCol.png" },
    { category: "Ví", image: "/src/assets/vi.png" },
  ];

  const [discountedTypes, setDiscountedTypes] = useState([]);

  useEffect(() => {
    const fetchDiscountedTypes = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3002/api/product/discounts-by-type"
        );
        const sorted = res.data
          .filter((item) => item.maxDiscount > 0)
          .sort((a, b) => b.maxDiscount - a.maxDiscount);
        setDiscountedTypes(sorted.slice(0, 5));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách loại sản phẩm giảm giá:", error);
      }
    };

    fetchDiscountedTypes();
  }, []);

  const imageMap = {
    "Áo nam":
      "/src/assets/custom-t-shirts-banner-design-template-4900533935ea094ef9a9b73571605d04_screen.jpg",
    "Quần nam": "/src/assets/quannamCol.png",
    "Đồng hồ": "/src/assets/banner-zenith.jpg",
    "Áo nữ": "/src/assets/banner-bo-suu-tap-thoi-trang_113854225.png",
    "Quần nữ":
      "/src/assets/banner_new_arrival_quan_tay_d68ca787f34c48ca95bfb639ba029a64.webp",
    "Túi xách": "/src/assets/bagCol.png",
    "Trang sức": "/src/assets/trang-suc-nu-bia-moi.jpg",
    Ví: "/src/assets/vi.png",
  };

  const promotions = [
    {
      title: "15% Off Hot Sale",
      image: shop1Banner,
      buttonText: "Xem ngay",
    },
    {
      title: "Baby & Kids Clothings",
      image: shop2Banner,
      buttonText: "Xem ngay",
    },
    {
      title: "#1 eCommerce Platform",
      stats: "25k+ Client Testimonials",
      image: shop5banner,
      buttonText: "Xem thêm",
    },
    {
      title: "Mid Summer Collection",
      description:
        "Đến với chúng tôi, bạn sẽ được trải nghiệm mua hàng theo cách của riêng bạn!",
      image: shop4banner,
      buttonText: "Mua ngay",
    },
    {
      title: "Feel Amazing EVERYDAY",
      subtitle: "Kids Bag",
      image: shop5banner,
      buttonText: "Mua ngay",
    },
    {
      title: "1 Million",
      subtitle: "Real Customer & Buyers",
      image: shop1Banner,
      buttonText: "Truy cập ngay",
    },
  ];

  const handleClick = (promo) => {
    switch (promo.title) {
      case "15% Off Hot Sale":
        console.log("👉 Chuyển đến trang giảm giá!");
        navigate("/sale-off");
        break;
      case "Baby & Kids Clothings":
        console.log("👉 Chuyển đến danh mục quần áo trẻ em!");
        // navigate("/kids-clothing");
        break;
      case "#1 eCommerce Platform":
        console.log("👉 Xem testimonies!");
        // navigate("/testimonials");
        break;
      default:
        console.log(`👉 Clicked: ${promo.title}`);
      // navigate("/some-default-page");
    }
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const handleLoginClick = () => {
    dispatch(setLoading(true));
    setTimeout(() => {
      dispatch(setLoading(false));
      navigate("/sign-in");
    }, 1500);
    // Điều hướng đến trang /sign-in
  };

  const handleToTypePageWomenShirt = () => {
    console.log("Đang đến trang sản phẩm Áo nữ");
    navigate("/product-type/ao-nu");
  };

  const handleToProducts = () => {
    navigate("/products");
  };

  return (
    <HomeContainer>
      {/* Hero Banner Section */}
      <HeroSection>
        <Row gutter={[24, 24]}>
          {/* Cột chính với Hero Banner */}
          <Col xs={24} md={12}>
            <HeroBanner>
              <HeroContent>
                {!isAuthenticated ? (
                  <>
                    <HeroTitle>Login to purchase</HeroTitle>
                    <ShopButton
                      style={{
                        background: "#1B5C74",
                        color: "white",
                        width: "150px",
                        height: "50px",
                        fontSize: "16px",
                      }}
                      onClick={handleLoginClick}
                    >
                      LOG IN
                    </ShopButton>
                  </>
                ) : (
                  <>
                    <HeroTitle>Bộ sưu tập độc đáo dành cho nữ</HeroTitle>
                    <ShopButton onClick={handleToTypePageWomenShirt}>
                      Mua ngay
                    </ShopButton>
                  </>
                )}
              </HeroContent>
            </HeroBanner>
          </Col>

          {/* Cột phụ chứa các banner nhỏ */}
          <Col xs={24} md={12}>
            <Row gutter={[12, 12]}>
              {/* Banner dành cho nam */}
              <Col span={24}>
                <MediumBanner>
                  <BannerContent>
                    <BannerTitle></BannerTitle>
                    <BannerButton onClick={() => navigate("/top-selling")}>
                      Xem ngay
                    </BannerButton>
                  </BannerContent>
                </MediumBanner>
              </Col>

              {/* Hai banner nhỏ xếp ngang nhau */}
              <Col xs={8}>
                <SmallBanner>
                  <BannerContent
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate("/product-type/ao-nam");
                    }}
                  >
                    <BannerTitle>Áo nam</BannerTitle>
                    <BannerText>Thời trang lịch lãm</BannerText>
                  </BannerContent>
                </SmallBanner>
              </Col>
              <Col xs={8}>
                <SmallBanner2>
                  <BannerContent
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate("/product-type/dong-ho");
                    }}
                  >
                    <BannerTitle>Đồng hồ</BannerTitle>
                    <BannerText>Sự lựa chọn hoàn hảo</BannerText>
                  </BannerContent>
                </SmallBanner2>
              </Col>
              <Col xs={8}>
                <SmallBanner3>
                  <BannerContent
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate("/product-type/vi");
                    }}
                  >
                    <BannerTitle>Ví da</BannerTitle>
                    <BannerText>Mảnh ghép còn thiếu</BannerText>
                  </BannerContent>
                </SmallBanner3>
              </Col>
            </Row>
          </Col>
        </Row>
      </HeroSection>

      {/* Second Banner Row */}
      <BannerRow>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <TextBanner>
              <BannerContent>
                <BannerTitle>Tận tâm và tận tình</BannerTitle>
                <BannerDescription>
                  Đến với chúng tôi, bạn sẽ được trải nghiệm mua hàng theo cách
                  của riêng bạn!
                </BannerDescription>
                <BannerButton onClick={handleToProducts}>
                  Truy cập ngay
                </BannerButton>
              </BannerContent>
            </TextBanner>
          </Col>
          <Col xs={24} md={12}>
            <ImageBanner>
              <BannerContent>
                <BannerTitle>Tận hưởng trải nghiệm mua sắm tại đây</BannerTitle>
                <BannerSubtitle>Túi xách</BannerSubtitle>
                <BannerButton
                  onClick={() => navigate("/product-type/tui-xach")}
                >
                  Mua ngay
                </BannerButton>
              </BannerContent>
            </ImageBanner>
          </Col>
        </Row>
      </BannerRow>

      {/* Stats Banner */}

      {/* Product Categories Section */}
      <SectionContainer>
        <SectionTitle>Khám phá phong cách của bạn</SectionTitle>
        <CategoriesGrid>
          {collections.map((collection, index) => (
            <CategoryCard key={index}>
              <CategoryLink
                to={`/product-type/${removeVietnameseTones(
                  collection.category
                )}`}
              >
                <CategoryImage
                  src={collection.image}
                  alt={collection.category}
                />
                <CategoryTitle>{collection.category}</CategoryTitle>
              </CategoryLink>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </SectionContainer>

      {/* Promotions Section */}
      <SectionContainer>
        <SectionTitle>Các ưu đãi đặc biệt</SectionTitle>
        <PromotionsGrid>
          {/* Thẻ "15% Off Hot Sale" thực chất là loại có discount lớn nhất */}
          {discountedTypes.length > 0 && (
            <PromotionCard key={discountedTypes[0]._id}>
              <PromotionImage
                src={imageMap[discountedTypes[0]._id] || shop1Banner}
                alt={discountedTypes[0]._id}
              />
              <PromotionOverlay>
                <PromotionTitle>{discountedTypes[0]._id}</PromotionTitle>
                <PromotionSubtitle>
                  Giảm đến {discountedTypes[0].maxDiscount}%
                </PromotionSubtitle>
                <PromotionButton
                  onClick={() =>
                    navigate(
                      `/product-type/${removeVietnameseTones(
                        discountedTypes[0]._id
                      )}`
                    )
                  }
                >
                  Mua ngay
                </PromotionButton>
              </PromotionOverlay>
            </PromotionCard>
          )}

          {/* 3 loại tiếp theo có discount cao tiếp theo */}
          {discountedTypes.slice(1, 4).map((item) => {
            const image = imageMap[item._id] || shop5banner;
            return (
              <PromotionCard key={item._id}>
                <PromotionImage src={image} alt={item._id} />
                <PromotionOverlay>
                  <PromotionTitle>{item._id}</PromotionTitle>
                  <PromotionSubtitle>
                    Giảm đến {item.maxDiscount}%
                  </PromotionSubtitle>
                  <PromotionButton
                    onClick={() =>
                      navigate(
                        `/product-type/${removeVietnameseTones(item._id)}`
                      )
                    }
                  >
                    Mua ngay
                  </PromotionButton>
                </PromotionOverlay>
              </PromotionCard>
            );
          })}
        </PromotionsGrid>
      </SectionContainer>
    </HomeContainer>
  );
};

// Styled Components
const HomeContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const HeroSection = styled.section`
  margin-bottom: 30px;
`;

const HeroBanner = styled.div`
  position: relative;
  height: 493px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url(${shop1Banner});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const HeroContent = styled.div`
  text-align: center;
  padding: 20px;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ShopButton = styled.button`
  padding: 12px 30px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #ff7875;
    transform: translateY(-2px);
  }
`;

const MediumBanner = styled.div`
  height: 240px;
  background: url(${shop3Banner});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SmallBanner = styled.div`
  height: 240px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url(${shop2Banner});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SmallBanner2 = styled.div`
  height: 240px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url(${shopwatch});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SmallBanner3 = styled.div`
  height: 240px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url(${shopwallet});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const BannerContent = styled.div`
  text-align: center;
  padding: 20px;
`;

const BannerTitle = styled.h2`
  font-size: 2.3rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const BannerText = styled.p`
  font-size: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const BannerButton = styled(ShopButton)`
  padding: 12px 20px;
  font-size: 1.4rem;
`;

const BannerRow = styled.section`
  margin-bottom: 30px;
`;

const TextBanner = styled.div`
  height: 300px;
  background: #f5f5f5;
  border-radius: 12px;
  // padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BannerDescription = styled.p`
  font-size: 2rem;
  margin: 20px 0;
  color: #666;
`;

const ImageBanner = styled.div`
  height: 300px;
  background: url(${shop5banner});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const BannerSubtitle = styled.h3`
  font-size: 2.5rem;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const SectionContainer = styled.section`
  margin-bottom: 50px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 30px;
  color: #333;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const CategoryCard = styled.div`
  background: white;
  height: 400px;
  border-radius: 12px;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CategoryLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  padding-top: 50px;
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CategoryTitle = styled.h3`
  text-align: center;
  padding: 15px;
  font-size: 2.5rem;
  font-weight: 100;
  color: #333;
`;

const PromotionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PromotionCard = styled.div`
  position: relative;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
`;

const PromotionImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PromotionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
`;

const PromotionTitle = styled.h3`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const PromotionSubtitle = styled.p`
  font-size: 1.7rem;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const PromotionButton = styled(ShopButton)`
  padding: 12px 20px;
  font-size: 1.2rem;
`;

export default HomePage;
