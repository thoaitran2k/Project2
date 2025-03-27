import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!location.state?.breadcrumb) {
      navigate(location.pathname, {
        replace: true,
        state: {
          breadcrumb: [
            { path: "/home", name: "Trang chủ" },
            { path: "/products", name: "Tìm kiếm sản phẩm" },
          ],
        },
      });
    }
  }, [location, navigate]);

  const fetchProductAll = async ({ queryKey }) => {
    const [, limit, page] = queryKey;
    try {
      const res = await ProductService.getAllProduct({
        limit: 1000, // 🚀 Lấy toàn bộ sản phẩm một lần
        page: 1, // 🚀 Đảm bảo lấy tất cả sản phẩm để filter cục bộ
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
    queryKey: ["products", limit, currentPage],
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

  // 🏷 Lọc sản phẩm dựa trên tìm kiếm
  const filteredProducts = searchTerm.trim()
    ? products?.data?.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    : products?.data || [];

  const totalFilteredProducts = filteredProducts.length;

  // 📌 Hiển thị số lượng sản phẩm dựa trên limit
  const displayedProducts = filteredProducts.slice(0, limit);

  return (
    <>
      <br />
      <BreadcrumbWrapper />
      <SearchComponent setLimit={setLimit} />
      <ProductsContainer>
        <SideBar />
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
