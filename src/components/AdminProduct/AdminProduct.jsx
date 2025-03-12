import React, { useEffect, useState } from "react";
import { CustomUpload, WrapperHeader } from "./style";
import { Button, Descriptions, Form, Modal, Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import InputComponent from "../InputComponent/InputComponent";
import { getBase64 } from "../../utils/UploadAvatar";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../../redux/slices/productSlice";
import Loading from "../LoadingComponent/Loading";
import { setLoading } from "../../redux/slices/loadingSlice";
//import { createProduct } from "../../Services/ProductService";

const AdminProduct = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stateProduct, setStateProduct] = useState({
    name: "",
    price: "",
    description: "",
    rating: "",
    image: "",
    type: "",
    countInStock: "",
  });
  const [fileList, setFileList] = useState([]);
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const isLoading = useSelector((state) => state.loading.isLoading);

  const [form] = Form.useForm();
  useEffect(() => {
    //console.log("📌 Trạng thái sau khi reset:", stateProduct);
  }, [stateProduct]);

  useEffect(() => {
    //console.log("Redux products:", products);
  }, [products]);

  const onFinish = async () => {
    //console.log("📤 Trạng thái stateProduct trước khi gửi:", stateProduct);
    //const dispatch = useDispatch();
    //const { loading, error } = useSelector((state) => state.product);

    try {
      const newProduct = {
        name: stateProduct.name,
        image: stateProduct.image,
        type: stateProduct.type,
        price: Number(stateProduct.price),
        countInStock: Number(stateProduct.countInStock),
        rating: Number(stateProduct.rating),
        description: stateProduct.description,
      };

      //   console.log("📤 Gửi sản phẩm:", newProduct);

      // Kiểm tra dữ liệu trước khi gửi
      if (Object.entries(newProduct).some(([key, value]) => value === "")) {
        console.error("🚨 Lỗi: Thiếu trường dữ liệu");
        message.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      dispatch(setLoading(true));

      // 🔥 Dispatch gọi API
      const resultAction = await dispatch(createProduct(newProduct));

      if (createProduct.fulfilled.match(resultAction)) {
        // Swal.fire({
        //   icon: "success",
        //   title: "Tạo sản phẩm thành công!",
        // });

        // Reset form sau khi tạo thành công

        setStateProduct((prev) => ({
          ...prev,
          name: "",
          price: "",
          description: "",
          rating: "",
          image: "",
          type: "",
          countInStock: "",
        }));

        // Kiểm tra lại bằng useEffect

        console.log("📌 Trạng thái sau khi reset:", stateProduct);
        setFileList([]);
        message.success("Thêm sản phẩm thành công!");

        setTimeout(() => {
          dispatch(setLoading(false));
          setIsModalOpen(false);
        }, 1500);
      } else {
        throw new Error(resultAction.payload);
      }
    } catch (error) {
      console.error("⚠️ Lỗi khi gọi API:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Không thể tạo sản phẩm.",
      });
    }
  };

  const handleOnchange = (e) => {
    setStateProduct({
      ...stateProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeImage = async ({ fileList }) => {
    const file = fileList[0];

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setFileList(fileList ? fileList.slice(-1) : []);

    const formData = new FormData();
    formData.append("image", file.originFileObj); // ✅ Đảm bảo key là "image"

    // console.log("File gửi lên backend:", file.originFileObj);

    // Kiểm tra dữ liệu trong FormData
    for (let [key, value] of formData.entries()) {
      //   console.log(`Key: ${key}, Value:`, value);
    }

    try {
      const response = await axios.post(
        `http://localhost:3002/api/product/upload-image`, // ✅ API đúng
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json", // ✅ Đảm bảo server hiểu request JSON
          },
        }
      );

      //   console.log("Response từ server:", response.data);
      setStateProduct((prev) => ({
        ...prev,
        image: response.data.imageUrl,
      }));
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <WrapperHeader>Quản lý sản phẩm</WrapperHeader>
      <div style={{ marginTop: "10px" }}>
        <Button
          style={{
            height: "150px",
            width: "150px",
            borderStyle: "dashed",
            fontSize: "60px",
          }}
          onClick={() => {
            setStateProduct({
              name: "",
              price: "",
              description: "",
              rating: "",
              image: "",
              type: "",
              countInStock: "",
            });
            //setStateProduct(newProduct);
            setFileList([]);
            form.resetFields();
            //form.setFieldsValue(newProduct); // Xóa danh sách file nếu có
            setTimeout(() => setIsModalOpen(true), 50); // ⏳ Delay mở modal để React cập nhật state
          }}
        >
          <PlusOutlined />
        </Button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <TableComponent />
      </div>

      {/* Modal thêm sản phẩm */}
      <Modal
        title="Tạo sản phẩm mới"
        open={isModalOpen}
        //onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
      >
        <Form
          name="basic"
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 18,
          }}
          //   initialValues={{
          //     remember: true,
          form={form}
          //   }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="Name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <InputComponent
              value={stateProduct.name}
              onChange={handleOnchange}
              name="name"
            />
          </Form.Item>
          <Form.Item
            label="Type"
            name="Type"
            rules={[
              {
                required: true,
                message: "Please input your type!",
              },
            ]}
          >
            <InputComponent
              value={stateProduct.type}
              onChange={handleOnchange}
              name="type"
            />
          </Form.Item>
          <Form.Item
            label="Count inStock"
            name="countInStock"
            rules={[
              {
                required: true,
                message: "Please input your count InStock!",
              },
            ]}
          >
            <InputComponent
              value={stateProduct.countInStock}
              onChange={handleOnchange}
              name="countInStock"
            />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[
              {
                required: true,
                message: "Please input your count price!",
              },
            ]}
          >
            <InputComponent
              value={stateProduct.price}
              onChange={handleOnchange}
              name="price"
            />
          </Form.Item>

          <Form.Item
            label="Rating"
            name="rating"
            rules={[
              {
                required: true,
                message: "Please input your count rating!",
              },
            ]}
          >
            <InputComponent
              value={stateProduct.rating}
              onChange={handleOnchange}
              name="rating"
            />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input your count description!",
              },
            ]}
          >
            <InputComponent
              value={stateProduct.description}
              onChange={handleOnchange}
              name="description"
            />
          </Form.Item>
          <Form.Item
            label="Image"
            name="image"
            rules={[
              {
                required: true,
                message: "Please upload an image!",
              },
            ]}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {/* Ô chứa ảnh hoặc khung trống */}
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  border: "2px dashed #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {stateProduct?.image ? (
                  <img
                    src={stateProduct?.image}
                    alt="Product"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: "#aaa" }}>No image</span>
                )}
              </div>

              {/* Nút chọn ảnh */}
              <Upload
                customRequest={({ file, onSuccess }) => {
                  handleChangeImage({ fileList: [file] });
                  setTimeout(() => onSuccess("ok"), 1000);
                }}
                onChange={handleChangeImage}
                maxCount={1}
                showUploadList={false} // Ẩn danh sách file
              >
                <Button icon={<PlusOutlined />}>Select Image</Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 6,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProduct;
