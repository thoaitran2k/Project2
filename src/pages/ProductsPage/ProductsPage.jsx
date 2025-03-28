import React, { useEffect, useMemo, useState } from "react";
import { Checkbox, Slider } from "antd";
import styled from "styled-components";
import { getAllTypeProduct } from "../../Services/ProductService";
import { useLocation } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

const SideBar = () => {
  const [type, setType] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const location = useLocation();
  const isProductPage = location.pathname.startsWith("/product-type/");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = useSelector((state) => state.product.searchTerm);
  const products = useSelector((state) => state.product.products?.data || []);

  // Khởi tạo selectedTypes từ URL params khi component mount
  useEffect(() => {
    const typesFromUrl = searchParams.get("type");
    if (typesFromUrl) {
      setSelectedTypes(typesFromUrl.split(","));
    }
  }, [searchParams]);

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
        }
      } catch (error) {
        console.error("🚨 Lỗi lấy danh mục:", error.message);
      }
    };

    fetchCategories();
  }, []);

  const filteredType = useMemo(() => {
    if (!searchTerm.trim()) return type;

    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchedTypes = [...new Set(filteredProducts.map((p) => p.type))];

    return type.filter((item) => matchedTypes.includes(item.value));
  }, [searchTerm, type, products]);

  const handleCategoryChange = (checkedValues) => {
    setSelectedTypes(checkedValues);

    // Cập nhật URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (checkedValues.length === 0) {
      newSearchParams.delete("type");
    } else {
      newSearchParams.set("type", checkedValues.join(","));
    }

    // Reset page về 1 khi thay đổi filter
    newSearchParams.delete("page");
    setSearchParams(newSearchParams);
  };

  return (
    <SidebarContainer>
      {!isProductPage && (
        <>
          <h3>Danh mục</h3>
          {filteredType.length > 0 ? (
            <StyledCheckboxGroup
              options={filteredType}
              value={selectedTypes}
              onChange={handleCategoryChange}
            />
          ) : (
            <p>🔍 Không tìm thấy danh mục phù hợp</p>
          )}
        </>
      )}
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
