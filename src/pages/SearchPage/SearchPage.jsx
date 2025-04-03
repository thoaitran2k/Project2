import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Pagination } from "antd";
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
import { useDispatch, useSelector } from "react-redux";
import BreadcrumbWrapper from "../../components/BreadcrumbWrapper/BreadcrumbWrapper";
import { useLocation, useNavigate } from "react-router";
import { setSearchTerm, setProducts } from "../../redux/slices/productSlice";
import { AnimatePresence, motion } from "framer-motion";
import { useSearch } from "../../components/Layout/SearchContext";
import TypeProductsList from "./TypeProductsList";

const SearchPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [types, setTypes] = useState([]);
  const [resetProducts, setResetProducts] = useState(false);
  const searchTerm = useSelector((state) => state.product.searchTerm);
  const [limit, setLimit] = useState(8);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedTypes, setSelectedTypes] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const minPriceFromUrl = parseInt(searchParams.get("minPrice")) || 0;
  const maxPriceFromUrl = parseInt(searchParams.get("maxPrice")) || Infinity;
  const ratingsFromUrl = searchParams.get("ratings");
  const [selectedRating, setSelectedRating] = useState(
    ratingsFromUrl ? parseInt(ratingsFromUrl) : 0
  );

  const { isSearchOpen, toggleSearch } = useSearch();

  // useEffect(() => {
  //   const searchParams = new URLSearchParams(location.search);

  //   // Chỉ đóng SearchPage nếu trước đó nó đang mở và search đã bị xóa khỏi URL
  //   if (!searchParams.has("?search") && isSearchOpen) {
  //     toggleSearch();
  //   }
  // }, [location.search]);

  // useEffect(() => {
  //   toggleSearch();
  // }, [location]);

  //if (!isSearchOpen) return null;

  const handleRatingFilter = (rating) => {
    const newRating = rating.length > 0 ? rating[0] : 0;
    setSelectedRating(newRating);

    const newSearchParams = new URLSearchParams(location.search);
    if (newRating === 0) {
      newSearchParams.delete("ratings");
    } else {
      newSearchParams.set("ratings", newRating);
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  // useEffect(() => {
  //   const searchParams = new URLSearchParams(location.search);
  //   setIsSearchOpen(searchParams.has("search"));

  //   if (!location.state?.breadcrumb) {
  //     navigate(location.pathname + location.search, {
  //       replace: true,
  //       state: {
  //         breadcrumb: [
  //           { path: "/home", name: "Trang chủ" },
  //           { path: "/products", name: "Tìm kiếm sản phẩm" },
  //         ],
  //       },
  //     });
  //   }
  // }, [location.search]);

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedRating(0);

    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("minPrice");
    newSearchParams.delete("maxPrice");
    newSearchParams.delete("ratings");
    newSearchParams.delete("type");
    newSearchParams.delete("search");
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  const prevPage = useRef(document.referrer);

  useEffect(() => {
    window.history.replaceState(null, "", location.pathname + location.search);
  }, []);

  const handleBack = () => {
    if (
      prevPage.current &&
      !prevPage.current.includes(window.location.origin)
    ) {
      window.location.href = prevPage.current;
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
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
    const [, limit, page, selectedTypes] = queryKey;

    try {
      const res = await ProductService.getAllProduct({
        limit: 1000,
        page: 1,
        type: selectedTypes.length > 0 ? selectedTypes : undefined,
      });
      return res;
    } catch (error) {
      console.error("🚨 Lỗi API:", error);
      return { data: [], total: 0 };
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await ProductService.getAllTypeProduct();
        const data = response.data;
        setTypes(data); // Giữ nguyên dạng mảng string
      } catch (error) {
        console.error("🚨 Lỗi lấy danh mục:", error.message);
        setTypes([]);
      }
    };
    fetchCategories();
  }, []);

  const {
    isLoading,
    data: products = { data: [], total: 0 },
    refetch,
  } = useQuery({
    queryKey: ["products", limit, currentPage, selectedTypes],
    queryFn: fetchProductAll,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (products?.data) {
      dispatch(setProducts(products.data));
    }
  }, [products, dispatch]);

  useEffect(() => {
    if (resetProducts) {
      refetch();
      setResetProducts(false);
    }
  }, [resetProducts]);

  const filteredProducts = useMemo(() => {
    if (!products?.data) return [];

    return products.data.filter((product) => {
      const matchesSearch = searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.type);

      const productPrice = product.price || 0;
      const matchesPrice =
        productPrice >= minPriceFromUrl && productPrice <= maxPriceFromUrl;

      const productRating = Math.floor(product.rating || 0);
      const matchesRating =
        selectedRating === 0 || productRating >= selectedRating;

      return matchesSearch && matchesType && matchesPrice && matchesRating;
    });
  }, [
    products,
    searchTerm,
    selectedTypes,
    minPriceFromUrl,
    maxPriceFromUrl,
    selectedRating,
  ]);

  const totalFilteredProducts = filteredProducts.length;

  const displayedProducts = filteredProducts.slice(0, limit);

  // const handleCloseSearch = () => {
  //   setIsSearchOpen(false);
  //   setTimeout(() => {
  //     navigate("/home");
  //   }, 500);
  // };

  // useEffect(() => {
  //   const newSearchParams = new URLSearchParams(location.search);

  //   if (selectedTypes.length > 0) {
  //     newSearchParams.set("type", selectedTypes.join(","));
  //   } else {
  //     newSearchParams.delete("type");
  //   }

  //   navigate(`${location.pathname}?${newSearchParams.toString()}`, {
  //     replace: true,
  //   });
  // }, [selectedTypes]);

  return (
    // <motion.div
    //   initial={{ y: -100, opacity: 0 }}
    //   animate={{ y: 0, opacity: 1 }}
    //   exit={{ y: -100, opacity: 0 }}
    //   transition={{ duration: 0.5 }}
    // >
    // <div style={{ position: "relative" }}>
    //   <AnimatePresence>
    //     <motion.div
    //       initial={{ y: "100%", opacity: 0 }}
    //       animate={{ y: 0, opacity: 1 }}
    //       exit={{ y: "100%", opacity: 0 }}
    //       transition={{ duration: 100, ease: "easeOut" }}
    //       style={{
    //         position: "fixed", // Giữ vị trí cố định
    //         bottom: 0,
    //         left: 0,
    //         width: "100%",
    //         height: "100vh",
    //         background: "white",
    //         zIndex: 1000, // Đảm bảo hiển thị trên cùng
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     ></motion.div>

    //     <div
    //       onClick={() => {
    //         //setIsSearchOpen(false);
    //         navigate("/home");
    //       }}
    //       style={{
    //         position: "absolute",
    //         top: "0",
    //         right: "20px",
    //         background: "transparent  ",
    //         padding: "10px",
    //         border: "none !important",
    //         color: "black",
    //         fontSize: "18px",
    //         cursor: "pointer",
    //         zIndex: 500, // Đảm bảo nút X không bị che khuất
    //       }}
    //     >
    //       ✖
    //     </div>
    //   </AnimatePresence>
    <>
      <br />
      {/* <FullScreenWrapper> */}
      <SearchComponent setLimit={setLimit} />
      <TypeProductsList
        types={types}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <ProductsContainer>
        <MainContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>Không tìm thấy sản phẩm phù hợp</p>
              {/* <Button type="primary" onClick={resetFilters}>
                  Xoá bộ lọc
                </Button> */}
            </div>
          ) : (
            <CardComponent products={displayedProducts} />
          )}

          {totalFilteredProducts > limit && (
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
        </MainContent>
      </ProductsContainer>
      {/* </FullScreenWrapper> */}
    </>
    // </div>
    // </motion.div>
  );
};

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  width: 100%;
  min-width: 98vw;
`;

const TypeListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 8px;
  margin: 16px 0;
`;

const TypeButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${(props) => (props.$isSelected ? "#1890ff" : "#d9d9d9")};
  background-color: ${(props) => (props.$isSelected ? "#e6f7ff" : "white")};
  color: ${(props) => (props.$isSelected ? "#1890ff" : "inherit")};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
`;

const FullScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Đảm bảo chiếm trọn màn hình */
  width: 100%;
  position: relative; /* Để có thể thêm các component khác vào */
  background-color: white; /* Hoặc bạn có thể dùng màu nền tùy ý */
  justify-content: center;
`;

export default SearchPage;
