import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CardComponent from "../../components/CardComponent/CardComponent";
import styled from "styled-components";
import SideBar from "../../components/SideBar/SideBar";
import { useLocation, useNavigate } from "react-router";
import { Button } from "antd";

const SaleOffPage = () => {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(8);
  const [types, setTypes] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Lọc theo khoảng giá
  const searchParams = new URLSearchParams(location.search);
  const minPriceFromUrl = parseInt(searchParams.get("minPrice")) || 0;
  const maxPriceFromUrl = parseInt(searchParams.get("maxPrice")) || Infinity;
  const ratingsFromUrl = searchParams.get("ratings");
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [priceRange, setPriceRange] = useState({
    min: minPriceFromUrl,
    max: maxPriceFromUrl,
  });
  const [selectedRatings, setSelectedRatings] = useState(
    ratingsFromUrl ? ratingsFromUrl.split(",").map(Number) : []
  );

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3002/api/product/discount-15"
        );
        setDiscountedProducts(response.data.products);
        setTypes(response.data.types);
      } catch (err) {
        console.error("❌ Lỗi khi lấy sản phẩm giảm giá:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  console.log("discountedProducts", discountedProducts);
  console.log("types", types);

  const handlePriceFilter = ({ min, max }) => {
    setPriceRange({ min, max });
    setLimit(8);

    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("minPrice", min);
    newSearchParams.set("maxPrice", max === Infinity ? "" : max);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  const handleRatingFilter = (ratings) => {
    setSelectedRatings(ratings);
    setLimit(8);

    const newSearchParams = new URLSearchParams(location.search);
    if (ratings.length === 0) {
      newSearchParams.delete("ratings");
    } else {
      newSearchParams.set("ratings", ratings.join(","));
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  const filteredProducts = useMemo(() => {
    if (!discountedProducts) return [];

    return discountedProducts.filter((product) => {
      const matchesPrice =
        product.price >= priceRange.min && product.price <= priceRange.max;

      const matchesRating =
        selectedRatings.length === 0 ||
        (product.rating && Math.floor(product.rating) >= selectedRatings[0]);

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.type);

      return matchesPrice && matchesRating && matchesType;
    });
  }, [discountedProducts, priceRange, selectedRatings, selectedTypes]);

  const displayedProducts = filteredProducts.slice(0, limit);
  const totalProducts = filteredProducts.length;

  const resetFilters = () => {
    setPriceRange({ min: 0, max: Infinity });
    setSelectedRatings([]);

    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("minPrice");
    newSearchParams.delete("maxPrice");
    newSearchParams.delete("ratings");

    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  return (
    <>
      <br />
      <Title>🎉 Sản phẩm giảm giá từ 15% trở lên</Title>
      <br />
      <Wrapper>
        <SideBar
          onPriceFilter={handlePriceFilter}
          onRatingFilter={handleRatingFilter}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          types={types}
        />

        <ProductContainer>
          {loading ? (
            <Loading>Đang tải sản phẩm...</Loading>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>Không tìm thấy sản phẩm phù hợp</p>
              <Button type="primary" onClick={resetFilters}>
                Xoá bộ lọc
              </Button>
            </div>
          ) : (
            <>
              <CardComponent
                products={displayedProducts}
                totalProducts={displayedProducts.length}
              />
              {totalProducts > limit && (
                <WrapperButtonContainer>
                  <WrapperButtonMore
                    type="default"
                    onClick={() => setLimit((prev) => prev + 8)}
                  >
                    Xem thêm
                  </WrapperButtonMore>
                </WrapperButtonContainer>
              )}
            </>
          )}
        </ProductContainer>
      </Wrapper>
    </>
  );
};

export default SaleOffPage;

// Styled Components

const Wrapper = styled.div`
  padding: 0;
  display: flex;
  flex-direction: row;
  gap: 20px;
  min-height: 100vh;
`;

const ProductContainer = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  padding-left: 30px;
`;

const Loading = styled.p`
  font-size: 16px;
  margin-top: 20px;
`;

const WrapperButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 50px;
  text-align: center;
`;

const WrapperButtonMore = styled(Button)`
  border: 1px solid rgb(11, 116, 229);
  color: rgb(11, 116, 229);
  width: 240px;
  height: 38px;
  font-weight: 500;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: rgb(18, 96, 190) !important;
    span {
      color: #fff;
    }
  }
`;
