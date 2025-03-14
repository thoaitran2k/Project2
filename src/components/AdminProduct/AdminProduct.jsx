import React, { useEffect, useRef, useState } from "react";
import { CustomUpload, WrapperHeader } from "./style";
import {
  Button,
  Descriptions,
  Form,
  Modal,
  Space,
  Upload,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FilterFilled,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import InputComponent from "../InputComponent/InputComponent";
import { getBase64 } from "../../utils/UploadAvatar";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getDetailsProductById,
  updateProduct,
} from "../../redux/slices/productSlice";
import Loading from "../LoadingComponent/Loading";
import { setLoading } from "../../redux/slices/loadingSlice";
import DrawerComponent from "../DrawerComponent/DrawerComponent";

//import { createProduct } from "../../Services/ProductService";

const AdminProduct = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [CopyProductDetails, setCopyProductDetails] = useState(null);

  //Thêm mới
  const [stateProduct, setStateProduct] = useState({
    name: "",
    price: "",
    description: "",
    rating: "",
    image: "",
    type: "",
    countInStock: "",
  });

  //Chỉnh sửa
  const [stateDetailsProduct, setStateDetailsProduct] = useState({
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
  const { products, isloading } = useSelector((state) => state.product);
  const [rowSelected, setRowSelected] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const productDetail = useSelector((state) => state.product.productDetail);
  const user = useSelector((state) => state.user);
  const [isModalOpenDeleteProduct, setIsModalOpenDeleteProduct] =
    useState(false);

  //_______________________________________________________XÁC ĐỊNH TRANG SẢN PHẨM BỊ UPDATE
  const [currentPage, setCurrentPage] = useState(1);

  //______________________SEARCH AND FILTER
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [filteredInfo, setFilteredInfo] = useState({
    price: null,
    rating: null,
    type: null,
  }); //________________________Giá trị filter

  //______________________________________ResetFilter khi click Filter
  const handleResetFilter = (field, confirm) => {
    setFilteredInfo((prev) => ({ ...prev, [field]: null }));
    confirm();
  };

  //_____________________________________RESETFILTER trên Bảng
  const handleTableChange = (pagination, filters) => {
    setFilteredInfo(filters);
    setCurrentPage(pagination.current);
  };

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      dispatch(getDetailsProductById(rowSelected));
      setIsOpenDrawer(true);
    }
  }, [isOpenDrawer, rowSelected]);

  //______________________________________________Set ID cho hàng sản phẩm cần lấy thông tin
  const handleDetailsPorduct = (id) => {
    setRowSelected(id); // Cập nhật ngay lập tức
    setTimeout(() => {
      dispatch(getDetailsProductById(id));
      setIsOpenDrawer(true);
    }, 0); // Đợi state cập nhật xong
  };

  useEffect(() => {
    if (productDetail?.data) {
      setCopyProductDetails(productDetail.data);
      setStateDetailsProduct({
        name: productDetail.data.name,
        price: productDetail.data.price,
        description: productDetail.data.description,
        rating: productDetail.data.rating,
        image: productDetail.data.image,
        type: productDetail.data.type,
        countInStock: productDetail.data.countInStock,
      });

      form.setFieldsValue(productDetail.data);
    }
  }, [productDetail]);

  const renderAction = () => {
    return (
      <div>
        <EditOutlined
          style={{ color: "#9FCBFF", fontSize: "20px", cursor: "pointer" }}
          onClick={handleDetailsPorduct}
        />{" "}
        <DeleteOutlined
          style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
          onClick={handleDeleteProduct}
        />
      </div>
    );
  };

  const [form] = Form.useForm();
  useEffect(() => {
    //console.log("📌 Trạng thái sau khi reset:", stateProduct);
  }, [stateProduct]);

  useEffect(() => {
    dispatch(getAllProduct());
  }, [dispatch]);

  //_____________GỌI API VỚI TRANG HIỆN TẠI SAU KHI CHỈNH SỬA HOẶC XÓA
  useEffect(() => {
    dispatch(getAllProduct({ page: currentPage }));
  }, [dispatch, currentPage]);

  //_____________________________________________SEARCHFILTER

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <InputComponent
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={`${selectedKeys[0] || ""}`}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    // render: (text) =>
    //   searchedColumn === dataIndex ? (
    //     <Highlighter
    //       highlightStyle={{
    //         backgroundColor: "#ffc069",
    //         padding: 0,
    //       }}
    //       searchWords={[searchText]}
    //       autoEscape
    //       textToHighlight={text ? text.toString() : ""}
    //     />
    //   ) : (
    //     text
    //   ),
  });

  //________________________________________HÀM FILTER
  const handleFilter = (field, value, confirm, setSelectedKeys) => {
    setFilteredInfo((prev) => ({ ...prev, [field]: [value] }));
    setSelectedKeys([value]); // Giữ lại duy nhất một bộ lọc
    confirm();
  };

  //________________________________________________________DỮ LIỆU BẢNG
  //_________________________________________________CÁCH FILTER
  //__________________________________________SERACH
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "15vw",
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: "Price",
      dataIndex: "price",
      width: "15vw",
      sorter: (a, b) => a.price - b.price,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Button
            onClick={() =>
              handleFilter("price", "300000-500000", confirm, setSelectedKeys)
            }
            size="small"
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            300,000 - 500,000
          </Button>
          <Button
            onClick={() =>
              handleFilter("price", "500000-1000000", confirm, setSelectedKeys)
            }
            size="small"
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            500,000 - 1,000,000
          </Button>
          <Button
            onClick={() =>
              handleFilter("price", "<300000", confirm, setSelectedKeys)
            }
            size="small"
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            {"< 300,000"}
          </Button>
          <Button
            onClick={() => handleResetFilter("price", confirm)}
            size="small"
            type="link"
            style={{ width: "100%", color: "red" }}
          >
            Reset Filter
          </Button>
        </div>
      ),
      filterIcon: () => (
        <FilterFilled
          style={{
            color: filteredInfo.price?.length ? "#1890ff" : "#ccc",
            cursor: "pointer",
          }}
          onClick={() => {
            if (filteredInfo.price?.length)
              setFilteredInfo((prev) => ({ ...prev, price: null }));
          }}
        />
      ),
      onFilter: (value, record) => {
        if (value === "300000-500000")
          return record.price >= 300000 && record.price <= 500000;
        if (value === "500000-1000000")
          return record.price >= 500000 && record.price <= 1000000;
        if (value === "<300000") return record.price < 300000;
      },
      filteredValue: filteredInfo.price || null,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      width: "15vw",
      sorter: (a, b) => a.rating - b.rating,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Button
            onClick={() =>
              handleFilter("rating", "3-4", confirm, setSelectedKeys)
            }
            size="small"
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            ⭐ 3 - 4 sao
          </Button>
          <Button
            onClick={() =>
              handleFilter("rating", "4-5", confirm, setSelectedKeys)
            }
            size="small"
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            ⭐ 4 - 5 sao
          </Button>
          <Button
            onClick={() =>
              handleFilter("rating", "<3", confirm, setSelectedKeys)
            }
            size="small"
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            ⭐ Dưới 3 sao
          </Button>
          <Button
            onClick={() => handleResetFilter("rating", confirm)}
            size="small"
            type="link"
            style={{ width: "100%", color: "red" }}
          >
            Reset Filter
          </Button>
        </div>
      ),
      filterIcon: () => (
        <FilterFilled
          style={{
            color: filteredInfo.rating?.length ? "#1890ff" : "#ccc",
            cursor: "pointer",
          }}
          onClick={() => {
            if (filteredInfo.rating?.length)
              setFilteredInfo((prev) => ({ ...prev, rating: null }));
          }}
        />
      ),
      onFilter: (value, record) => {
        if (value === "3-4") return record.rating >= 3 && record.rating < 4;
        if (value === "4-5") return record.rating >= 4 && record.rating < 5;
        if (value === "<3") return record.rating < 3;
      },
      filteredValue: filteredInfo.rating || null,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: "15vw",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          {[
            "Áo nam",
            "Áo nữ",
            "Đồng hồ",
            "Túi xách",
            "Ví",
            "Trang sức",
            "Quần nam",
            "Quần nữ",
          ].map((type) => (
            <Button
              key={type}
              onClick={() =>
                handleFilter("type", type, confirm, setSelectedKeys)
              }
              size="small"
              style={{ display: "block", marginBottom: 8, width: "100%" }}
            >
              {type}
            </Button>
          ))}
          <Button
            onClick={() => handleResetFilter("type", confirm)}
            size="small"
            type="link"
            style={{ width: "100%", color: "red" }}
          >
            Reset Filter
          </Button>
        </div>
      ),
      filterIcon: () => (
        <FilterFilled
          style={{
            color: filteredInfo.type?.length ? "#1890ff" : "#ccc",
            cursor: "pointer",
          }}
          onClick={() => {
            if (filteredInfo.type?.length)
              setFilteredInfo((prev) => ({ ...prev, type: null }));
          }}
        />
      ),
      onFilter: (value, record) => record.type === value,
      filteredValue: filteredInfo.type || null,
    },
    {
      title: "Action",
      dataIndex: "action",
      width: "5vw",
      align: "center",
      render: renderAction,
    },
  ];

  //____________________________________________Dữ liệu bảng
  const dataTable =
    Array.isArray(products?.data) && products.data.length > 0
      ? products.data.map((product) => ({
          ...product,
          key: product._id,
        }))
      : [];

  console.log("Product", products);
  //console.log("Product data being passed to TableComponent:", products?.data);

  useEffect(() => {
    //console.log("Redux products:", products);
  }, [products]);

  if (isloading) return <p>Đang tải...</p>;
  if (!products?.data)
    return (
      <p style={{ justifyContent: "center", alignItems: "center" }}>
        Đang trong quá trình thêm sản phẩm....
      </p>
    );
  //_______________________________________________________Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    setRowSelected(id);
    setIsModalOpenDeleteProduct(true);
  };

  //________________________________________________________________________Update sản phẩm
  const onApply = async (updatedProduct, productId) => {
    // console.log("Cập nhật sản phẩm");
    // console.log("updatedProduct", updatedProduct);
    // console.log("id", productId);

    try {
      dispatch(setLoading(true));

      console.log("Access Token:", user.accessToken);

      const resultAction = await dispatch(
        updateProduct({ productId, updatedData: stateDetailsProduct })
      );

      if (updateProduct.fulfilled.match(resultAction)) {
        message.success("Cập nhật sản phẩm thành công!");
        dispatch(getAllProduct({ page: currentPage })); // Cập nhật lại danh sách sản phẩm
        setIsOpenDrawer(false); // Đóng Drawer sau khi cập nhật thành công
      } else {
        throw new Error(resultAction.payload);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      message.error("Cập nhật sản phẩm thất bại!");
    } finally {
      dispatch(setLoading(false));
    }
  };

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

      // dispatch(setLoading(true));

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

        // setStateProduct((prev) => {
        //   const newState = { ...prev, image: response.data.imageUrl };
        //   console.log("Cập nhật state product:", newState);
        //   return newState;
        // });

        // Kiểm tra lại bằng useEffect
        setIsModalOpen(false);
        // console.log("📌 Trạng thái sau khi reset:", stateProduct);
        setFileList([]);
        message.success("Thêm sản phẩm thành công!");
        dispatch(getAllProduct());
        // setTimeout(() => {
        //   dispatch(setLoading(false));
        // }, 1500);
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

  const handleOnchangeDetails = (e) => {
    const { name, value } = e.target;

    setStateDetailsProduct((prevState) => ({
      ...prevState, // ✅ Giữ lại các trường trước đó
      [name]: value, // ✅ Cập nhật trường thay đổi
    }));
  };

  const handleChangeImage = async (info) => {
    const file = info.file.originFileObj || info.file;

    if (!(file instanceof Blob)) {
      console.error("File không hợp lệ:", file);
      message.error("File ảnh không hợp lệ, vui lòng thử lại!");
      return;
    }

    const previewUrl = await getBase64(file);

    setStateProduct((prev) => ({
      ...prev,
      image: previewUrl,
    }));

    setFileList([info.file]);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `http://localhost:3002/api/product/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (response.data && response.data.imageUrl) {
        setStateProduct((prev) => ({
          ...prev,
          image: response.data.imageUrl,
        }));
      } else {
        throw new Error("Không tìm thấy imageUrl trong response!");
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
    }
  };

  const handleChangeDetailsImage = async ({ fileList }) => {
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
      setStateDetailsProduct((prev) => ({
        ...prev,
        image: response.data.imageUrl,
      }));
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
    }
  };

  const handleCancel = () => {
    if (CopyProductDetails) {
      setStateDetailsProduct(CopyProductDetails);
      form.setFieldsValue(CopyProductDetails);
    }
    setIsModalOpen(false);
  };

  const handleCancelDeleteProduct = () => {
    setIsModalOpenDeleteProduct(false);
  };

  const onConfirmDelete = async (productId) => {
    // console.log("Đang xóa....");
    setIsModalOpenDeleteProduct(false);
    // console.log("product ID bị xóa là:", productId);
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      message.success("Xóa sản phẩm thành công!");

      dispatch(getAllProduct({ page: currentPage }));
    } catch (error) {
      alert(error || "Xóa sản phẩm thất bại!");
    }
  };

  //_______________________________________________________________________________________________________________
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
            setIsModalOpen(true); // ⏳ Delay mở modal để React cập nhật state
          }}
        >
          <PlusOutlined />
        </Button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <TableComponent
          columns={columns}
          products={products?.data}
          isloading={isloading}
          data={dataTable}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: 10, // Số lượng sản phẩm mỗi trang
            total: products?.total || 0, // Tổng số sản phẩm
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              }, // click row
            };
          }}
        />
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
                beforeUpload={() => false} // Không upload ngay lập tức
                onChange={handleChangeImage} // Nhận `fileList`
                maxCount={1}
                showUploadList={false}
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
            <Button type="primary" htmlType="apply">
              Apply
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ________________MODAL CHỌN XÓA SẢN PHẨM_________________ */}
      <Modal
        title="Xác nhận xóa sản phẩm"
        open={isModalOpenDeleteProduct}
        onCancel={handleCancelDeleteProduct}
        footer={null}
        centered
      >
        <p
          style={{
            textAlign: "center",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          Bạn có chắc chắn muốn xóa sản phẩm này không?
        </p>

        <Form onFinish={() => onConfirmDelete(rowSelected)} autoComplete="off">
          <div
            style={{ display: "flex", justifyContent: "center", gap: "15px" }}
          >
            <Button
              type="primary"
              danger
              htmlType="submit"
              style={{
                minWidth: "100px",
                fontWeight: "bold",
              }}
            >
              Đồng ý
            </Button>

            <Button
              style={{
                minWidth: "100px",
                background: "#f0f0f0",
                color: "#333",
                fontWeight: "bold",
              }}
              onClick={handleCancelDeleteProduct}
            >
              Hủy
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer chỉnh sửa sản phẩm */}
      <DrawerComponent
        title="Chi tiết sản phẩm"
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        width="80%"
      >
        <Form
          name="basic"
          labelCol={{
            span: 2,
          }}
          wrapperCol={{
            span: 22,
          }}
          //   initialValues={{
          //     remember: true,
          form={form}
          //   }}
          onFinish={() => {
            onApply(stateDetailsProduct, rowSelected);
          }}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <InputComponent
              value={stateDetailsProduct.name}
              onChange={handleOnchangeDetails}
              name="name"
            />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[
              {
                required: true,
                message: "Please input your type!",
              },
            ]}
          >
            <InputComponent
              value={stateDetailsProduct.type}
              onChange={handleOnchangeDetails}
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
              value={stateDetailsProduct.countInStock}
              onChange={handleOnchangeDetails}
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
              value={stateDetailsProduct.price}
              onChange={handleOnchangeDetails}
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
              value={stateDetailsProduct.rating}
              onChange={handleOnchangeDetails}
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
              value={stateDetailsProduct.description}
              onChange={handleOnchangeDetails}
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
                {stateDetailsProduct?.image ? (
                  <img
                    src={stateDetailsProduct?.image}
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
                  handleChangeDetailsImage({ fileList: [file] });
                  setTimeout(() => onSuccess("ok"), 1000);
                }}
                onChange={handleChangeDetailsImage}
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
            <Button type="primary" htmlType="apply">
              Apply
            </Button>
          </Form.Item>
        </Form>
      </DrawerComponent>
    </div>
  );
};

export default AdminProduct;
