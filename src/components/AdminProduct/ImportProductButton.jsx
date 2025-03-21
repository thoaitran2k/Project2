import React, { useState } from "react";
import { Button, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { getAllProduct } from "../../redux/slices/productSlice"; // Import action getAllProduct

const ImportProductButton = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch(); // Sử dụng useDispatch

  const handleUpload = () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("file", file);
    });

    setUploading(true);

    // Gọi API để import sản phẩm
    fetch("http://localhost:3002/api/product/import-products", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setFileList([]);
        setUploading(false);
        if (data.status === "OK") {
          message.success("Import sản phẩm thành công");

          // Gọi lại API lấy danh sách sản phẩm sau khi import thành công
          dispatch(getAllProduct()); // Dispatch action getAllProduct
        } else {
          message.error("Import sản phẩm thất bại: " + data.message);
        }
      })
      .catch((error) => {
        setUploading(false);
        message.error("Import sản phẩm thất bại: " + error.message);
      });
  };

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false; // Ngăn chặn việc tự động upload
    },
    fileList,
  };

  return (
    <div>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? "Đang import..." : "Bắt đầu import"}
      </Button>
    </div>
  );
};

export default ImportProductButton;
