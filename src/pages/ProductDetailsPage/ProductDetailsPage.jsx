import React from "react";
import ProductDetailsComponent from "../../components/ProductDetailsComponent/ProductDetailsComponent";
import { BreadcrumbWrapper } from "./style";
import { Breadcrumb } from "antd";

const ProductDetailsPage = () => {
  return (
    <div style={{ margin: "20px 0" }}>
      <>
        <BreadcrumbWrapper>
          <Breadcrumb separator=">">
            <Breadcrumb.Item href="/home">
              <i style={{ fontWeight: "400" }}>Trang chủ</i>{" "}
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/products">
              <i style={{ fontWeight: "400" }}>Sản phẩm</i>{" "}
            </Breadcrumb.Item>

            <Breadcrumb.Item>
              <i>
                <u>Chi tiết sản phẩm</u>
              </i>
            </Breadcrumb.Item>
          </Breadcrumb>
        </BreadcrumbWrapper>
        <ProductDetailsComponent />
      </>
    </div>
  );
};

export default ProductDetailsPage;
