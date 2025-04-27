import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Pagination } from "antd";
import CardComponent from "../../components/CardComponent/CardComponent";
import * as ProductService from "../../Services/ProductService";
import {
  ProductsContainer,
  WrapperButtonMore,
  WrapperButtonContainer,
} from "./style";
import SideBar from "../../components/SideBar/SideBar";
import styled from "styled-components";
import { Breadcrumb } from "antd";
import SearchComponent from "../../components/SearchComponent/SearchComponent";
import { useDispatch, useSelector } from "react-redux";
import BreadcrumbWrapper from "../../components/BreadcrumbWrapper/BreadcrumbWrapper";
import { useLocation, useNavigate } from "react-router";
import { setSearchTerm, setProducts } from "../../redux/slices/productSlice";

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [resetProducts, setResetProducts] = useState(false);
  const searchTerm = useSelector((state) => state.product.searchTerm);
  const [limit, setLimit] = useState(8);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedTypes, setSelectedTypes] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const minPriceFromUrl = parseInt(searchParams.get("minPrice")) || 0;
  const maxPriceFromUrl = parseInt(searchParams.get("maxPrice")) || Infinity;
  const ratingsFromUrl = searchParams.get("ratings");
  const [selectedRating, setSelectedRating] = useState(
    ratingsFromUrl ? parseInt(ratingsFromUrl) : 0
  );

  const handleRatingFilter = (rating) => {
    const newRating = rating.length > 0 ? rating[0] : 0;
    setSelectedRating(newRating);

    // Cập nhật URL
    const newSearchParams = new URLSearchParams(location.search);
    if (newRating === 0) {
      newSearchParams.delete("ratings");
    } else {
      newSearchParams.set("ratings", newRating);
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  const resetFilters = () => {
    //setPriceRange({ min: 0, max: Infinity });
    setSelectedTypes([]);
    setSelectedRating(0);
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("minPrice");
    newSearchParams.delete("maxPrice");
    newSearchParams.delete("ratings");
    newSearchParams.delete("type");
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  const prevPage = useRef(document.referrer);

  useEffect(() => {
    window.history.replaceState(null, "", location.pathname + location.search);
  }, []);

  const handleBack = () => {
    if (
      prevPage.current &&
      !prevPage.current.includes(window.location.origin)
    ) {
      window.location.href = prevPage.current;
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTermFromUrl = searchParams.get("search");
    const typesFromUrl = searchParams.get("type");

    if (searchTermFromUrl) {
      dispatch(setSearchTerm(searchTermFromUrl));
    }

    if (typesFromUrl) {
      setSelectedTypes(typesFromUrl.split(","));
    }
  }, [location.search]);

  const fetchProductAll = async ({ queryKey }) => {
    const [, limit, page, selectedTypes] = queryKey;

    try {
      const res = await ProductService.getAllProduct({
        limit: 1000,
        page: 1,
        type: selectedTypes.length > 0 ? selectedTypes : undefined,
      });
      return res;
    } catch (error) {
      console.error("🚨 Lỗi API:", error);
      return { data: [], total: 0 };
    }
  };

  const {
    isLoading,
    data: products = { data: [], total: 0 },
    refetch,
  } = useQuery({
    queryKey: ["products", limit, currentPage, selectedTypes],
    queryFn: fetchProductAll,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (products?.data) {
      dispatch(setProducts(products.data));
    }
  }, [products, dispatch]);

  useEffect(() => {
    const ratingFromUrl = searchParams.get("ratings");
    if (ratingFromUrl) {
      setSelectedRating(parseInt(ratingFromUrl));
    }
  }, [location.search]);

  useEffect(() => {
    if (resetProducts) {
      refetch();
      setResetProducts(false);
    }
  }, [resetProducts]);

  const filteredProducts = useMemo(() => {
    if (!products?.data) return [];

    return products.data.filter((product) => {
      const matchesSearch = searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.type);

      const productPrice = product.price || 0;
      const matchesPrice =
        productPrice >= minPriceFromUrl && productPrice <= maxPriceFromUrl;

      const productRating = Math.floor(product.rating || 0);
      const matchesRating =
        selectedRating === 0 || productRating >= selectedRating;

      return matchesSearch && matchesType && matchesPrice && matchesRating;
    });
  }, [
    products,
    searchTerm,
    selectedTypes,
    minPriceFromUrl,
    maxPriceFromUrl,
    selectedRating,
  ]);

  const totalFilteredProducts = filteredProducts.length;

  const displayedProducts = filteredProducts.slice(0, limit);

  return (
    <>
      {/* <button onClick={handleBack}>Quay lại</button> */}
      <br />
      <BreadcrumbWrapper />
      <SearchComponent setLimit={setLimit} />
      <ProductsContainer>
        <SideBar
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          onRatingFilter={handleRatingFilter}
          selectedRatings={selectedRating > 0 ? [selectedRating] : []}
        />
        <MainContent>
          <MainContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <p>Không tìm thấy sản phẩm phù hợp</p>
                <Button type="primary" onClick={resetFilters}>
                  Xoá bộ lọc
                </Button>
              </div>
            ) : (
              <CardComponent products={displayedProducts} />
            )}

            {totalFilteredProducts > limit && (
              <WrapperButtonContainer>
                <WrapperButtonMore
                  style={{ marginTop: 50 }}
                  type="default"
                  onClick={() => setLimit((prev) => prev + 8)}
                >
                  Xem thêm
                </WrapperButtonMore>
              </WrapperButtonContainer>
            )}
          </MainContent>
        </MainContent>
      </ProductsContainer>
    </>
  );
};

export default ProductsPage;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  width: 100%;
`;
