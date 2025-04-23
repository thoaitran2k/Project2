import React, { useEffect, useState } from "react";
import axios from "axios";
import CardComponent from "../../components/CardComponent/CardComponent";
import styled from "styled-components";

const BestSellingProducts = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [bestSellingType, setBestSellingType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3002/api/product/top-sell"
        );
        setTopProducts(response.data.topProducts);
        setBestSellingType(response.data.bestSellingType);
      } catch (err) {
        console.error("❌ Lỗi khi lấy sản phẩm bán chạy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  return (
    <Wrapper>
      <Title>🔥 Top bán chạy</Title>
      {bestSellingType && (
        <SubTitle>
          Loại bán chạy nhất: <strong>{bestSellingType}</strong>
        </SubTitle>
      )}
      <CardComponent
        products={topProducts}
        totalProducts={topProducts.length}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 30px 0;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
`;

const SubTitle = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
`;

export default BestSellingProducts;
