import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "antd";
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
import { useSelector } from "react-redux";
import BreadcrumbWrapper from "../../components/BreadcrumbWrapper/BreadcrumbWrapper";
import { useLocation, useNavigate } from "react-router";

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [resetProducts, setResetProducts] = useState(false);
  const searchTerm = useSelector((state) => state.product.searchTerm);
  const [limit, setLimit] = useState(8);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState([]);

  const prevPage = useRef(document.referrer);

  useEffect(() => {
    window.history.replaceState(null, "", location.pathname + location.search); // 🚀 Ghi đè lịch sử trang lọc
  }, []);

  const handleBack = () => {
    if (
      prevPage.current &&
      !prevPage.current.includes(window.location.origin)
    ) {
      window.location.href = prevPage.current; // 🔙 Quay về trang trước (nếu khác domain)
    } else {
      navigate(-1); // 🔙 Nếu không có trang trước, quay lại như bình thường
    }
  };

  useEffect(() => {
    if (!location.state?.breadcrumb) {
      navigate(location.pathname + location.search, {
        replace: true,
        state: {
          breadcrumb: [
            { path: "/home", name: "Trang chủ" },
            { path: "/products", name: "Tìm kiếm sản phẩm" },
          ],
        },
      });
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    // Xử lý search params từ URL khi component mount
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
    const [, limit, page, selectedTypes] = queryKey; // Nhận selectedTypes từ queryKey

    try {
      const res = await ProductService.getAllProduct({
        limit: 1000, // 🚀 Lấy toàn bộ sản phẩm để filter cục bộ
        page: 1, // 🚀 Đảm bảo lấy tất cả sản phẩm
        type: selectedTypes.length > 0 ? selectedTypes : undefined, // 🏷 Truyền danh mục nếu có
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
    queryKey: ["products", limit, currentPage, selectedTypes], // 🆕 Theo dõi selectedTypes
    queryFn: fetchProductAll,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (resetProducts) {
      refetch();
      setResetProducts(false);
    }
  }, [resetProducts]);

  const filteredProducts =
    products?.data?.filter((product) => {
      const matchesSearch = searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.type);

      return matchesSearch && matchesType;
    }) || [];

  const totalFilteredProducts = filteredProducts.length;

  const displayedProducts = filteredProducts.slice(0, limit);

  console.log("selectedTypes", selectedTypes);

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
        />
        <MainContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <CardComponent products={displayedProducts} />
          )}

          {totalFilteredProducts > limit ? (
            <WrapperButtonContainer>
              <WrapperButtonMore
                style={{ marginTop: 50 }}
                type="default"
                onClick={() => setLimit((prev) => prev + 8)}
              >
                Xem thêm
              </WrapperButtonMore>
            </WrapperButtonContainer>
          ) : null}
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
