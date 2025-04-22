import React, { useEffect, useMemo } from "react";
import ProductDetailsComponent from "../../components/ProductDetailsComponent/ProductDetailsComponent";
import { MainContent } from "./style";
import { useParams, useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getDetailProduct } from "../../Services/ProductService";
import ReviewComponent from "../../components/ReviewComponent/ReviewComponent";
import ProductList from "../../components/SimilarProductComponent/SimilarProduct";
import BreadcrumbWrapper from "../../components/BreadcrumbWrapper/BreadcrumbWrapper";
import { useDispatch } from "react-redux";
import { setProductDetail } from "../../redux/slices/productSlice";
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

const ProductDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const productId = useMemo(() => id.match(/[a-f0-9]{24}$/)?.[0], [id]);

  const {
    isLoading,
    data: productDetail,
    error,
    refetch: refetchProductDetail,
  } = useQuery({
    queryKey: ["productDetail", productId],
    queryFn: () => getDetailProduct(productId),
    enabled: !!productId,
  });

  const productType = productDetail?.data?.type || "Không xác định";

  const handleReviewSubmitted = () => {
    refetchProductDetail();
  };

  useEffect(() => {
    if (!location.state?.breadcrumb && productDetail?.data) {
      const typeSlug = slugify(productDetail.data.type);
      navigate(location.pathname, {
        replace: true,
        state: {
          breadcrumb: [
            { path: "/home", name: "Trang chủ" },
            {
              path: `/product-type/${typeSlug}`,
              name: productDetail.data.type,
            },
            { path: location.pathname, name: productDetail.data.name },
          ],
        },
      });
    }
  }, [location, navigate, productDetail]);

  useEffect(() => {
    if (productDetail?.status === "OK") {
      dispatch(setProductDetail(productDetail.data));
    }
  }, [productDetail, dispatch]);

  return (
    <div style={{ margin: "20px 0" }}>
      <BreadcrumbWrapper breadcrumb={location.state?.breadcrumb} />
      <MainContent>
        {isLoading ? (
          <></>
        ) : error ? (
          <p>Lỗi khi tải sản phẩm: {error.message}</p>
        ) : productDetail?.status === "OK" ? (
          <>
            <ProductDetailsComponent product={productDetail.data} />
            <ProductList productType={productType} />
            <h2>Comments</h2>
            <ReviewComponent
              productId={productId}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </>
        ) : (
          <p>Không tìm thấy sản phẩm</p>
        )}
      </MainContent>
    </div>
  );
};

export default ProductDetailsPage;
