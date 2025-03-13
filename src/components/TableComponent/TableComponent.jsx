import { Table } from "antd";
import React, { useEffect, useState } from "react";
import PagingLoading from "../LoadingComponent/PagingLoading";
import { useSelector } from "react-redux";

const TableComponent = ({
  selectionType = "checkbox",
  data = [],
  columns = [],
  isloading = false,
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

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User",
      name: record.name,
    }),
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
        <Table
          rowSelection={{ type: selectionType, ...rowSelection }}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          onChange={handleTableChange}
          {...props}
        />
      </div>

      {/* Hiển thị hiệu ứng loading khi tải dữ liệu */}
      {(isloading || isPagingLoading) && <PagingLoading />}
    </div>
  );
};

export default TableComponent;
