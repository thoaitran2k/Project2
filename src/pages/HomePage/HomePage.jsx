import React, { useState } from "react";
import styled from "styled-components";
import { Card, Row, Col, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SliderComponent from "../../components/SliderComponent/SliderComponent";

import slider1 from "../../assets/slider1.png";
import slider2 from "../../assets/slider2.png";
import slider3 from "../../assets/slider3.png";
import shop1Banner from "../../assets/thiet-ke-shop-quan-ao-a.jpg";
import shop2Banner from "../../assets/thiet-ke-shop-quan-ao-dep.jpg";
import shop3Banner from "../../assets/thiet-ke-shop-quan-ao-nam-4.jpg";
import shop4banner from "../../assets/Cac-san-pham-can-duoc-trung-bay-sao-cho-thu-hut-khach-hang.jpg";
import shop5banner from "../../assets/mua-vi-da-nam-xin-o-dau-tot-chat-luong-tai-tphcm-news-181.jpg";

import shopwallet from "../../assets/the-gioi-bop-da.jpg";
import shopwatch from "../../assets/thiet-ke-shop-dong-ho-1.jpg";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";

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

  const promotions = [
    {
      title: "30% Off Winter Sale",
      image: shop1Banner,
      buttonText: "Shop Now",
    },
    {
      title: "Baby & Kids Clothings",
      image: shop2Banner,
      buttonText: "Shop Now",
    },
    {
      title: "#1 eCommerce Platform",
      stats: "25k+ Client Testimonials",
      image: shop5banner,
      buttonText: "View More",
    },
    {
      title: "Mid Summer Collection",
      description:
        "Đến với chúng tôi, bạn sẽ được trải nghiệm mua hàng theo cách của riêng bạn!",
      image: shop4banner,
      buttonText: "Shop Now",
    },
    {
      title: "Feel Amazing EVERYDAY",
      subtitle: "Kids Bag",
      image: shop5banner,
      buttonText: "Shop Now",
    },
    {
      title: "1 Million",
      subtitle: "Real Customer & Buyers",
      image: shop1Banner,
      buttonText: "Join Now",
    },
  ];

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
                    <HeroTitle>Exclusive Collection for Women</HeroTitle>
                    <ShopButton onClick={handleToTypePageWomenShirt}>
                      Shop now
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
                    <BannerTitle>For Men</BannerTitle>
                    <BannerButton
                      onClick={() => navigate("/product-type/ao-nam")}
                    >
                      Shop Now
                    </BannerButton>
                  </BannerContent>
                </MediumBanner>
              </Col>

              {/* Hai banner nhỏ xếp ngang nhau */}
              <Col xs={8}>
                <SmallBanner>
                  <BannerContent>
                    <BannerTitle>#1 eCommerce Platform</BannerTitle>
                    <BannerText>25k+ Client Testimonials</BannerText>
                  </BannerContent>
                </SmallBanner>
              </Col>
              <Col xs={8}>
                <SmallBanner2>
                  <BannerContent>
                    <BannerTitle>#1 eCommerce Platform</BannerTitle>
                    <BannerText>25k+ Client Testimonials</BannerText>
                  </BannerContent>
                </SmallBanner2>
              </Col>
              <Col xs={8}>
                <SmallBanner3>
                  <BannerContent>
                    <BannerTitle>Mid Summer</BannerTitle>
                    <BannerText>Instant Outlets</BannerText>
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
                <BannerTitle>Feel Amazing EVERYDAY</BannerTitle>
                <BannerSubtitle>Kids Bag</BannerSubtitle>
                <BannerButton onClick={() => navigate("/product-type/vi")}>
                  Shop Now
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
          {promotions.slice(0, 4).map((promo, index) => (
            <PromotionCard key={index}>
              <PromotionImage src={promo.image} alt={promo.title} />
              <PromotionOverlay>
                <PromotionTitle>{promo.title}</PromotionTitle>
                {promo.subtitle && (
                  <PromotionSubtitle>{promo.subtitle}</PromotionSubtitle>
                )}
                <PromotionButton>{promo.buttonText}</PromotionButton>
              </PromotionOverlay>
            </PromotionCard>
          ))}
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
  font-size: 1rem;
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
  background: url(${shop2Banner});
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
    url(${shop3Banner});
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
  padding: 8px 20px;
  font-size: 0.9rem;
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
  font-size: 1.2rem;
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
  grid-template-columns: repeat(4, 1fr); /* Mỗi hàng có tối đa 4 cột */
  gap: 20px;
  margin-top: 20px;

  /* Đảm bảo khi màn hình nhỏ hơn, các sản phẩm vẫn có thể hiển thị đẹp */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr); /* 3 cột trên màn hình trung bình */
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 2 cột trên màn hình nhỏ */
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr); /* 1 cột trên màn hình rất nhỏ */
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
  font-size: 1.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const PromotionSubtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const PromotionButton = styled(ShopButton)`
  padding: 8px 20px;
  font-size: 0.9rem;
`;

export default HomePage;
