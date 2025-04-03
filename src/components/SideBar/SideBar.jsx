import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Input, Slider } from "antd";
import styled from "styled-components";
import { getAllTypeProduct } from "../../Services/ProductService";
import { useLocation, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSearch } from "../Layout/SearchContext";

const SideBar = ({
  selectedTypes = [],
  setSelectedTypes,
  onPriceFilter,
  onRatingFilter,
}) => {
  const [type, setType] = useState([]);

  const { isSearchOpen, toggleSearch } = useSearch();

  //console.log("isSearchOpen", isSearchOpen);

  const { type: selectedTypeFromUrl } = useParams();
  //const [filteredType, setFilteredType] = useState([]); // Danh mục được lọc khi search

  // const [selectedTypes, setSelectedTypes] = useState([]);
  const location = useLocation();
  const isProductPage = location.pathname.startsWith("/product-type/");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = useSelector((state) => state.product.searchTerm);

  const products = useSelector((state) => state.product?.products || []);
  const product = useSelector((state) => state.product);
  const [selectedRatings, setSelectedRatings] = useState([]);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleFilter = () => {
    const min = minPrice ? parseInt(minPrice.replace(/\./g, ""), 10) : 0;
    const max = maxPrice ? parseInt(maxPrice.replace(/\./g, ""), 10) : Infinity;

    // Gọi callback từ component cha (TypeProductPage)
    if (onPriceFilter) {
      onPriceFilter({ min, max });
    }

    // Cập nhật URL params (tuỳ chọn)
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("minPrice", min);
    newSearchParams.set("maxPrice", max === Infinity ? "" : max);
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleRatingChange = (rating) => {
    const newSelectedRatings = selectedRatings[0] === rating ? [] : [rating];

    setSelectedRatings(newSelectedRatings);

    // Gọi callback từ component cha
    if (onRatingFilter) {
      onRatingFilter(newSelectedRatings);
    }

    // Cập nhật URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (newSelectedRatings.length === 0) {
      newSearchParams.delete("ratings");
    } else {
      newSearchParams.set("ratings", newSelectedRatings.join(","));
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const renderStars = (count, label) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star key={i} active={i < count}>
          {i < count ? "★" : "☆"}
        </Star>
      );
    }
    return (
      <RatingItem
        onClick={() => handleRatingChange(count)}
        selected={selectedRatings.includes(count)}
      >
        {stars}
        <RatingLabel>{label}</RatingLabel>
      </RatingItem>
    );
  };

  const isTypeProductPage = location.pathname.startsWith("/product-type/");

  const isCategoryVisible =
    location.pathname.includes("/product-type") ||
    location.pathname.includes("/products");

  const normalizeText = (text) => {
    return text
      .normalize("NFD") // Chuẩn hóa Unicode
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu tiếng Việt
      .replace(/đ/g, "d") // Chuyển "đ" thành "d"
      .replace(/Đ/g, "D") // Chuyển "Đ" thành "D"
      .toLowerCase() // Chuyển thành chữ thường
      .replace(/\s+/g, "-"); // Thay khoảng trắng bằng "-"
  };

  const formatNumber = (value) => {
    if (!value) return "";
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Thêm dấu . phân cách
  };
  const parseNumber = (value) => {
    return value.replace(/\D/g, ""); // Loại bỏ ký tự không phải số
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllTypeProduct();
        const data = response.data;

        if (Array.isArray(data)) {
          const formattedCategories = data.map((item) => ({
            label: item,
            value: item,
          }));

          setType(formattedCategories);
          // setFilteredType(formattedCategories); // Ban đầu hiển thị tất cả danh mục
        } else {
          setType([]);
          //setFilteredType([]);
        }
      } catch (error) {
        console.error("🚨 Lỗi lấy danh mục:", error.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const typesFromUrl = searchParams.get("type");

    if (
      typesFromUrl !== null &&
      JSON.stringify(selectedTypes) !==
        JSON.stringify(typesFromUrl ? typesFromUrl.split(",") : [])
    ) {
      setSelectedTypes(typesFromUrl ? typesFromUrl.split(",") : []);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setSelectedTypes([]);
      searchParams.delete("type");
      setSearchParams(searchParams);
    }
  }, [searchTerm, searchParams, setSearchParams]);

  //console.log("STATE PRODUCT", product);
  // console.log("products", products);

  const filteredType = useMemo(() => {
    if (isTypeProductPage) {
      return type.filter(
        (item) => normalizeText(item.value) === selectedTypeFromUrl
      ); // Chỉ hiển thị danh mục khớp với URL
    }

    // Nếu không có tìm kiếm, trả về toàn bộ danh mục
    if (!searchTerm.trim()) return type;

    // Lọc danh mục dựa trên sản phẩm có liên quan đến từ khóa tìm kiếm
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //console.log("filteredProducts", filteredProducts);

    const matchedTypes = new Set(filteredProducts.map((p) => p.type));
    return type.filter((item) => matchedTypes.has(item.value));
  }, [searchTerm, type, products, isTypeProductPage, selectedTypeFromUrl]);

  const handleCategoryChange = useCallback(
    (values) => {
      if (isSearchOpen) return;
      // Chỉ cập nhật nếu giá trị mới khác giá trị cũ
      if (JSON.stringify(selectedTypes) !== JSON.stringify(values)) {
        setSelectedTypes(values);

        const newSearchParams = new URLSearchParams(searchParams);
        if (values.length === 0) {
          newSearchParams.delete("type");
        } else {
          newSearchParams.set("type", values.join(","));
        }
        setSearchParams(newSearchParams, { replace: true });
      }
    },

    [selectedTypes, searchParams, setSearchParams, isSearchOpen]
  );

  return (
    <SidebarContainer>
      {/* {!isProductPage && ( */}
      <>
        <h2>Danh mục</h2>
        {filteredType.length > 0 ? (
          isTypeProductPage || searchTerm.trim() ? (
            // Nếu có tìm kiếm, hiển thị danh sách có thể click
            <CategoryList>
              {filteredType.map((item) => (
                <CategoryItem
                  key={item.value}
                  onClick={() => {
                    const newSelectedTypes = selectedTypes.includes(item.value)
                      ? selectedTypes.filter((type) => type !== item.value)
                      : [...selectedTypes, item.value];

                    setSelectedTypes(newSelectedTypes);

                    //console.log("newSelectedTypes", newSelectedTypes);
                    //handleCategoryChange(newSelectedTypes);
                  }}
                  isSelected={selectedTypes.includes(item.value)}
                >
                  {item.label}
                </CategoryItem>
              ))}
            </CategoryList>
          ) : (
            // Nếu không có tìm kiếm, hiển thị checkbox
            <StyledCheckboxGroup
              options={filteredType}
              value={selectedTypes}
              onChange={handleCategoryChange}
            />
          )
        ) : (
          <p>🔍 Không tìm thấy danh mục phù hợp</p>
        )}
      </>
      {/* )} */}
      <br />
      <br />
      <br />
      <br />
      <h2>Khoảng giá</h2>
      <PriceFilterContainer>
        <div style={{ gap: "50px" }}>
          <StyledInput
            placeholder="Từ"
            type="text" // ⚡ Đổi type="text" để tránh lỗi
            value={formatNumber(minPrice)}
            onChange={(e) => setMinPrice(parseNumber(e.target.value))}
          />
          <Separator>-------</Separator>
          <StyledInput
            placeholder="Đến"
            type="text"
            value={formatNumber(maxPrice)}
            onChange={(e) => setMaxPrice(parseNumber(e.target.value))}
          />
        </div>
        <div>
          <FilterButton onClick={handleFilter}>Áp dụng</FilterButton>
        </div>
      </PriceFilterContainer>
      <br />
      <br />
      <br />
      <br />
      <h2>Đánh giá</h2>
      <RatingContainer>
        {renderStars(5)}
        {renderStars(4, "trở lên")}
        {renderStars(3, "trở lên")}
        {renderStars(2, "trở lên")}
        {renderStars(1, "trở lên")}
      </RatingContainer>
    </SidebarContainer>
  );
};

export default SideBar;

// 🎨 Style tối ưu hóa
const SidebarContainer = styled.div`
  width: 300px;
  height: 75vh;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const StyledCheckboxGroup = styled(Checkbox.Group)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
`;

const CategoryItem = styled.li`
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  background: ${({ isSelected }) => (isSelected ? "#1890ff" : "#fff")};
  color: ${({ isSelected }) => (isSelected ? "#fff" : "#000")};
  transition: 0.3s;
  &:hover {
    background: #f0f0f0;
  }
`;

const PriceFilterContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const StyledInput = styled(Input)`
  width: 120px;
  text-align: center;

  /* Ẩn nút tăng giảm trên tất cả trình duyệt */
  appearance: textfield;
  -moz-appearance: textfield;
  -webkit-appearance: textfield;

  /* Ẩn mũi tên tăng giảm trên Chrome, Safari, Edge */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const Separator = styled.span`
  font-weight: bold;
  color: #555;
`;

const FilterButton = styled(Button)`
  background-color: rgb(14, 118, 150);
  color: white;
  border: none;
  &:hover {
    background-color: rgb(196, 43, 43) !important;
    color: white !important;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  width: fit-content;
  margin: 0 20px;
`;

const RatingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  background: ${({ selected }) => (selected ? "#e6f7ff" : "transparent")};
  border: 1px solid ${({ selected }) => (selected ? "#1890ff" : "#d9d9d9")};
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
  }
`;

const Star = styled.span`
  color: ${({ active }) => (active ? "#faad14" : "#d9d9d9")};
  font-size: 16px;
`;

const RatingLabel = styled.span`
  font-size: 14px;
  color: #666;
`;
