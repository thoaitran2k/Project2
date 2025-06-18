import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Button, Row, Col, List, Spin, Card, Typography } from "antd";
import {
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  StarFilled,
} from "@ant-design/icons";
import { setSearchTerm, setProducts } from "../../redux/slices/productSlice";
import axios from "axios";
import { useLocation, useNavigate } from "react-router";
import { useSearch } from "../Layout/SearchContext";
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
const { Text, Title } = Typography;

const SearchOverlay = () => {
  const createSlug = (name, id) => {
    return (
      name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/Đ/g, "D")
        .replace(/đ/g, "d")
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-") + `-${id}`
    );
  };

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
  const [limit, setLimit] = useState(10);
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

  const handleProductClick = (product) => {
    toggleSearch();
    navigate(`/product-details/${createSlug(product.name, product._id)}`);
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

    setLimit(10);

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
    setLimit(10);
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
              <StyledProductsGrid>
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    hoverable
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductImageContainer>
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                      {product.discount > 0 && (
                        <DiscountBadge>-{product.discount}%</DiscountBadge>
                      )}
                    </ProductImageContainer>
                    <ProductInfo>
                      <ProductName ellipsis={{ rows: 2 }}>
                        {product.name}
                      </ProductName>
                      <PriceContainer>
                        {product.discount > 0 ? (
                          <>
                            <CurrentPrice>
                              {(
                                (product.price * (100 - product.discount)) /
                                100
                              ).toLocaleString()}
                              ₫
                            </CurrentPrice>
                            <OriginalPrice>
                              {product.price.toLocaleString()}₫
                            </OriginalPrice>
                          </>
                        ) : (
                          <CurrentPrice>
                            {product.price.toLocaleString()}₫
                          </CurrentPrice>
                        )}
                      </PriceContainer>
                      <RatingContainer>
                        <StarFilled style={{ color: "#faad14" }} />
                        <RatingText>
                          {product.rating?.toFixed(1) || "0.0"}
                        </RatingText>
                        <SoldText>Đã bán {product.selled || 0}</SoldText>
                      </RatingContainer>
                      <LikeButton>
                        {product.isLiked ? (
                          <HeartFilled style={{ color: "#ff4d4f" }} />
                        ) : (
                          <HeartOutlined />
                        )}
                      </LikeButton>
                    </ProductInfo>
                  </ProductCard>
                ))}
              </StyledProductsGrid>

              {totalFilteredProducts > limit && (
                <WrapperButtonContainer>
                  <WrapperButtonMore
                    style={{ marginTop: 50 }}
                    type="default"
                    onClick={() => setLimit((prev) => prev + 10)}
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

// Styled components
const StyledProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: 100%;
  padding: 0 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(Card)`
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .ant-card-body {
    padding: 12px;
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* Tạo tỷ lệ khung hình vuông */
  margin-bottom: 12px;
  overflow: hidden;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #ff4d4f;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  min-height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
`;

const CurrentPrice = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #ff424e;
`;

const OriginalPrice = styled(Text)`
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

const RatingText = styled(Text)`
  font-size: 12px;
  color: #666;
`;

const SoldText = styled(Text)`
  font-size: 12px;
  color: #666;
  margin-left: 8px;
`;

const LikeButton = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 18px;
  cursor: pointer;
  z-index: 1;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  width: 96vw;
  padding: 0 16px;
`;
export default SearchOverlay;
