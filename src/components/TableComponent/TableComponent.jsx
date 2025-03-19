import { Dropdown, Space, Table } from "antd";
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

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setRowSelectedKeys(selectedRowKeys);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`
        // "selectedRows: ",
        // selectedRows
      );
    },
    // getCheckboxProps: (record) => ({
    //   disabled: record.name === "Disabled User",
    //   name: record.name,
    // }),
  };

  const items = [];

  const handleDeleteAll = () => {
    handleDeleteManyProducts(rowSelectedKeys);
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
          rowSelection={{ type: selectionType, ...rowSelection }}
          columns={columns}
          dataSource={data}
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
