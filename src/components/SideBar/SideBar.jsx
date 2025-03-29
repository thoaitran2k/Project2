import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Checkbox, Slider } from "antd";
import styled from "styled-components";
import { getAllTypeProduct } from "../../Services/ProductService";
import { useLocation, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

const SideBar = ({ selectedTypes = [], setSelectedTypes }) => {
  const [type, setType] = useState([]);

  const { type: selectedTypeFromUrl } = useParams();
  //const [filteredType, setFilteredType] = useState([]); // Danh mục được lọc khi search

  // const [selectedTypes, setSelectedTypes] = useState([]);
  const location = useLocation();
  const isProductPage = location.pathname.startsWith("/product-type/");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = useSelector((state) => state.product.searchTerm);
  const products = useSelector((state) => state.product.products?.data || []);

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

  console.log(normalizeText("Đồng hồ")); // Xem kết quả sau khi chuẩn hóa
  console.log(normalizeText("dong-ho"));
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
    const matchedTypes = new Set(filteredProducts.map((p) => p.type));
    return type.filter((item) => matchedTypes.has(item.value));
  }, [searchTerm, type, products, isTypeProductPage, selectedTypeFromUrl]);

  console.log("Danh sách type:", type);
  console.log("selectedTypeFromUrl:", selectedTypeFromUrl);
  console.log("filteredType:", filteredType);

  const handleCategoryChange = useCallback(
    (values) => {
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
    [selectedTypes, searchParams, setSearchParams]
  );

  return (
    <SidebarContainer>
      {/* {!isProductPage && ( */}
      <>
        <h3>Danh mục</h3>
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

                    if (!isTypeProductPage) {
                      setSelectedTypes(newSelectedTypes);
                    }
                    // handleCategoryChange(newSelectedTypes);
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
      <h3>Khoảng giá</h3>
      <Slider
        range
        min={0}
        max={100}
        defaultValue={[0, 100]}
        onChange={(value) => console.log("Khoảng giá đã chọn:", value)}
      />
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
