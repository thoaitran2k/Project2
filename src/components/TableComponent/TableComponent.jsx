import { Dropdown, Space, Table, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import PagingLoading from "../LoadingComponent/PagingLoading";
import { useSelector } from "react-redux";
import { DownOutlined } from "@ant-design/icons";

const TableComponent = ({
  selectionType = "checkbox",
  data = [],
  columns = [],
  isloading = false,
  rowClassName = "",
  handleDeleteManyProducts,
  totalProducts,
  allProductIds, // Danh sách tất cả các ID sản phẩm
  ...props
}) => {
  const [isPagingLoading, setIsPagingLoading] = useState(true);
  const isLoading = useSelector((state) => state.loading.isLoading);

  // Ẩn hiệu ứng loading khi dữ liệu đã tải xong
  useEffect(() => {
    if (!isloading) {
      setTimeout(() => {
        setIsPagingLoading(false);
      }, 1000); // Giả lập hiệu ứng tải lần đầu
    }
  }, [isloading]);

  // Xử lý loading khi đổi trang
  const handleTableChange = () => {
    setIsPagingLoading(true);
    setTimeout(() => {
      setIsPagingLoading(false);
    }, 1000);
  };

  const [rowSelectedKeys, setRowSelectedKeys] = useState([]);

  // Danh sách các ID sản phẩm đang hiển thị (sau khi lọc)
  const filteredProductIds = data.map((product) => product._id);

  // Xử lý chọn tất cả các sản phẩm đang hiển thị
  const handleSelectAll = (checked) => {
    if (checked) {
      setRowSelectedKeys(filteredProductIds); // Chỉ chọn các sản phẩm đang hiển thị
    } else {
      setRowSelectedKeys([]);
    }
  };

  const rowSelection = {
    selectedRowKeys: rowSelectedKeys,
    onChange: (selectedKeys) => {
      setRowSelectedKeys(selectedKeys);
    },
    onSelectAll: (selected) => {
      if (selected) {
        setRowSelectedKeys(filteredProductIds); // Chỉ chọn các sản phẩm đang hiển thị
      } else {
        setRowSelectedKeys([]);
      }
    },
    selections: [
      {
        key: "select-all-pages",
        text: "Chọn tất cả trên mọi trang",
        onSelect: () => setRowSelectedKeys(allProductIds), // Chọn tất cả trên mọi trang
      },
      {
        key: "deselect-all",
        text: "Bỏ chọn tất cả",
        onSelect: () => setRowSelectedKeys([]),
      },
    ],
  };

  const items = [];

  const handleDeleteAll = () => {
    const filteredIds = rowSelectedKeys.filter((id) =>
      filteredProductIds.includes(id)
    );

    if (filteredIds.length > 0) {
      handleDeleteManyProducts(filteredIds);
    }

    // Cập nhật lại danh sách chọn
    setRowSelectedKeys((prev) =>
      prev.filter((id) => !filteredIds.includes(id))
    );
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Bảng dữ liệu */}
      <div
        style={{
          position: "relative",
          opacity: isloading || isPagingLoading ? 0.5 : 1,
        }}
      >
        {rowSelectedKeys.length > 0 && (
          <div
            style={{
              color: "white",
              background: "rgb(121, 152, 187)",
              width: "fit-content",
              fontWeight: "bold",
              padding: 10,
              cursor: "pointer",
            }}
            onClick={handleDeleteAll}
          >
            <Dropdown
              menu={{
                items,
              }}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  Xóa tất cả
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
        )}

        <Table
          columns={[
            {
              title: (
                <Checkbox
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={
                    rowSelectedKeys.length > 0 &&
                    rowSelectedKeys.length === filteredProductIds.length
                  }
                  indeterminate={
                    rowSelectedKeys.length > 0 &&
                    rowSelectedKeys.length < filteredProductIds.length
                  }
                />
              ),
              dataIndex: "select",
              width: "5%",
              render: (_, record) => (
                <Checkbox
                  checked={rowSelectedKeys.includes(record._id)}
                  onChange={(e) => {
                    const selected = e.target.checked;
                    setRowSelectedKeys((prev) =>
                      selected
                        ? [...new Set([...prev, record._id])]
                        : prev.filter((id) => id !== record._id)
                    );
                  }}
                />
              ),
            },
            ...columns,
          ]}
          dataSource={data} // Chỉ hiển thị sản phẩm đã lọc
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          onChange={handleTableChange}
          rowClassName={rowClassName}
          locale={{ emptyText: "Không có sản phẩm" }}
          {...props}
        />
      </div>

      {/* Hiển thị hiệu ứng loading khi tải dữ liệu */}
      {(isloading || isPagingLoading) && <PagingLoading />}
    </div>
  );
};

export default TableComponent;
