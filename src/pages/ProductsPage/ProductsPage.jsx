import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "antd";
import CardComponent from "../../components/CardComponent/CardComponent";
import * as ProductService from "../../Services/ProductService";
import { ProductsContainer } from "./style";
import SideBar from "../../components/SideBar/SideBar";
import styled from "styled-components";
import { Breadcrumb } from "antd";

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const onChange = (page) => {
    setCurrentPage(page);
    console.log("Trang hiện tại:", page);
  };

  const fetchProductAll = async () => {
    try {
      const res = await ProductService.getAllProduct();
      console.log("Kết quả API:", res); // 🔥 Kiểm tra dữ liệu
      return res;
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      return { data: [] }; // ✅ Trả về mảng rỗng nếu lỗi
    }
  };

  const { isLoading, data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProductAll,
    retry: 3,
    retryDelay: 1000,
  });

  const totalProducts = products?.data?.length || 0; // Lấy tổng số sản phẩm
  console.log("Tổng số sản phẩm:", totalProducts);

  return (
    <>
      <BreadcrumbWrapper>
        <Breadcrumb separator=">">
          <Breadcrumb.Item href="/home">
            <i style={{ fontWeight: "400" }}>Trang chủ</i>{" "}
          </Breadcrumb.Item>

          <Breadcrumb.Item>
            <i>
              <u>Sản phẩm</u>
            </i>
          </Breadcrumb.Item>
        </Breadcrumb>
      </BreadcrumbWrapper>

      <ProductsContainer>
        <SideBar />
        <MainContent>
          {/* Breadcrumb */}

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <CardComponent
              products={products?.data || []}
              totalProducts={totalProducts}
            />
          )}
        </MainContent>
      </ProductsContainer>
    </>
  );
};

export default ProductsPage;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const BreadcrumbWrapper = styled.div`
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  background: #f5f5f5;
  position: relative; /* Giữ vị trí cố định phía trên */
  z-index: 10;
  // box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  // margin-bottom: 8px; /* Đặt khoảng cách 8px với phần dưới */
  margin: 0 auto; /* Căn giữa theo chiều ngang */
  background: transparent;
  max-width: 80vw;
`;
