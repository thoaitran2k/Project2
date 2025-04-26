// MaleCollectionPage.jsx
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import bannerImg from "/src/assets/banner-nam.png"; // thay bằng ảnh banner phù hợp cho nam
import inspireImg from "/src/assets/inspire-men.jpg"; // thay bằng ảnh truyền cảm hứng cho nam

const MalePageWrapper = styled.div`
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
  color: #1976d2;
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

const MaleCollectionPage = () => {
  const navigate = useNavigate();

  const collections = [
    {
      title: "Áo nam",
      image: "/src/assets/ao-nam.jpg",
      path: "/product-type/ao-nam",
    },
    {
      title: "Quần nam",
      image: "/src/assets/quan-nam.jpg",
      path: "/product-type/quan-nam",
    },
    {
      title: "Phụ kiện",
      image: "/src/assets/phu-kien-nam.jpg",
      path: "/product-type/phu-kien-nam",
    },
    {
      title: "Giày nam",
      image: "/src/assets/giay-nam.jpg",
      path: "/product-type/giay-nam",
    },
  ];

  return (
    <MalePageWrapper>
      <Banner />
      <ContentSection>
        <SectionTitle>Khám phá phong cách nam giới</SectionTitle>
        <Description>
          Phong cách không chỉ là vẻ ngoài mà là tuyên ngôn của cá tính. Bộ sưu
          tập thời trang nam mang đến sự mạnh mẽ, thanh lịch và đậm chất hiện
          đại.
        </Description>
        <InspireImage src={inspireImg} alt="Phong cách nam tính" />
        <SectionTitle>Bộ sưu tập nổi bật</SectionTitle>
      </ContentSection>
      <CardGrid>
        {collections.map((col, idx) => (
          <CategoryCard key={idx} onClick={() => navigate(col.path)}>
            <img src={col.image} alt={col.title} />
            <h4>{col.title}</h4>
          </CategoryCard>
        ))}
      </CardGrid>
    </MalePageWrapper>
  );
};

export default MaleCollectionPage;
