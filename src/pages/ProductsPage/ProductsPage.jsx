import React, { useState } from "react";
import { Pagination } from "antd";
import CardComponent from "../../components/CardComponent/CardComponent";
import {
  ProductsContainer,
  WrapperButtonContainer,
  WrapperButtonMore,
} from "./style";

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const onChange = (page) => {
    setCurrentPage(page);
    console.log("Trang hiện tại:", page);
  };

  return (
    <div>
      <ProductsContainer>
        {Array.from({ length: 70 }).map((_, index) => (
          <CardComponent key={index} />
        ))}
      </ProductsContainer>

      <WrapperButtonContainer>
        <WrapperButtonMore type="default">Xem thêm</WrapperButtonMore>
      </WrapperButtonContainer>

      <WrapperButtonContainer>
        <Pagination
          showQuickJumper
          defaultCurrent={1}
          current={currentPage}
          total={100}
          onChange={onChange}
        />
      </WrapperButtonContainer>
    </div>
  );
};

export default ProductsPage;
