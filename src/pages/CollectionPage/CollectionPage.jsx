import styled from "styled-components";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import bannerFemale from "/src/assets/24c7b6bc82dec49ffce7f23a0822109f.png";
import inspireFemale from "/src/assets/VIETNAM_INTERNATIONAL_FASHION_WEEK_2020_.jpg";

import bannerMale from "/src/assets/476608439_1222104559615857_3025177431162324102_n.jpg";
import inspireMale from "/src/assets/phong-cach-thoi-trang-nam.jpg";

const PageWrapper = styled.div`
  padding: 0;
  font-family: "Segoe UI", sans-serif;
`;

const Banner = styled.div`
  width: 100%;
  height: 600px;
  background-image: url(${(props) => props.bg});
  background-size: cover;
  background-position: center;
  border-bottom: 4px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: relative;
`;

const ShopNowButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: ${(props) =>
    props.align === "right" ? "flex-end" : "flex-start"};
  padding-top: ${(props) => props.pt || "0"};
  padding-right: ${(props) => props.pr || "40px"};
  padding-bottom: ${(props) => props.pb || "40px"};
  padding-left: ${(props) => props.pl || "40px"};
  box-sizing: border-box;
`;

const ShopNowButton = styled.button`
  margin-bottom: 40px;
  padding: 14px 28px;
  font-size: 16px;
  background-color: ${(props) => props.color || "#1976d2"};
  color: white;
  border: solid 4 px ${(props) => props.borderColor || "white"};
  border-radius: ${(props) => props.borderRadius || "0px"};
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => props.hover || "#125ea4"};
  }
`;

const ContentSection = styled.div`
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 20px;
  color: ${(props) => props.color};
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.7;
  max-width: 800px;
  margin-bottom: 32px;
`;

const InspireImage = styled.img`
  width: 100%;
  max-width: 700px;
  border-radius: 16px;
  margin-bottom: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  padding: 0 32px 64px;
`;

const CategoryCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-6px);
  }

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  h4 {
    padding: 16px;
    font-size: 18px;
    color: #333;
  }
`;

const CollectionPage = () => {
  const { gender } = useParams();
  const navigate = useNavigate();

  const cardRef = useRef();

  const scrollToCards = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const isMale = gender === "nam";

  const data = isMale
    ? {
        banner: bannerMale,
        inspire: inspireMale,
        titleColor: "#1976d2",
        buttonStyle: {
          color: "red",
          hover: "#0d47a1",
          borderColor: "white",
          borderRadius: "0",
          fontSize: "16px",
          padding: "14px 28px",
        },
        mainTitle: "Khám phá phong cách nam giới",
        description:
          "Phong cách không chỉ là vẻ ngoài mà là tuyên ngôn của cá tính. Bộ sưu tập thời trang nam mang đến sự mạnh mẽ, thanh lịch và đậm chất hiện đại.",
        collections: [
          {
            title: "Áo",
            image: "/src/assets/1705390367_chi-phi-thue-mat-bang.jpg",
            path: "/product-type/ao-nam",
          },
          {
            title: "Quần",
            image: "/src/assets/banner.jpg",
            path: "/product-type/quan-nam",
          },
          {
            title: "Đồng hồ",
            image: "/src/assets/dong_ho_cao_cap_banner_3667c87f16.jpg",
            path: "/product-type/dong-ho",
          },
          {
            title: "Ví da",
            image: "/src/assets/vi-nam-v1.webp",
            path: "/product-type/vi",
          },
        ],
      }
    : {
        banner: bannerFemale,
        inspire: inspireFemale,
        titleColor: "#c2185b",
        buttonStyle: {
          color: "#91C9C9",
          hover: "#880e4f",
          borderColor: "white",
          borderRadius: "0px",
          fontSize: "18px",
          padding: "16px 36px",
        },
        mainTitle: "Khơi nguồn cảm hứng thời trang",
        description:
          "Hãy để phong cách kể câu chuyện của bạn. Bộ sưu tập dành cho nữ được tuyển chọn tinh tế, mang đến sự tự tin, thanh lịch và hiện đại trong từng chi tiết.",
        collections: [
          {
            title: "Áo",
            image: "/src/assets/banner-thoi-trang.jpg",
            path: "/product-type/ao-nu",
          },
          {
            title: "Quần",
            image:
              "/src/assets/banner_new_arrival_quan_jean_c0088412ad2d48b79e85dced4512f846.webp",
            path: "/product-type/quan-nu",
          },
          {
            title: "Trang sức",
            image:
              "/src/assets/pngtree-taobao-jewelry-fresh-and-simple-gold-jewelry-poster-picture-image_1034493.jpg",
            path: "/product-type/trang-suc",
          },
          {
            title: "Túi xách",
            image:
              "/src/assets/pngtree-black-and-white-ladies-hand-bag-e-commerce-promotion-background-picture-image_1077272.jpg",
            path: "/product-type/tui-xach",
          },
        ],
      };

  return (
    <PageWrapper>
      <Banner bg={data.banner}>
        <ShopNowButtonWrapper
          align={isMale ? "right" : "left"}
          pt="20px"
          pb={isMale ? "0" : "100px"}
          pl={isMale ? "10px" : "100px"}
          pr={isMale ? "175px" : "10px"}
        >
          <ShopNowButton
            color={data.buttonStyle.color}
            hover={data.buttonStyle.hover}
            borderColor={data.buttonStyle.borderColor}
            borderRadius={data.buttonStyle.borderRadius}
            fontSize={data.buttonStyle.fontSize}
            padding={data.buttonStyle.padding}
            onClick={scrollToCards}
          >
            Xem ngay
          </ShopNowButton>
        </ShopNowButtonWrapper>
      </Banner>
      <ContentSection>
        <SectionTitle color={data.titleColor}>{data.mainTitle}</SectionTitle>
        <Description>{data.description}</Description>
        <InspireImage src={data.inspire} alt="Inspiration" />
        <SectionTitle color={data.titleColor}>Bộ sưu tập nổi bật</SectionTitle>
      </ContentSection>
      <CardGrid ref={cardRef}>
        {data.collections.map((col, idx) => (
          <CategoryCard key={idx} onClick={() => navigate(col.path)}>
            <img src={col.image} alt={col.title} />
            <h4>{col.title}</h4>
          </CategoryCard>
        ))}
      </CardGrid>
    </PageWrapper>
  );
};

export default CollectionPage;
