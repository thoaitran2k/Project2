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

import { productTypeConfig, getAllColorOptions } from "./configs/productConfig";
import ProductVariants from "./ProductVariants";
import ImportProductButton from "./ImportProductButton";
import {
  DeleteOutlined,
  EditOutlined,
  FilterFilled,
  MinusCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
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
import { getAllTypeProduct } from "../../Services/ProductService";

//import { createProduct } from "../../Services/ProductService";

const AdminProduct = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [CopyProductDetails, setCopyProductDetails] = useState(null);

  //________________________________________________________________________________________________________________________________________________PHÂN LOẠI SẢN PHẨM

  //_______________________________________________________________________________________________________________________________________________________

  //COLOR_____________________________________
  const colorMap = {
    Hồng: "#FF69B4",
    Nâu: "#8B4513",
    Đen: "#000000",
    Trắng: "#FFFFFF",
    "Xanh dương": "#0000FF",
    "Xanh lá": "#008000",
    Vàng: "#FFD700",
  };

  const [modalForm] = Form.useForm(); // Cho Modal thêm sản phẩm
  const [drawerForm] = Form.useForm(); // Cho Drawer chỉnh sửa

  const colorOptions = getAllColorOptions();

  const [typeOptions, setTypeOptions] = useState([
    { value: "Áo nam", label: "Áo nam" },
    { value: "Quần nam", label: "Quần nam" },
    { value: "Áo nữ", label: "Áo nữ" },
    { value: "Quần nữ", label: "Quần nữ" },
    { value: "Đồng hồ", label: "Đồng hồ" },
    { value: "Trang sức", label: "Trang sức" },
    { value: "Ví", label: "Ví" },
    { value: "Túi xách", label: "Túi xách" },
  ]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await getAllTypeProduct();
        const data = response.data;

        if (Array.isArray(data)) {
          const apiOptions = data.map((item) => ({
            value: item,
            label: item,
          }));

          // Hợp nhất danh sách API với danh sách thủ công (loại bỏ trùng)
          const mergedOptions = [
            ...typeOptions,
            ...apiOptions.filter(
              (apiItem) => !typeOptions.some((t) => t.value === apiItem.value)
            ),
          ];

          setTypeOptions(mergedOptions);
        }
      } catch (error) {
        console.error("🚨 Lỗi lấy danh mục sản phẩm:", error.message);
      }
    };

    fetchTypes();
  }, []);

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
    variants: [],
    diameter: [],
    size: "", // Thêm trường variants
  });

  const [stateDetailsProduct, setStateDetailsProduct] = useState({
    name: "",
    price: "",
    description: "",
    rating: "",
    image: "",
    type: "",
    countInStock: "",
    variants: [],
    diameter: [],
    sizeOptions: [],
    colorOptions: [],
  });

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
    drawerForm.resetFields();
    setRowSelected(id);
    dispatch(getDetailsProductById(id));
    setIsOpenDrawer(true);
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
    if (productDetail?.data) {
      const productData = productDetail.data;

      // 1. Tạo bản sao dữ liệu gốc
      setCopyProductDetails({ ...productData });

      // 2. Xử lý variants theo loại sản phẩm
      let processedVariants = [];

      if (productData.type === "Đồng hồ") {
        processedVariants = (productData.variants || []).map((v) => ({
          ...v,
          diameter: Array.isArray(v.diameter)
            ? v.diameter
            : [v.diameter].filter(Boolean),
          quantity: Number(v.quantity) || 0,
        }));
      } else if (["Túi xách", "Ví", "Trang sức"].includes(productData.type)) {
        processedVariants = (productData.variants || []).map((v) => ({
          quantity: Number(v.quantity) || 0,
        }));
      } else {
        processedVariants = (productData.variants || []).map((v) => ({
          color: v.color || "",
          size: v.size || "",
          quantity: Number(v.quantity) || 0,
        }));
      }

      // 3. Chuẩn bị dữ liệu cập nhật
      const updatedProduct = {
        name: productData.name || "",
        price: productData.price ? Number(productData.price) : 0,
        description: productData.description || "",
        rating: productData.rating ? Number(productData.rating) : 0,
        image: productData.image || "",
        imagesPreview: Array.isArray(productData.imagesPreview)
          ? productData.imagesPreview.filter((url) => typeof url === "string")
          : [],
        type: productData.type || "",
        countInStock: processedVariants.reduce(
          (sum, v) => sum + (v.quantity || 0),
          0
        ),
        variants: processedVariants,
        diameter:
          productData.type === "Đồng hồ"
            ? [...new Set(processedVariants.flatMap((v) => v.diameter || []))]
            : [],
        size: ["Quần nam", "Quần nữ", "Áo nam", "Áo nữ"].includes(
          productData.type
        )
          ? processedVariants[0]?.size
          : undefined,
      };

      console.log("Processed product data:", updatedProduct);

      // 4. Cập nhật state
      setStateDetailsProduct(updatedProduct);

      // 5. Thiết lập giá trị form - THÊM CÁC TRƯỜNG HÌNH ẢNH
      const formValues = {
        name: updatedProduct.name,
        price: updatedProduct.price,
        description: updatedProduct.description,
        rating: updatedProduct.rating,
        type: updatedProduct.type,
        variants: updatedProduct.variants,
        diameter:
          stateDetailsProduct.type === "Đồng hồ"
            ? [...new Set(processedVariants.flatMap((v) => v.diameter || []))]
            : [],
        image: updatedProduct.image,
        imagesPreview: updatedProduct.imagesPreview,
      };

      drawerForm.setFieldsValue(formValues);

      setFileList(
        updatedProduct.image
          ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: updatedProduct.image,
              },
            ]
          : []
      );
    } else {
      // Reset nếu không có dữ liệu
      setStateDetailsProduct({
        name: "",
        price: "",
        description: "",
        rating: "",
        image: "",
        type: "",
        countInStock: "",
        variants: [],
        diameter: [],
        size: "",
        imagesPreview: [],
      });
      drawerForm.resetFields();
      setFileList([]);
    }
  }, [productDetail, drawerForm]);

  const handleUpdateDiameter = (updatedDiameters) => {
    setStateDetailsProduct((prev) => ({
      ...prev,
      diameter: updatedDiameters,
    }));
  };
  //________________XÓA ẢNH PREVIEW KHI CHỈNH SỬA

  useEffect(() => {
    const savedPage = localStorage.getItem("savedPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage)); // Đặt lại currentPage từ localStorage
      localStorage.removeItem("savedPage"); // Xóa savedPage để tránh ảnh hưởng lần sau
    }
  }, []);

  const handleRemovePreviewImage = (index) => {
    setStateDetailsProduct((prev) => {
      if (!prev?.imagesPreview) return prev; // Kiểm tra nếu mảng không tồn tại

      const newImages = [...prev.imagesPreview];
      newImages.splice(index, 1); // Xóa ảnh khỏi mảng

      return { ...prev, imagesPreview: newImages }; // Cập nhật state mới
    });
  };
  //________________THÊM, XÓA, SỬA ẢNH PREVIEW KHI CHỈNH SỬA
  //*********************************** */
  const handleUpdateImage = async () => {
    // Lấy danh sách ảnh hiện tại
    const currentImages = stateDetailsProduct.imagesPreview || [];

    // Lọc ra các ảnh mới (file) chưa có URL
    const newImages = currentImages.filter((img) => img instanceof File);

    // Nếu không có ảnh mới, trả về danh sách cũ luôn
    if (newImages.length === 0) return currentImages;

    const formData = new FormData();
    newImages.forEach((file) => formData.append("images", file));

    try {
      const response = await axios.post(
        `http://localhost:3002/api/product/upload-images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data && response.data.imageUrls) {
        // Ghép ảnh cũ (URL) với ảnh mới đã upload lên
        return [
          ...currentImages.filter((img) => typeof img === "string"), // Giữ lại URL ảnh cũ
          ...response.data.imageUrls, // Thêm ảnh mới từ server
        ].slice(0, 4); // Giới hạn tối đa 4 ảnh
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      message.error("Lỗi tải ảnh lên!");
    }

    return currentImages; // Nếu lỗi, vẫn trả về danh sách ảnh cũ
  };

  const isUploading = useRef(false);

  const handleAddPreviewImage = async (fileList) => {
    if (!fileList || fileList.length === 0 || isUploading.current) return;

    isUploading.current = true; // Đánh dấu đang upload

    const existingImages = stateDetailsProduct?.imagesPreview || [];
    const availableSlots = 4 - existingImages.length;

    // Giới hạn số lượng ảnh tối đa là 4
    if (fileList.length > availableSlots) {
      message.warning(`Bạn chỉ có thể thêm tối đa ${availableSlots} ảnh nữa!`);
      fileList = fileList.slice(0, availableSlots);
    }

    const formDataArray = fileList.map((file) => {
      const formData = new FormData();
      formData.append("image", file);
      return formData;
    });

    try {
      // Upload tất cả các ảnh lên server
      const uploadPromises = formDataArray.map((formData) =>
        axios.post(`http://localhost:3002/api/product/upload-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        })
      );

      const responses = await Promise.all(uploadPromises);
      const newImageUrls = responses.map((res) => res.data.imageUrl).flat();

      setStateDetailsProduct((prev) => {
        const updatedImagesPreview = [
          ...(Array.isArray(prev.imagesPreview) ? prev.imagesPreview : []),
          ...newImageUrls,
        ].slice(0, 4);

        return {
          ...prev,
          imagesPreview: updatedImagesPreview,
        };
      });
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
    } finally {
      isUploading.current = false;
    }
  };

  //CHỈNH SỬA ẢNH PREVIEW CHI TIẾT SẢN PHẨM

  //_________________________________________________________KIỂM TRA STATEDETAILSPRODUCT BIẾN ĐỘNG
  useEffect(() => {}, [stateDetailsProduct]);

  //_____________________ĐẾM SỐ LƯỢNG TỒN KHO

  //ĐẾM SỐ LƯỢNG SẢN PHẨM
  const totalProducts = products?.total || 0;

  // Lấy tất cả các ID sản phẩm từ tất cả các trang
  const allProductIds = products?.data?.map((product) => product._id) || [];

  useEffect(() => {}, [stateProduct.variants]);

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
        const colorOrder = [
          "Trắng",
          "Đen",
          "Xanh dương",
          "Xanh lá",
          "Hồng",
          "Nâu",
          "Vàng",
        ];
        const uniqueColors = [
          ...new Set(
            record.variants.map((v) => v.color?.trim()).filter(Boolean)
          ),
        ].sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b)); // Sắp xếp theo thứ tự ưu tiên

        return (
          <div
            style={{ display: "flex", gap: "5px", justifyContent: "center" }}
          >
            {uniqueColors.map((color, index) => {
              const borderColor = color === "Trắng" ? "#000" : "#ccc";
              return (
                <div
                  key={index}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: colorMap[color] || "#ccc",
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

        // Nếu sản phẩm là Trang sức, Ví, Túi xách, không cần size
        if (["Trang sức", "Ví", "Túi xách"].includes(record.type)) {
          return "no size"; // Hoặc có thể để trống hoặc thông báo khác
        }

        // Nếu sản phẩm là Quần nam hoặc Quần nữ, hiển thị size từ 28 đến 32
        if (["Quần nam", "Quần nữ"].includes(record.type)) {
          const allowedSizes = ["28", "29", "30", "31", "32"];
          record.variants.forEach(({ size, quantity }) => {
            if (allowedSizes.includes(size)) {
              sizeMap[size] = (sizeMap[size] || 0) + Number(quantity);
            }
          });

          return Object.entries(sizeMap)
            .map(([size, quantity]) => `${size} (${quantity})`)
            .join(", ");
        }

        // Nếu sản phẩm là Đồng hồ, hiển thị "Mặt" {diameter} quantity
        if (record.type === "Đồng hồ") {
          const diameterMap = {};

          record.variants.forEach(({ diameter, quantity }) => {
            if (diameter) {
              diameterMap[diameter] =
                (diameterMap[diameter] || 0) + Number(quantity);
            }
          });

          return Object.entries(diameterMap)
            .map(([diameter, quantity]) => `d:${diameter}mm (${quantity})`)
            .join(", ");
        }

        // Gộp số lượng theo size cho các sản phẩm khác
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

  // //_______________________________________________________Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    setRowSelected(id);
    setIsModalOpenDeleteProduct(true);
  };

  //_____________________________________________________________________________

  //________________________________________________________________________Update sản phẩm
  const Submit = async () => {
    console.log("Bắt đầu thêm sản phẩm");
    try {
      dispatch(setLoading(true));

      // Kiểm tra các trường bắt buộc
      if (!stateProduct.name || !stateProduct.type || !stateProduct.price) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      // Xử lý variants
      const validVariants = stateProduct.variants.filter(
        (v) => v.color || v.size || v.diameter || v.quantity
      );

      if (validVariants.length === 0) {
        message.error("Vui lòng thêm ít nhất một biến thể sản phẩm!");
        return;
      }

      if (
        stateProduct.type === "Đồng hồ" &&
        !validVariants.some((v) => v.diameter)
      ) {
        message.error("Vui lòng nhập đường kính cho đồng hồ!");
        return;
      }

      // Xử lý ảnh
      const imageUrls = await handleUpload();
      if (!imageUrls || imageUrls.length === 0) {
        message.error("Vui lòng tải lên ít nhất một ảnh!");
        return;
      }

      // Chuẩn bị dữ liệu sản phẩm mới
      const newProduct = {
        name: stateProduct.name,
        image: imageUrls[0],
        imagesPreview: imageUrls,
        type: stateProduct.type,
        price: Number(stateProduct.price),
        countInStock: validVariants.reduce(
          (sum, v) => sum + (Number(v.quantity) || 0),
          0
        ),
        rating: Number(stateProduct.rating) || 0,
        description: stateProduct.description || "",
        variants: validVariants,
        diameter:
          stateProduct.type === "Đồng hồ"
            ? [...new Set(validVariants.map((v) => v.diameter).filter(Boolean))]
            : [],
        size: ["Quần nam", "Quần nữ", "Áo nam", "Áo nữ"].includes(
          stateProduct.type
        )
          ? validVariants[0]?.size
          : undefined,
      };

      console.log("Dữ liệu sản phẩm sẽ được gửi:", newProduct);

      // Gửi yêu cầu tạo sản phẩm
      const result = await dispatch(createProduct(newProduct)).unwrap();

      // Xử lý sau khi thành công
      message.success("Thêm sản phẩm thành công!");
      dispatch(getAllProduct({ page: currentPage }));

      // Reset form và đóng modal
      modalForm.resetFields();
      setStateProduct({
        name: "",
        price: "",
        description: "",
        rating: "",
        image: "",
        imagesPreview: [],
        type: "",
        countInStock: "",
        variants: [],
        diameter: "",
        size: "",
      });
      setIsModalOpen(false);
      setSelectedFiles([]);
      setFileList([]);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      message.error(`Thêm sản phẩm thất bại: ${error.message}`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const processVariantsBeforeSubmit = ({ variants = [], productType }) => {
    const config = productTypeConfig[productType];

    const processedVariants = variants.map((variant) => {
      const processed = {
        quantity: Number(variant.quantity) || 0,
      };

      // Xử lý theo cấu hình từng loại sản phẩm
      if (config.hasColor && variant.color) {
        processed.color = variant.color;
      }

      if (config.hasSize && variant.size) {
        processed.size = variant.size;
      }

      // Chỉ xử lý diameter cho sản phẩm cần diameter
      if (config.hasDiameter && variant.diameter !== undefined) {
        processed.diameter = Array.isArray(variant.diameter)
          ? Number(variant.diameter[0]) || 0
          : Number(variant.diameter) || 0;
      }

      return processed;
    });

    // Chỉ tính diameter root cho sản phẩm cần diameter
    const uniqueDiameters = config.hasDiameter
      ? [
          ...new Set(
            processedVariants
              .map((v) => v.diameter)
              .filter((d) => d !== undefined && !isNaN(d))
          ),
        ]
      : undefined;

    return {
      variants: processedVariants,
      diameter: uniqueDiameters,
    };
  };

  const onApply = async () => {
    console.log("Bắt đầu cập nhật sản phẩm");
    try {
      dispatch(setLoading(true));

      // Kiểm tra dữ liệu
      if (
        !stateDetailsProduct.variants ||
        stateDetailsProduct.variants.length === 0
      ) {
        message.error("Vui lòng thêm ít nhất một biến thể sản phẩm!");
        return;
      }

      // Xử lý variants và tính diameter root
      const { variants: processedVariants, diameter: processedDiameters } =
        processVariantsBeforeSubmit({
          variants: stateDetailsProduct.variants,
          productType: stateDetailsProduct.type,
        });

      // Kiểm tra các trường bắt buộc
      const config = productTypeConfig[stateDetailsProduct.type] || {};
      const invalidVariants = processedVariants.some((variant) => {
        // Kiểm tra chung
        if (variant.quantity <= 0) return true;

        // Kiểm tra theo loại sản phẩm
        if (config.hasColor && !variant.color) return true;
        if (config.hasSize && !variant.size) return true;

        // Chỉ validate diameter nếu sản phẩm yêu cầu
        if (config.hasDiameter && variant.diameter === undefined) return true;

        return false;
      });

      if (invalidVariants) {
        message.error("Vui lòng điền đầy đủ thông tin cho tất cả biến thể!");
        return;
      }

      // Chuẩn bị dữ liệu cập nhật
      const updatedProduct = {
        ...stateDetailsProduct,
        variants: processedVariants,
        diameter: processedDiameters, // Thêm diameter root
        countInStock: processedVariants.reduce((sum, v) => sum + v.quantity, 0),
        imagesPreview: Array.isArray(stateDetailsProduct.imagesPreview)
          ? stateDetailsProduct.imagesPreview.filter(
              (url) => typeof url === "string"
            )
          : [],
        image: stateDetailsProduct.image || "",
      };

      console.log("Dữ liệu cập nhật sản phẩm:", updatedProduct);

      // Gửi yêu cầu cập nhật
      await dispatch(
        updateProduct({
          productId: rowSelected,
          updatedData: updatedProduct,
        })
      ).unwrap();

      // Xử lý sau khi thành công
      message.success("Cập nhật sản phẩm thành công!");
      dispatch(getAllProduct({ page: currentPage }));

      // Reset và đóng drawer
      drawerForm.resetFields();
      setIsOpenDrawer(false);
    } catch (error) {
      console.error("Chi tiết lỗi từ server:", error.response?.data);
      message.error(`Cập nhật sản phẩm thất bại: ${error.message}`);
    } finally {
      dispatch(setLoading(false));
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

      // Khởi tạo variant nếu chưa có
      updatedVariants[index] = updatedVariants[index] || {
        quantity: 0,
        diameter: 0,
      };

      // Cập nhật giá trị
      updatedVariants[index][field] =
        field === "quantity" ? Number(value) || 0 : value;

      // Tính toán lại các giá trị tổng hợp
      const totalStock = updatedVariants.reduce(
        (sum, v) => sum + (Number(v.quantity) || 0),
        0
      );

      // Tính toán diameter root từ các variants
      const allDiameters = [
        ...new Set(
          updatedVariants
            .map((v) => v.diameter)
            .filter((d) => d !== undefined && !isNaN(d))
        ),
      ];

      return {
        ...prev,
        variants: updatedVariants,
        countInStock: totalStock,
        diameter: allDiameters,
      };
    });
  };

  const handleChangePreviewImage = (info) => {
    const newFiles = info.fileList
      .slice(0, 4)
      .map((file) => file.originFileObj || file);

    // 🖼️ Hiển thị ảnh preview ngay lập tức
    const previewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setStateProduct((prev) => ({
      ...prev,
      imagesPreview: previewUrls, // Cập nhật ảnh trên UI ngay lập tức
    }));

    // Lưu files vào state để chuẩn bị gửi API
    setSelectedFiles(newFiles);
  };

  const handleUpload = async () => {
    console.log("📤 Bắt đầu upload ảnh...");

    if (!selectedFiles || selectedFiles.length === 0) {
      message.warning("Vui lòng chọn ảnh trước khi upload!");
      return [];
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      console.log("🖼 Đang thêm file vào FormData:", file);
      formData.append("images", file);
    });

    try {
      const response = await axios.post(
        `http://localhost:3002/api/product/upload-images`,
        formData,
        { headers: { Accept: "application/json" } }
      );

      console.log("📥 Kết quả API upload:", response.data);

      if (
        response.data &&
        response.data.imageUrls &&
        response.data.imageUrls.length > 0
      ) {
        return response.data.imageUrls; // ✅ Trả về danh sách URL ảnh
      } else {
        throw new Error("Không tìm thấy danh sách imageUrls trong response!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
      return [];
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
    if (!fileList || fileList.length === 0 || isUploading.current) return;

    isUploading.current = true; // Đánh dấu đang upload

    const file = fileList[0]; // Giới hạn chỉ 1 file, ảnh chính chỉ có thể là một ảnh duy nhất

    // Kiểm tra xem file.originFileObj có phải là một đối tượng Blob hay không
    if (file.originFileObj instanceof Blob) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }

      setFileList(fileList ? fileList.slice(-1) : []); // Giới hạn chỉ 1 file

      const formData = new FormData();
      formData.append("image", file.originFileObj);

      try {
        // Upload ảnh chính lên server
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

        // Đảm bảo image là một chuỗi, không phải mảng
        const imageUrl = response.data.imageUrl && response.data.imageUrl[0]; // Lấy URL đầu tiên trong mảng nếu nó là mảng

        // Cập nhật ảnh chính vào state (image là chuỗi, không phải mảng)
        setStateDetailsProduct((prev) => ({
          ...prev,
          image: imageUrl || "", // Lưu URL ảnh chính vào image
          // Không cần phải cập nhật imagesPreview trong hàm này, chỉ cần ảnh chính
        }));
      } catch (error) {
        console.error("Lỗi khi tải ảnh lên:", error);
        message.error("Tải ảnh lên thất bại!");
      } finally {
        isUploading.current = false; // Reset trạng thái sau khi hoàn tất
      }
    } else {
      message.error("Đây không phải là một tệp hợp lệ.");
    }
  };

  const handleCancel = () => {
    modalForm.resetFields();
    setStateProduct({
      name: "",
      price: "",
      description: "",
      rating: "",
      image: "",
      imagesPreview: [],
      type: "",
      countInStock: "",
      variants: [],
      diameter: "",
      size: "",
    });
    setIsModalOpen(false);
  };

  const handleCloseDrawer = () => {
    drawerForm.resetFields();
    setStateDetailsProduct({
      name: "",
      price: "",
      description: "",
      rating: "",
      image: "",
      type: "",
      countInStock: "",
      variants: [],
      diameter: "",
      sizeOptions: [],
      colorOptions: [],
    });
    setIsOpenDrawer(false);
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

  //_________________________IMPORT SẢN PHẨM BẰNG FILE EXCEL

  //_______________________________________________________________________________________________________________
  return (
    <div style={{ width: "100%" }}>
      <WrapperHeader>Quản lý sản phẩm</WrapperHeader>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          flexDirection: "row",
          gap: 20,
        }}
      >
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
              imagesPreview: [],
              type: "",
              countInStock: "",
              variants: [],
            });
            //setStateProduct(newProduct);
            setFileList([]);
            modalForm.resetFields();
            //form.setFieldsValue(newProduct); // Xóa danh sách file nếu có
            setIsModalOpen(true); // ⏳ Delay mở modal để React cập nhật state
          }}
        >
          <PlusOutlined />
        </Button>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <ImportProductButton />
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <TableComponent
          columns={columns}
          products={products?.data}
          isloading={isloading}
          data={dataTable}
          onChange={handleTableChange}
          handleDeleteManyProducts={handleDeleteManyProducts}
          totalProducts={totalProducts}
          allProductIds={allProductIds}
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
        style={{ top: 5 }}
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
          form={modalForm}
          //   }}
          onFinish={Submit}
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
            <ProductVariants
              productType={stateProduct.type} // Loại sản phẩm (Áo nam, Đồng hồ...)
              variants={stateProduct.variants || []} // Danh sách variants
              onUpdateDiameter={handleUpdateDiameter}
              onChange={(newVariants) => {
                // Cập nhật state khi có thay đổi
                setStateProduct((prev) => ({
                  ...prev,
                  variants: newVariants,
                  countInStock: newVariants.reduce(
                    (sum, v) => sum + (v.quantity || 0),
                    0
                  ),
                }));
              }}
            />
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
                    width: "150px",
                    height: "150px",
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
                multiple
                maxCount={4}
                showUploadList={false}
              >
                <Button icon={<PlusOutlined />}>Select Preview Images</Button>
              </Upload>

              {/* Nút Upload */}
              <Button onClick={handleUpload} icon={<UploadOutlined />}>
                Upload Images
              </Button>
            </div>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 6,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="apply">
              Thêm sản phẩm
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
        onClose={handleCloseDrawer}
        width="80%"
        style={{ transition: "transform 0.9s ease-in-out" }}
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
          form={drawerForm}
          //   }}
          onFinish={onApply}
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
            <ProductVariants
              productType={stateDetailsProduct.type}
              variants={stateDetailsProduct.variants}
              onUpdateDiameter={handleUpdateDiameter}
              onChange={(newVariants) => {
                const totalStock = newVariants.reduce(
                  (sum, v) => sum + (Number(v.quantity) || 0),
                  0
                ); // Sửa lại dòng này
                setStateDetailsProduct((prev) => ({
                  ...prev,
                  variants: newVariants,
                  countInStock: totalStock,
                }));
              }}
            />
          </Form.Item>

          <Form.Item
            label="Count inStock"
            name="countInStock"
            // rules={[
            //   {
            //     required: true,
            //     message: "Please input your count InStock!",
            //   },
            // ]}
          >
            <InputComponent
              value={stateDetailsProduct.countInStock}
              //onChange={handleOnchangeDetails}
              name="countInStock"
              disabled
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
                  width: "120px",
                  height: "120px",
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

          <Form.Item label="Preview Images">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {stateDetailsProduct?.imagesPreview?.length > 0 ? (
                stateDetailsProduct.imagesPreview
                  .slice(0, 4)
                  .map((image, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        style={{
                          width: "75px",
                          height: "75px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                      {/* Xóa ảnh */}
                      <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemovePreviewImage(index)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          color: "red",
                        }}
                      />
                      {/* Chỉnh sửa ảnh (Thay thế ảnh cũ) */}
                    </div>
                  ))
              ) : (
                <span style={{ color: "#aaa" }}>No preview images</span>
              )}

              {/* Nút thêm ảnh mới */}
              {stateDetailsProduct?.imagesPreview?.length < 4 && (
                <Upload
                  multiple
                  beforeUpload={(file, fileList) => {
                    handleAddPreviewImage(fileList);
                    return false;
                  }}
                  showUploadList={false}
                >
                  <Button icon={<PlusOutlined />}>Add Image</Button>
                </Upload>
              )}
            </div>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 6,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Apply
            </Button>
          </Form.Item>
        </Form>
      </DrawerComponent>
    </div>
  );
};

export default AdminProduct;
