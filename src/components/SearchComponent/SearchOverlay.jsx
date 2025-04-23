import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Button, Row, Col, List, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { setSearchTerm, setProducts } from "../../redux/slices/productSlice";
import axios from "axios";
import { useLocation, useNavigate } from "react-router";
import { useSearch } from "../Layout/SearchContext";
import CardComponent from "../../components/CardComponent/CardComponent";
import TypeProductsList from "./TypeProductsList";
import * as ProductService from "../../Services/ProductService";
import {
  ProductsContainer,
  WrapperButtonMore,
  WrapperButtonContainer,
} from "./style";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useDisableScroll } from "../../hooks/useDisableScroll";
import debounce from "lodash/debounce";

const { Search } = Input;

const SearchOverlay = () => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const isLoading = useSelector((state) => state.loading.isLoading);
  const [resetProducts, setResetProducts] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const searchTerm = useSelector((state) => state.product.searchTerm);
  const [limit, setLimit] = useState(8);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSearchOpen, toggleSearch } = useSearch();
  useDisableScroll(isSearchOpen);
  const [searchLoading, setSearchLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  // State từ SearchPage
  const [currentPage, setCurrentPage] = useState(1);
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);

  // Lấy tham số từ URL
  const searchParams = new URLSearchParams(location.search);
  const minPriceFromUrl = parseInt(searchParams.get("minPrice")) || 0;
  const maxPriceFromUrl = parseInt(searchParams.get("maxPrice")) || Infinity;

  // Fetch danh sách sản phẩm
  const fetchProductAll = async () => {
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

  // Fetch danh mục sản phẩm
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await ProductService.getAllTypeProduct();
        setTypes(response.data || []);
      } catch (error) {
        console.error("🚨 Lỗi lấy danh mục:", error.message);
        setTypes([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch sản phẩm khi có thay đổi
  const { data: products = { data: [], total: 0 } } = useQuery({
    queryKey: ["products", limit, currentPage, selectedTypes],
    queryFn: fetchProductAll,
    retry: 3,
    retryDelay: 1000,
  });

  // Cập nhật Redux store
  useEffect(() => {
    if (products?.data) {
      dispatch(setProducts(products.data));
    }
  }, [products, dispatch]);

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    if (!products?.data) return [];

    const result = products.data.filter((product) => {
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

    // 🔽 Sắp xếp theo thứ tự xuất hiện của selectedTypes
    if (selectedTypes.length > 0) {
      result.sort((a, b) => {
        const indexA = selectedTypes.indexOf(a.type);
        const indexB = selectedTypes.indexOf(b.type);

        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    return result;
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

  // Các hàm xử lý từ SearchOverlay gốc
  useEffect(() => {
    const storedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/product/get-all`
      );
      setAllProducts(response.data || []);
      dispatch(setSearchTerm(""));
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/product/search?query=${query}`
      );

      let products = response.data || [];
      const uniqueProducts = Array.from(
        new Map(
          products.map((item) => [item.name.toLowerCase(), item])
        ).values()
      );

      const sortedProducts = uniqueProducts.sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase());
        const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase());
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      });

      setSuggestions(sortedProducts.slice(0, 5));
    } catch (error) {
      console.error("Lỗi lấy gợi ý:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearch = (value) => {
    const searchParams = new URLSearchParams(location.search);

    setProductLoading(true);

    if (!value.trim()) {
      searchParams.delete("search");
      dispatch(setSearchTerm(""));
      setSearchLoading(false);
    } else {
      searchParams.set("search", value);
      dispatch(setSearchTerm(value));
      setSearchLoading(true);

      const updatedSearches = [
        value,
        ...recentSearches.filter((item) => item !== value),
      ].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }

    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });

    setLimit(8);

    setTimeout(() => {
      setProductLoading(false);
    }, 1000);
  };

  const handleCloseSearch = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete("search");

    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });

    toggleSearch();
  }, [location.search, location.pathname, navigate, toggleSearch]);

  const handleSelectSuggestion = (value) => {
    handleSearch(value);
    setSearchValue(value);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isSearchOpen) {
        handleCloseSearch();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isSearchOpen, handleCloseSearch]);

  const handleClearSearch = () => {
    setSearchValue("");
    setSuggestions([]);
    dispatch(setSearchTerm(""));
    setLimit(8);
    fetchAllProducts();
  };

  //Debounce Search
  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        fetchSuggestions(query);
        setSearchLoading(false);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    let timeoutId;
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {isSearchOpen && (
        <div
          onClick={handleCloseSearch}
          style={{
            textAlign: "right",
            cursor: "pointer",
            marginRight: "20px",
            marginTop: "20px",
            fontSize: "17px",
          }}
        >
          X
        </div>
      )}

      <Row
        justify="center"
        style={{
          marginBottom: "20px",
          position: "relative",
        }}
      >
        <Col span={8}>
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            enterButton={
              <Button
                style={{ backgroundColor: "rgb(60, 201, 211)" }}
                icon={<SearchOutlined />}
              >
                Tìm kiếm
              </Button>
            }
            size="large"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              setShowSuggestions(true);

              if (!value.trim()) {
                handleClearSearch();
              } else {
                setSearchLoading(true); // Hiển thị spinner ngay khi bắt đầu nhập
                debouncedSearch(value.trim());
                handleSearch(value.trim());
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onClear={handleClearSearch}
          />

          {showSuggestions && (
            <List
              bordered
              style={{
                position: "absolute",
                width: "100%",
                zIndex: 1000,
                background: "white",
                cursor: "pointer",
                marginTop: "5px",
                borderRadius: "5px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              }}
              dataSource={
                searchLoading
                  ? [{ name: "loading", disabled: true }]
                  : suggestions.length > 0
                  ? suggestions
                  : [{ name: "Không có sản phẩm", disabled: true }]
              }
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: "10px",
                    cursor: item.disabled ? "default" : "pointer",
                    color: item.disabled ? "gray" : "black",
                    transition: "background 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled)
                      e.currentTarget.style.background = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                  onClick={() =>
                    !item.disabled && handleSelectSuggestion(item.name)
                  }
                >
                  {searchLoading && item.name === "loading" ? (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Spin size="small" />
                    </div>
                  ) : (
                    item.name
                  )}
                </List.Item>
              )}
            />
          )}
        </Col>
      </Row>

      {/* Nội dung hiển thị sản phẩm */}
      <TypeProductsList
        types={types}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <ProductsContainer>
        <MainContent>
          {isLoading || productLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
              }}
            >
              <Spin size="large" tip="Đang tải sản phẩm..." />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <img
                src="/empty-state.png"
                alt="Không có sản phẩm"
                style={{ width: "120px", opacity: 0.7 }}
              />
              <p style={{ fontSize: "16px", color: "#666" }}>
                Không tìm thấy sản phẩm phù hợp
              </p>
              <Button type="primary" onClick={handleClearSearch}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <>
              <CardComponent products={displayedProducts} />
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
            </>
          )}
        </MainContent>
      </ProductsContainer>
    </>
  );
};

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  width: 100%;
  min-width: 98vw;
`;

export default SearchOverlay;
