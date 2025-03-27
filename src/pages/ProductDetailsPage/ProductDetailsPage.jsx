import React, { useEffect } from "react";
import ProductDetailsComponent from "../../components/ProductDetailsComponent/ProductDetailsComponent";
import { MainContent } from "./style";
import { Breadcrumb } from "antd";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { getDetailsProductById } from "../../redux/slices/productSlice";
import ReviewComponent from "../../components/ReviewComponent/ReviewComponent";
import SimilarProductList from "../../components/SimilarProductComponent/SimilarProduct";
import BreadcrumbWrapper from "../../components/BreadcrumbWrapper/BreadcrumbWrapper";
import { useLocation, useNavigate } from "react-router";
//import slugify from "slugify";

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/đ/g, "d") // Đổi 'đ' thành 'd'
    .normalize("NFD") // Chuyển thành dạng Unicode chuẩn
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/\s+/g, "-"); // Thay dấu cách bằng '-'

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { productDetail, loading, error } = useSelector(
    (state) => state.product
  );

  const productId = id.match(/[a-f0-9]{24}$/)?.[0];

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.breadcrumb && productDetail?.data) {
      const typeSlug = slugify(productDetail.data.type, { lower: true }); // Chuyển về dạng không dấu

      navigate(location.pathname, {
        replace: true,
        state: {
          breadcrumb: [
            { path: "/home", name: "Trang chủ" },
            {
              path: `/product-type/${typeSlug}`, // Slug URL
              name: productDetail.data.type, // Hiển thị có dấu
            },
            { path: location.pathname, name: productDetail.data.name },
          ],
        },
      });
    }
  }, [location, navigate, productDetail]);

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

  return (
    <div style={{ margin: "20px 0" }}>
      <>
        <BreadcrumbWrapper breadcrumb={location.state?.breadcrumb} />
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
