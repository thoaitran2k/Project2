import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Input, Button, Row, Col, List, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { setSearchTerm } from "../../redux/slices/productSlice";
import axios from "axios";

const { Search } = Input;

const SearchComponent = ({ setLimit = () => {} }) => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [resetProducts, setResetProducts] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    // Lấy lịch sử tìm kiếm từ localStorage
    const storedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);

    // Gọi API lấy danh sách sản phẩm đầy đủ khi load trang
    fetchAllProducts();
  }, []);

  // 🔍 API lấy toàn bộ sản phẩm
  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/product/get-all`
      );
      setAllProducts(response.data || []);
      dispatch(setSearchTerm("")); // Đặt lại Redux về trạng thái ban đầu
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    }
  };

  // 🔍 API tìm kiếm sản phẩm
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/product/search?query=${query}`
      );

      let products = response.data || [];

      // Bỏ trùng sản phẩm theo `name`
      const uniqueProducts = Array.from(
        new Map(
          products.map((item) => [item.name.toLowerCase(), item])
        ).values()
      );

      // Ưu tiên sản phẩm có tên bắt đầu bằng từ khóa
      const sortedProducts = uniqueProducts.sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase());
        const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase());

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      });

      setSuggestions(sortedProducts.slice(0, 5)); // Giới hạn 5 gợi ý
    } catch (error) {
      console.error("Lỗi lấy gợi ý:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (value) => {
    handleSearch(value);
    setSearchValue(value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setSuggestions([]);
    dispatch(setSearchTerm(""));
    setLimit(8);
    fetchAllProducts();
  };

  // Xử lý khi nhập
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowSuggestions(true);

    if (value.trim()) {
      setTimeout(() => fetchSuggestions(value.trim()), 300);
    } else {
      setSuggestions(recentSearches);
    }
  };

  useEffect(() => {
    const storedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);
    setSuggestions(storedSearches); // ✅ Hiển thị lịch sử ngay khi vào trang
    fetchAllProducts();
  }, []);

  // Thực hiện tìm kiếm
  const handleSearch = (value) => {
    if (!value.trim()) {
      dispatch(setSearchTerm(""));
      setResetProducts(true);
      return;
    }

    dispatch(setSearchTerm(value));
    setResetProducts(true);

    console.log("📌 searchTerm mới sau khi dispatch:", value);

    setLimit(8);

    // Lưu lịch sử tìm kiếm
    const updatedSearches = [
      value,
      ...recentSearches.filter((item) => item !== value),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  return (
    <Row
      justify="center"
      style={{ marginBottom: "20px", position: "relative" }}
    >
      <Col span={8}>
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          enterButton={<Button icon={<SearchOutlined />}>Tìm kiếm</Button>}
          size="large"
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value;
            setSearchValue(value);
            setShowSuggestions(true);

            if (!value.trim()) {
              handleClearSearch();
            } else {
              setTimeout(() => fetchSuggestions(value.trim()), 300);
            }
          }}
          onSearch={handleSearch}
          onFocus={() => setShowSuggestions(true)} // ✅ Hiển thị gợi ý khi focus
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // ✅ Ẩn gợi ý khi click ra ngoài
          onClear={handleClearSearch} // ✅ Khi nhấn nút ❌ sẽ gọi hàm này
        />

        {/* Hiển thị danh sách gợi ý */}
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
              suggestions.length > 0
                ? suggestions
                : [{ name: "Không có sản phẩm", disabled: true }]
            }
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "10px",
                  cursor: item.disabled ? "default" : "pointer",
                  color: item.disabled ? "gray" : "black",
                  transition: "background 0.2s ease-in-out", // Hiệu ứng chuyển đổi mượt
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
                {loading ? <Spin /> : item.name}
              </List.Item>
            )}
          />
        )}
      </Col>
    </Row>
  );
};

export default SearchComponent;
