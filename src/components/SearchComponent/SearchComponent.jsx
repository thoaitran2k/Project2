import React from "react";
import { Input, Button, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

const SearchComponent = ({ onSearch }) => {
  const handleSearch = (value) => {
    onSearch(value);
  };

  return (
    <Row justify="center" style={{ marginBottom: "20px" }}>
      <Col span={8}>
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          enterButton={<Button icon={<SearchOutlined />}>Tìm kiếm</Button>}
          size="large"
          onSearch={handleSearch}
        />
      </Col>
    </Row>
  );
};

export default SearchComponent;
