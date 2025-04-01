import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SideBar from "../../components/SideBar/SideBar";
import { Breadcrumb, Button } from "antd";
import styled from "styled-components";
import CardComponent from "../../components/CardComponent/CardComponent";
import { getProductType } from "../../Services/ProductService";
import BreadcrumbWrapper from "../../components/BreadcrumbWrapper/BreadcrumbWrapper";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setProducts } from "../../redux/slices/productSlice";

// Mapping danh mục không dấu sang có dấu
const categoryMapping = {
  "quan-nam": "Quần nam",
  "ao-nam": "Áo nam",
  "dong-ho": "Đồng hồ",
  "ao-nu": "Áo nữ",
  "quan-nu": "Quần nữ",
  "tui-xach": "Túi xách",
  "trang-suc": "Trang sức",
  vi: "Ví",
};

const slugify = (str) =>
  str
    .normalize("NFD") // Chuyển thành dạng Unicode chuẩn
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .toLowerCase()
    .replace(/\s+/g, "-"); // Thay dấu cách bằng dấu `-`

const TypeProductPage = () => {
  const { type } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Lấy giá trị lọc từ URL
  const searchParams = new URLSearchParams(location.search);
  const minPriceFromUrl = parseInt(searchParams.get("minPrice")) || 0;
  const maxPriceFromUrl = parseInt(searchParams.get("maxPrice")) || Infinity;

  const ratingsFromUrl = searchParams.get("ratings");
  const [selectedRatings, setSelectedRatings] = useState(
    ratingsFromUrl ? ratingsFromUrl.split(",").map(Number) : []
  );

  const handleRatingFilter = (ratings) => {
    setSelectedRatings(ratings);
    setLimit(8); // Reset limit khi thay đổi bộ lọc

    // Cập nhật URL
    const newSearchParams = new URLSearchParams(location.search);
    if (ratings.length === 0) {
      newSearchParams.delete("ratings");
    } else {
      newSearchParams.set("ratings", ratings.join(","));
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  // State quản lý khoảng giá
  const [priceRange, setPriceRange] = useState({
    min: minPriceFromUrl,
    max: maxPriceFromUrl,
  });

  const formattedType =
    Object.entries(categoryMapping).find(([slug]) => slug === type)?.[1] ||
    type.replace(/-/g, " ");

  const [limit, setLimit] = useState(8);

  // Fetch sản phẩm theo type
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", formattedType, priceRange],
    queryFn: () => getProductType({ type: formattedType }),
  });

  console.log("products", products);

  useEffect(() => {
    if (products) {
      dispatch(setProducts(products)); // Cập nhật Redux mỗi khi dữ liệu thay đổi
    }
  }, [products, dispatch]);

  // Xử lý khi thay đổi giá từ SideBar
  const handlePriceFilter = ({ min, max }) => {
    setPriceRange({ min, max });
    setLimit(8); // Reset limit khi thay đổi bộ lọc

    // Cập nhật URL
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("minPrice", min);
    newSearchParams.set("maxPrice", max === Infinity ? "" : max);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  // Lọc sản phẩm theo type và khoảng giá
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const matchesType = product.type === formattedType;
      const matchesPrice =
        product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesRating =
        selectedRatings.length === 0 ||
        (product.rating && Math.floor(product.rating) >= selectedRatings[0]);

      return matchesType && matchesPrice && matchesRating;
    });
  }, [products, formattedType, priceRange, selectedRatings]);

  // Hiển thị sản phẩm theo limit
  const displayedProducts = filteredProducts.slice(0, limit);
  const totalProducts = filteredProducts.length;

  // Xử lý khi load trang với params từ URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const min = searchParams.get("minPrice");
    const max = searchParams.get("maxPrice");

    if (min || max) {
      setPriceRange({
        min: min ? parseInt(min) : 0,
        max: max ? parseInt(max) : Infinity,
      });
    }
  }, [location.search]);

  // Reset bộ lọc
  const resetFilters = () => {
    setPriceRange({ min: 0, max: Infinity });
    setSelectedTypes([]);
    setSelectedRatings([]);

    // Cập nhật bộ lọc trong Sidebar
    if (typeof onPriceFilter === "function") {
      onPriceFilter({ min: 0, max: Infinity });
    }
    if (typeof onRatingFilter === "function") {
      onRatingFilter([]);
    }

    // Xóa params trên URL
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("minPrice");
    newSearchParams.delete("maxPrice");
    newSearchParams.delete("ratings");

    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  return (
    <>
      <br />
      <BreadcrumbWrapper
        breadcrumb={[
          { path: "/home", name: "Trang chủ" },
          { path: `/product-type/${type}`, name: formattedType },
        ]}
      />

      <div style={{ minHeight: "100vh" }}>
        <PageLayout>
          <SideBarContainer>
            <SideBar
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              onPriceFilter={handlePriceFilter}
              onRatingFilter={handleRatingFilter}
            />
          </SideBarContainer>

          <ProductContainer>
            {isLoading ? (
              <p>Đang tải...</p>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <p>Không tìm thấy sản phẩm phù hợp</p>
                <Button type="primary" onClick={resetFilters}>
                  Xoá bộ lọc
                </Button>
              </div>
            ) : (
              <CardComponent
                products={displayedProducts.map((product) => ({
                  ...product,
                  link: (
                    <Link
                      to={`/product-details/${product.id}`}
                      state={{
                        breadcrumb: [
                          { path: "/home", name: "Trang chủ" },
                          {
                            path: `/product-type/${type}`,
                            name: formattedType,
                          },
                          {
                            path: `/product-details/${product.id}`,
                            name: product.name,
                          },
                        ],
                        fromTypePage: true,
                      }}
                    >
                      <h3>{product.name}</h3>
                    </Link>
                  ),
                }))}
              />
            )}

            {totalProducts > limit && (
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
          </ProductContainer>
        </PageLayout>
      </div>
    </>
  );
};

export default TypeProductPage;

// Styled Components

const PageLayout = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 100px;
  max-width: 1900px;
  margin: 0 auto;
  padding: 20px;
`;

const SideBarContainer = styled.div`
  width: 250px;
  flex-shrink: 0;
`;

const ProductContainer = styled.div`
  flex: 1;
`;

const WrapperButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 50px;
  text-align: center;
`;

const WrapperButtonMore = styled(Button)`
  border: 1px solid rgb(11, 116, 229);
  color: rgb(11, 116, 229);
  width: 240px;
  height: 38px;
  font-weight: 500;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: rgb(18, 96, 190) !important;
    span {
      color: #fff;
    }
  }
`;
