import React, { useEffect } from "react";
import ProductDetailsComponent from "../../components/ProductDetailsComponent/ProductDetailsComponent";
import { BreadcrumbWrapper, MainContent } from "./style";
import { Breadcrumb } from "antd";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { getDetailsProductById } from "../../redux/slices/productSlice";
import ReviewComponent from "../../components/ReviewComponent/ReviewComponent";

import SimilarProductList from "../../components/SimilarProductComponent/SimilarProduct";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { productDetail, loading, error } = useSelector(
    (state) => state.product
  );

  const productId = id.split("-").pop();

  console.log("ID từ URL:", productId);

  //____________________________________LẤY DỮ LIỆU CHI TIẾT SẢN PHẨM

  useEffect(() => {
    if (productId) {
      dispatch(getDetailsProductById(productId)); // 🚀 Gọi API lấy sản phẩm chi tiết
    }
  }, [dispatch, productId]);

  // const { isLoading, data: product } = useQuery({
  //   queryKey: ["product", id],
  //   queryFn: fetchProductDetails,
  //   retry: 3,
  //   retryDelay: 1000,
  // });

  console.log("Dữ liệu sản phẩm:", productDetail.data);

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
        <MainContent>
          {loading ? (
            <p>Loading...</p>
          ) : productDetail ? (
            <ProductDetailsComponent product={productDetail.data} />
          ) : (
            <p>Không tìm thấy sản phẩm</p>
          )}

          <SimilarProductList />

          <ReviewComponent />
        </MainContent>
      </>
    </div>
  );
};

export default ProductDetailsPage;
