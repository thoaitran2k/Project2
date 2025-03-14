import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "antd";
import CardComponent from "../../components/CardComponent/CardComponent";
import * as ProductService from "../../Services/ProductService";
import {
  ProductsContainer,
  WrapperButtonContainer,
  WrapperButtonMore,
} from "./style";
import SideBar from "../../components/SideBar/SideBar";

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

  return (
    <div>
      <ProductsContainer>
        <SideBar />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <CardComponent products={products?.data || []} />
        )}
      </ProductsContainer>
    </div>
  );
};

export default ProductsPage;
