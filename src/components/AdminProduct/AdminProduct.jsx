import React, { useEffect, useRef, useState } from "react";
import { CustomUpload, WrapperHeader } from "./style";
import {
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Space,
  Upload,
  message,
  Select,
  Rate,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FilterFilled,
  MinusCircleOutlined,
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
  deleteManyProduct,
} from "../../redux/slices/productSlice";
import Loading from "../LoadingComponent/Loading";
import { setLoading } from "../../redux/slices/loadingSlice";
import DrawerComponent from "../DrawerComponent/DrawerComponent";

//import { createProduct } from "../../Services/ProductService";

const AdminProduct = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [CopyProductDetails, setCopyProductDetails] = useState(null);

  //TYPE_____________________________________
  const typeOptions = [
    { value: "Áo nam", label: "Áo nam" },
    { value: "Quần nam", label: "Quần nam" },
    { value: "Áo nữ", label: "Áo nữ" },
    { value: "Quần nữ", label: "Quần nữ" },
    { value: "Đồng hồ", label: "Đồng hồ" },
    { value: "Trang sức", label: "Trang sức" },
    { value: "Ví", label: "Ví" },
    { value: "Túi xách", label: "Túi xách" },
  ];

  //Thêm mới
  const [stateProduct, setStateProduct] = useState({
    name: "",
    price: "",
    description: "",
    rating: "",
    image: "",
    imagesPreview: [],
    type: "",
    countInStock: "",
    variants: [], // Thêm trường variants
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
    variants: [], // Thêm trường variants
  });

  //__________________________________MÀU VÀ SIZE
  const colorOptions = [
    { value: "red", label: "Đỏ" },
    { value: "white", label: "Trắng" },
    { value: "black", label: "Đen" },
    { value: "blue", label: "Xanh" },
  ];

  const sizeOptions = [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ];

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

  //______________________________________HANDLE XÓA TẤT CẢ SẢN PHẨM ĐƯỢC CHỌN
  const handleDeleteManyProducts = (productIds) => {
    if (!Array.isArray(productIds)) {
      console.error("Danh sách ID sản phẩm không hợp lệ");
      return;
    }

    dispatch(deleteManyProduct(productIds))
      .unwrap()
      .then(() => {
        console.log("Xóa nhiều sản phẩm thành công");
        message.success("Xóa nhiều sản phẩm thành công");
        // Gọi lại API lấy tất cả sản phẩm sau khi xóa thành công
        dispatch(getAllProduct({ page: currentPage }));
      })
      .catch((error) => {
        console.error("Xóa nhiều sản phẩm thất bại:", error);
      });

    console.log("IDS:", productIds);
  };

  useEffect(() => {
    //console.log("📌 Variants từ API:", productDetail.data.variants);
    if (productDetail?.data) {
      setCopyProductDetails(productDetail.data);
      const updatedProduct = {
        name: productDetail.data.name,
        price: productDetail.data.price,
        description: productDetail.data.description,
        rating: productDetail.data.rating,
        image: productDetail.data.image,
        type: productDetail.data.type,
        countInStock: productDetail.data.variants.reduce(
          (sum, variant) => sum + Number(variant.quantity || 0),
          0
        ),
        variants: productDetail.data.variants || [],
      };

      setStateDetailsProduct(updatedProduct);
      setStateProduct(updatedProduct); // Cập nhật luôn stateProduct

      form.setFieldsValue({
        ...productDetail.data,
        variants: productDetail.data.variants || [], // Đảm bảo Form.List nhận đúng giá trị
      });
    }
  }, [productDetail]);

  //_____________________ĐẾM SỐ LƯỢNG TỒN KHO

  useEffect(() => {
    console.log("🔍 State variants cập nhật:", stateProduct.variants);
  }, [stateProduct.variants]);

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

  //________________________________________GỘP SỐ LƯỢNG VÀ SIZE TRÙNG NHAU
  const groupVariants = (variants) => {
    const grouped = {};

    variants.forEach(({ color, size, quantity }) => {
      const key = `${color}-${size}`;
      if (!grouped[key]) {
        grouped[key] = { color, size, quantity: 0 };
      }
      grouped[key].quantity += Number(quantity); // ✅ Cộng dồn số lượng
    });

    return Object.values(grouped); // Trả về danh sách biến thể đã gộp
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
      width: "9vw",
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
      width: "8vw",
      sorter: (a, b) => a.rating - b.rating,
      render: (rating) => (
        <Rate disabled value={rating} style={{ fontSize: "12px" }} />
      ),
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
        if (value === "4-5") return record.rating >= 4 && record.rating <= 5;
        if (value === "<3") return record.rating < 3;
      },
      filteredValue: filteredInfo.rating || null,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: "8vw",
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
      title: "Color",
      dataIndex: "color",
      align: "center",
      render: (_, record) => {
        const colorOrder = ["white", "black", "blue", "red"]; // Ưu tiên màu
        const uniqueColors = [
          ...new Set(record.variants.map((v) => v.color.toLowerCase())),
        ].sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b)); // Sắp xếp theo thứ tự

        return (
          <div
            style={{ display: "flex", gap: "5px", justifyContent: "center" }}
          >
            {uniqueColors.map((color, index) => {
              const borderColor = color === "white" ? "#000" : "#ccc";
              return (
                <div
                  key={index}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    border: `1px solid ${borderColor}`,
                  }}
                />
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Size",
      dataIndex: "size",
      align: "center",
      render: (_, record) => {
        const sizeOrder = ["S", "M", "L", "XL", "XXL"]; // Thứ tự sắp xếp
        const sizeMap = {};

        // Gộp số lượng theo size
        record.variants.forEach(({ size, quantity }) => {
          sizeMap[size] = (sizeMap[size] || 0) + Number(quantity);
        });

        return Object.entries(sizeMap)
          .sort((a, b) => sizeOrder.indexOf(a[0]) - sizeOrder.indexOf(b[0])) // Sắp xếp theo thứ tự size
          .map(([size, quantity]) => `${size} (${quantity})`)
          .join(", ");
      },
    },
    {
      title: "Total Quantity",
      dataIndex: "totalQuantity",
      align: "center",
      sorter: (a, b) =>
        a.variants.reduce((sum, v) => sum + Number(v.quantity), 0) -
        b.variants.reduce((sum, v) => sum + Number(v.quantity), 0),
      render: (_, record) => {
        const totalQuantity = record.variants.reduce(
          (sum, variant) => sum + Number(variant.quantity),
          0
        );
        return <strong>{totalQuantity}</strong>;
      },
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

  //console.log("Product data being passed to TableComponent:", products?.data);

  useEffect(() => {
    //console.log("Redux products:", products);
  }, [products]);

  if (isloading) return <p>Đang tải...</p>;
  if (!products?.data || products.data.length === 0)
    return (
      <p style={{ justifyContent: "center", alignItems: "center" }}>
        Không có sản phẩm nào.
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
    console.log("🛠 Dữ liệu gửi lên:", stateDetailsProduct);
    try {
      dispatch(setLoading(true));

      console.log("Access Token:", user.accessToken);

      const resultAction = await dispatch(
        updateProduct({ productId, updatedData: stateDetailsProduct })
      );

      console.log("📤 Dữ liệu gửi lên API:", stateDetailsProduct);

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
    console.log("stateProduct", stateProduct);
    try {
      const validVariants = stateProduct.variants.filter(
        (v) => v.color && v.size
      );

      const newProduct = {
        name: stateProduct.name,
        image: stateProduct.image,
        imagesPreview: stateProduct.imagesPreview,
        type: stateProduct.type,
        price: Number(stateProduct.price),
        countInStock: Number(stateProduct.countInStock),
        rating: Number(stateProduct.rating),
        description: stateProduct.description,
        variants: validVariants,
      };

      console.log("Dữ liệu sản phẩm trước khi gửi:", newProduct);

      // Kiểm tra dữ liệu trước khi gửi
      if (Object.entries(newProduct).some(([key, value]) => value === "")) {
        console.error("🚨 Lỗi: Thiếu trường dữ liệu");
        message.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      const resultAction = await dispatch(createProduct(newProduct));

      if (createProduct.fulfilled.match(resultAction)) {
        setStateProduct((prev) => ({
          ...prev,
          name: "",
          price: "",
          description: "",
          rating: "",
          image: "",
          imagesPreview: [],
          type: "",
          countInStock: "",
          variants: [],
        }));

        setIsModalOpen(false);

        setFileList([]);
        message.success("Thêm sản phẩm thành công!");
        dispatch(getAllProduct());
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
    const { name, value } = e.target;

    setStateProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOnchangeVariants = (index, field, value) => {
    setStateProduct((prev) => {
      const updatedVariants = [...prev.variants];

      // Nếu phần tử chưa tồn tại, tạo một object mặc định
      updatedVariants[index] = updatedVariants[index] || {
        color: "",
        size: "",
        quantity: 0,
      };

      // Cập nhật giá trị cho field cụ thể
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };

      // Tính tổng quantity của tất cả variants
      const totalStock = updatedVariants.reduce(
        (sum, variant) => sum + Number(variant.quantity || 0),
        0
      );

      // Cập nhật state với variants mới và countInStock
      return { ...prev, variants: updatedVariants, countInStock: totalStock };
    });
  };
  const handleOnchangeDetails = (e) => {
    const { name, value } = e.target;

    setStateDetailsProduct((prevState) => ({
      ...prevState, // ✅ Giữ lại các trường trước đó
      [name]: value, // ✅ Cập nhật trường thay đổi
    }));
  };

  const handleOnchangeDetailsVariants = (index, field, value) => {
    setStateDetailsProduct((prev) => {
      const updatedVariants = [...prev.variants];

      // Nếu phần tử chưa tồn tại, tạo một object mặc định
      updatedVariants[index] = updatedVariants[index] || {
        color: "",
        size: "",
        quantity: 0,
      };

      // Cập nhật giá trị cho field cụ thể
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };

      // Tính tổng quantity của tất cả variants
      const totalStock = updatedVariants.reduce(
        (sum, variant) => sum + Number(variant.quantity || 0),
        0
      );

      // Cập nhật state với variants mới và countInStock
      return { ...prev, variants: updatedVariants, countInStock: totalStock };
    });
  };

  const handleChangePreviewImage = async (info) => {
    const newFiles = info.fileList
      .slice(0, 4)
      .map((file) => file.originFileObj || file);

    const formData = new FormData();
    newFiles.forEach((file) => formData.append("images", file));

    try {
      const response = await axios.post(
        `http://localhost:3002/api/product/upload-images`,
        formData,
        {
          headers: { Accept: "application/json" },
        }
      );

      if (response.data && response.data.imageUrls) {
        setStateProduct((prev) => ({
          ...prev,
          imagesPreview: response.data.imageUrls,
        }));
      } else {
        throw new Error("Không tìm thấy danh sách imageUrls trong response!");
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
    }
  };

  const handleChangeMainImage = async (info) => {
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
            height: "100px",
            width: "100px",
            borderStyle: "dashed",
            fontSize: "30px",
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
              variants: [],
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
          handleDeleteManyProducts={handleDeleteManyProducts}
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
            <Select
              placeholder="Chọn loại sản phẩm"
              options={typeOptions}
              value={stateProduct.type}
              onChange={(value) =>
                setStateProduct((prev) => ({ ...prev, type: value }))
              }
            />
          </Form.Item>

          <Form.Item label="Variants">
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Space
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      {/* Select Color */}
                      <Form.Item
                        {...restField}
                        name={[name, "color"]}
                        rules={[
                          { required: true, message: "Vui lòng chọn màu!" },
                        ]}
                      >
                        <Select
                          placeholder="Chọn màu"
                          options={colorOptions}
                          onChange={(value) =>
                            handleOnchangeVariants(index, "color", value)
                          }
                        />
                      </Form.Item>

                      {/* Hiển thị màu */}
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          backgroundColor:
                            stateProduct.variants[index]?.color ||
                            "transparent",
                          border: "1px solid #ccc",
                        }}
                      />

                      {/* Select Size */}
                      <Form.Item
                        {...restField}
                        name={[name, "size"]}
                        rules={[
                          { required: true, message: "Vui lòng chọn size!" },
                        ]}
                      >
                        <Select
                          placeholder="Chọn size"
                          options={sizeOptions}
                          onChange={(value) =>
                            handleOnchangeVariants(index, "size", value)
                          }
                        />
                      </Form.Item>

                      {/* Input Quantity */}
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số lượng!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Số lượng"
                          type="number"
                          onChange={(e) =>
                            handleOnchangeVariants(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>

                      {/* Nút xóa variant */}
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(name);
                          setStateProduct((prev) => {
                            const updatedVariants = [...prev.variants];
                            updatedVariants.splice(index, 1);
                            const totalStock = updatedVariants.reduce(
                              (sum, variant) =>
                                sum + Number(variant.quantity || 0),
                              0
                            );
                            console.log(
                              "Danh sách biến thể sau khi xóa:",
                              updatedVariants
                            );
                            return {
                              ...prev,
                              variants: updatedVariants,
                              countInStock: totalStock,
                            };
                          });
                        }}
                      />
                    </Space>
                  ))}

                  {/* Nút thêm variant mới */}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add();
                        setStateProduct((prev) => {
                          const newVariants = [
                            ...(prev.variants || []),
                            { color: "", size: "", quantity: 0 },
                          ];
                          const totalStock = newVariants.reduce(
                            (sum, variant) =>
                              sum + Number(variant.quantity || 0),
                            0
                          );
                          return {
                            ...prev,
                            variants: newVariants,
                            countInStock: totalStock,
                          };
                        });
                      }}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm biến thể
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          {/* <Form.Item
            label="Count inStock"
            name="countInStock"
            // rules={[
            //   {
            //     required: true,
            //     message: "Please input your count InStock!",
            //   },
            // ]}
          >
            <Form.Item name="countInStock">
              <InputComponent
                value={stateProduct.countInStock}
                readOnly
                name="countInStock"
              />
            </Form.Item>
          </Form.Item> */}

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
            rules={[{ required: true, message: "Please upload an image!" }]}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {/* Ảnh chính */}

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
                      alt="Main Product"
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

                {/* Nút chọn ảnh chính */}
                <Upload
                  beforeUpload={() => false}
                  onChange={handleChangeMainImage}
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button icon={<PlusOutlined />}>Select</Button>
                </Upload>
              </div>
              {/* Khu vực hiển thị ảnh preview */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: "70px",
                      height: "70px",
                      border: "1px dashed #ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderRadius: "5px",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {stateProduct?.imagesPreview?.[index] ? (
                      <img
                        src={stateProduct.imagesPreview[index]}
                        alt={`Preview ${index}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#aaa" }}>+</span> // Hiển thị dấu "+" nếu chưa có ảnh
                    )}
                  </div>
                ))}
              </div>

              {/* Nút chọn ảnh preview */}
              <Upload
                beforeUpload={() => false}
                onChange={handleChangePreviewImage}
                multiple // Cho phép chọn nhiều ảnh
                maxCount={4} // Giới hạn tối đa 4 ảnh
                showUploadList={false}
              >
                <Button icon={<PlusOutlined />}>Select Preview Images</Button>
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
                message: "Vui lòng chọn loại sản phẩm!",
              },
            ]}
          >
            <Select
              placeholder="Chọn loại sản phẩm"
              options={typeOptions}
              value={stateDetailsProduct.type}
              onChange={(value) =>
                setStateDetailsProduct((prev) => ({ ...prev, type: value }))
              }
            />
          </Form.Item>

          <Form.Item label="Variants">
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Space
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      {/* Select Color */}
                      <Form.Item
                        {...restField}
                        name={[name, "color"]}
                        rules={[
                          { required: true, message: "Vui lòng chọn màu!" },
                        ]}
                      >
                        <Select
                          placeholder="Chọn màu"
                          options={colorOptions}
                          onChange={(value) =>
                            handleOnchangeDetailsVariants(index, "color", value)
                          }
                        />
                      </Form.Item>

                      {/* Hiển thị màu */}
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          backgroundColor:
                            stateProduct.variants[index]?.color ||
                            "transparent",
                          border: "1px solid #ccc",
                        }}
                      />

                      {/* Select Size */}
                      <Form.Item
                        {...restField}
                        name={[name, "size"]}
                        rules={[
                          { required: true, message: "Vui lòng chọn size!" },
                        ]}
                      >
                        <Select
                          placeholder="Chọn size"
                          options={sizeOptions}
                          onChange={(value) =>
                            handleOnchangeDetailsVariants(index, "size", value)
                          }
                        />
                      </Form.Item>

                      {/* Input Quantity */}
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số lượng!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Số lượng"
                          type="number"
                          onChange={(e) =>
                            handleOnchangeDetailsVariants(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>

                      {/* Nút xóa variant */}
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(name);
                          setStateDetailsProduct((prev) => {
                            const updatedVariants = [...prev.variants];
                            updatedVariants.splice(index, 1);
                            const totalStock = updatedVariants.reduce(
                              (sum, variant) =>
                                sum + Number(variant.quantity || 0),
                              0
                            );
                            return {
                              ...prev,
                              variants: updatedVariants,
                              countInStock: totalStock,
                            };
                          });
                        }}
                      />
                    </Space>
                  ))}

                  {/* Nút thêm variant mới */}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add();
                        setStateDetailsProduct((prev) => {
                          const newVariants = [
                            ...(prev.variants || []),
                            { color: "", size: "", quantity: 0 },
                          ];
                          const totalStock = newVariants.reduce(
                            (sum, variant) =>
                              sum + Number(variant.quantity || 0),
                            0
                          );
                          console.log(
                            "✅ Danh sách biến thể sau khi thêm:",
                            newVariants
                          );
                          return {
                            ...prev,
                            variants: newVariants,
                            countInStock: totalStock,
                          };
                        });
                      }}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm biến thể
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
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
