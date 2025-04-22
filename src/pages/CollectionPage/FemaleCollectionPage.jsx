import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import bannerImg from "/src/assets/24c7b6bc82dec49ffce7f23a0822109f.png";
import inspireImg from "/src/assets/VIETNAM_INTERNATIONAL_FASHION_WEEK_2020_.jpg";

const FemalePageWrapper = styled.div`
  padding: 0;
  font-family: "Segoe UI", sans-serif;
`;

const Banner = styled.div`
  width: 100%;
  height: 600px;
  background-image: url(${bannerImg});
  background-size: cover;
  background-position: center;
  border-bottom: 4px solid #e0e0e0;
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
  color: #c2185b;
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

const FemaleCollectionPage = () => {
  const navigate = useNavigate();

  const collections = [
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
  ];

  return (
    <FemalePageWrapper>
      <Banner />
      <ContentSection>
        <SectionTitle>Khơi nguồn cảm hứng thời trang</SectionTitle>
        <Description>
          Hãy để phong cách kể câu chuyện của bạn. Bộ sưu tập dành cho nữ được
          tuyển chọn tinh tế, mang đến sự tự tin, thanh lịch và hiện đại trong
          từng chi tiết.
        </Description>
        <InspireImage src={inspireImg} alt="Phong cách nữ tính" />
        <SectionTitle>Khám phá Bộ sưu tập</SectionTitle>
      </ContentSection>
      <CardGrid>
        {collections.map((col, idx) => (
          <CategoryCard key={idx} onClick={() => navigate(col.path)}>
            <img src={col.image} alt={col.title} />
            <h4>{col.title}</h4>
          </CategoryCard>
        ))}
      </CardGrid>
    </FemalePageWrapper>
  );
};

export default FemaleCollectionPage;
