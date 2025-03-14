import React, { useEffect, useRef, useState } from "react";
import { WrapperHeader } from "./style";
import { Button, Form, Input, Modal, Space, Upload, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FilterFilled,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import InputComponent from "../InputComponent/InputComponent";
import DrawerComponent from "../DrawerComponent/DrawerComponent";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getBase64 } from "../../utils/UploadAvatar";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
  getDetailsUserById,
} from "../../redux/reducers/adminUserSlice";
import axios from "axios";
import { Swal } from "sweetalert2/dist/sweetalert2";

const AdminUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CopyUserDetails, setCopyStateUser] = useState(null);

  const [stateUser, setStateUser] = useState({
    email: "",
    username: "",
    phone: "",
    dob: "",
    avatar: "",
    gender: "",
    isAdmin: false,
  });

  const [form] = Form.useForm();

  //Chỉnh sửa
  const [stateDetailsUser, setStateDetailsUser] = useState({
    email: "",
    username: "",
    phone: "",
    dob: "",
    avatar: "",
    gender: "",
    isAdmin: false,
  });

  const [fileList, setFileList] = useState([]);
  const dispatch = useDispatch();
  const { products, isloading } = useSelector((state) => state.product);
  const [rowSelected, setRowSelected] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const productDetail = useSelector((state) => state.product.productDetail);
  const { users, data } = useSelector((state) => state.adminUsers);
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
    console.log("adminUsers từ Redux Store:", users);
  }, [users]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      dispatch(getDetailsUserById(rowSelected)).then((response) => {
        if (response.payload) {
          const userDetails = response.payload.data; // Dữ liệu người dùng từ API
          setStateDetailsUser({
            email: userDetails.email,
            username: userDetails.username,
            phone: userDetails.phone,
            dob: userDetails.dob,
            gender: userDetails.gender,
            isAdmin: userDetails.isAdmin,
          });
          form.setFieldsValue(userDetails); // Điền dữ liệu vào form
        }
      });
    }
  }, [isOpenDrawer, rowSelected, dispatch, form]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      dispatch(getDetailsUserById(rowSelected));
      setIsOpenDrawer(true);
    }
  }, [isOpenDrawer, rowSelected]);

  //______________________________________________Set ID cho hàng sản phẩm cần lấy thông tin
  const handleDetailsUser = (id) => {
    setRowSelected(id);
    setTimeout(() => {
      setIsOpenDrawer(true);
      dispatch(getDetailsUserById(id));
    }, 0);
    console.log("CHỈNH SỬA NGƯỜI DÙNG");
  };

  useEffect(() => {
    if (productDetail?.data) {
      setCopyStateUser(productDetail.data);
      setStateDetailsUser({
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

  const renderAction = (id) => {
    return (
      <div>
        <EditOutlined
          style={{ color: "#9FCBFF", fontSize: "20px", cursor: "pointer" }}
          onClick={() => handleDetailsUser(id)}
        />{" "}
        <DeleteOutlined
          style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
          onClick={() => handleDeleteUser(id)}
        />
      </div>
    );
  };

  useEffect(() => {
    //console.log("📌 Trạng thái sau khi reset:", stateUser);
  }, [stateUser]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  //_____________GỌI API VỚI TRANG HIỆN TẠI SAU KHI CHỈNH SỬA HOẶC XÓA
  useEffect(() => {
    dispatch(getAllUsers({ page: currentPage }));
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
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ""}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
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

  //________________________________________________________DỮ LIỆU BẢNG
  //_________________________________________________CÁCH FILTER
  //__________________________________________SERACH
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      ...getColumnSearchProps("username"),
    },
    {
      title: "Email",
      dataIndex: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      ...getColumnSearchProps("phone"),
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      ...getColumnSearchProps("dob"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      ...getColumnSearchProps("gender"),
    },
    {
      title: "Admin",
      dataIndex: "isAdmin",
      render: (isAdmin) => (isAdmin ? "Yes" : "No"),
    },
    {
      title: "Action",
      dataIndex: "_id",
      render: (id) => (
        <div>
          <EditOutlined
            style={{ color: "#9FCBFF", fontSize: "20px", cursor: "pointer" }}
            onClick={() => handleDetailsUser(id)}
          />{" "}
          <DeleteOutlined
            style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
            onClick={() => handleDeleteUser(id)}
          />
        </div>
      ),
    },
  ];

  //____________________________________________Dữ liệu bảng
  const dataTable =
    Array.isArray(users) && users.length > 0
      ? users.map((user) => ({
          ...user,
          key: user._id,
        }))
      : [];

  // console.log("USERS", users);
  //console.log("Product data being passed to TableComponent:", products?.data);

  useEffect(() => {
    //console.log("Redux products:", products);
  }, [users]);

  if (isloading) return <p>Đang tải...</p>;
  if (!users)
    return (
      <p style={{ justifyContent: "center", alignItems: "center" }}>
        Đang trong quá trình tải dữ liệu người dùng....
      </p>
    );
  //_______________________________________________________Xóa sản phẩm
  const handleDeleteUser = async (id) => {
    setRowSelected(id);
    setIsModalOpenDeleteUser(true);
  };

  //________________________________________________________________________Update sản phẩm
  const onApply = async (updatedUser, userId) => {
    try {
      dispatch(setLoading(true));
      const { email, ...dataWithoutEmail } = updatedUser;

      const resultAction = await dispatch(
        updateUser({ userId, updatedData: dataWithoutEmail })
      );
      if (updateUser.fulfilled.match(resultAction)) {
        message.success("Cập nhật người dùng thành công!");
        dispatch(getAllUsers());
        setIsOpenDrawer(false);
      } else {
        throw new Error(resultAction.payload);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      message.error("Cập nhật người dùng thất bại!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onFinish = async () => {
    //console.log("📤 Trạng thái stateUser trước khi gửi:", stateUser);
    //const dispatch = useDispatch();
    //const { loading, error } = useSelector((state) => state.product);

    try {
      const newUser = {
        email: stateUser.email,
        avatar: stateUser.avatar,
        phone: stateUser.phone,
        username: stateUser.username,
        isAdmin: stateUser.isAdmin,
        dob: stateUser.dob,
        gender: stateUser.gender,
      };

      //   console.log("📤 Gửi sản phẩm:", newProduct);

      // Kiểm tra dữ liệu trước khi gửi
      // if (Object.entries(newUser).some(([key, value]) => value === "")) {
      //   console.error("🚨 Lỗi: Thiếu trường dữ liệu");
      //   message.error("Vui lòng điền đầy đủ thông tin!");
      //   return;
      // }

      // dispatch(setLoading(true));

      // 🔥 Dispatch gọi API
      const resultAction = await dispatch(createUser(newUser));

      if (createUser.fulfilled.match(resultAction)) {
        // Swal.fire({
        //   icon: "success",
        //   title: "Tạo sản phẩm thành công!",
        // });

        // Reset form sau khi tạo thành công

        setStateUser((prev) => ({
          ...prev,
          email: "",
          username: "",
          phone: "",
          gender: "",
          avatar: "",
          dob: "",
          isAdmin: "",
        }));

        // setStateUser((prev) => {
        //   const newState = { ...prev, image: response.data.imageUrl };
        //   console.log("Cập nhật state product:", newState);
        //   return newState;
        // });

        // Kiểm tra lại bằng useEffect
        setIsModalOpen(false);
        // console.log("📌 Trạng thái sau khi reset:", stateUser);
        setFileList([]);
        message.success("Thêm sản phẩm thành công!");
        dispatch(getAllUsers());
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
    setStateUser({
      ...stateUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnchangeDetails = (e) => {
    const { name, value } = e.target;

    setStateDetailsUser((prevState) => ({
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

    setStateUser((prev) => ({
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
        setStateUser((prev) => ({
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
      setStateDetailsUser((prev) => ({
        ...prev,
        image: response.data.imageUrl,
      }));
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
    }
  };

  const handleCancel = () => {
    if (CopyUserDetails) {
      setStateDetailsUser(CopyUserDetails);
      form.setFieldsValue(CopyUserDetails);
    }
    setIsModalOpen(false);
    console.log("cancel");
  };

  const handleCancelDeleteProduct = () => {
    setIsModalOpenDeleteProduct(false);
  };

  const onConfirmDelete = async (userId) => {
    setIsModalOpenDeleteUser(false);
    try {
      await dispatch(deleteUser(userId)).unwrap();
      message.success("Xóa người dùng thành công!");
      dispatch(getAllUsers());
    } catch (error) {
      alert(error.message || "Xóa người dùng thất bại!");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <WrapperHeader>Quản lý người dùng</WrapperHeader>
      <div style={{ marginTop: "10px" }}>
        <Button
          style={{
            height: "150px",
            width: "150px",
            borderStyle: "dashed",
            fontSize: "60px",
          }}
          onClick={() => {
            setStateUser({
              email: "",
              username: "",
              phone: "",
              dob: "",
              avatar: "",
              gender: "",
              isAdmin: false,
            });
            setIsModalOpen(true);
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
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <InputComponent
              value={stateUser.name}
              onChange={handleOnchange}
              name="email"
            />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your type!",
              },
            ]}
          >
            <InputComponent
              value={stateUser.type}
              onChange={handleOnchange}
              name="username"
            />
          </Form.Item>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              {
                required: true,
                message: "Please input your count InStock!",
              },
            ]}
          >
            <InputComponent
              value={stateUser.countInStock}
              onChange={handleOnchange}
              name="phone"
            />
          </Form.Item>

          <Form.Item
            label="Birthday"
            name="dob"
            rules={[
              {
                required: true,
                message: "Please input your count price!",
              },
            ]}
          >
            <InputComponent
              value={stateUser.price}
              onChange={handleOnchange}
              name="dob"
            />
          </Form.Item>

          <Form.Item
            label="Gender"
            name="gender"
            rules={[
              {
                required: true,
                message: "Please input your count rating!",
              },
            ]}
          >
            <InputComponent
              value={stateUser.rating}
              onChange={handleOnchange}
              name="gender"
            />
          </Form.Item>

          <Form.Item
            label="Avatar"
            name="avatar"
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
                {stateUser?.avatar ? (
                  <img
                    src={stateUser?.avatar}
                    alt="User"
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
        title="Chỉnh sửa thông tin người dùng"
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
          onFinish={() => onApply(stateDetailsUser, rowSelected)}
          autoComplete="off"
        >
          <Form.Item label="Email" name="email">
            <InputComponent
              value={stateDetailsUser.email}
              readOnly
              disabled
              // onChange={(e) =>
              //   setStateDetailsUser((prev) => ({
              //     ...prev,
              //     username: e.target.value,
              //   }))
              // }
            />
          </Form.Item>

          <Form.Item label="Username" name="username">
            <InputComponent
              value={stateDetailsUser.username}
              onChange={(e) =>
                setStateDetailsUser((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <InputComponent
              value={stateDetailsUser.phone}
              onChange={(e) =>
                setStateDetailsUser((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Date of Birth" name="dob">
            <InputComponent
              value={stateDetailsUser.dob}
              onChange={(e) =>
                setStateDetailsUser((prev) => ({
                  ...prev,
                  dob: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Gender" name="gender">
            <InputComponent
              value={stateDetailsUser.gender}
              onChange={(e) =>
                setStateDetailsUser((prev) => ({
                  ...prev,
                  gender: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Admin" name="isAdmin">
            <InputComponent
              type="checkbox"
              checked={stateDetailsUser.isAdmin}
              onChange={(e) =>
                setStateDetailsUser((prev) => ({
                  ...prev,
                  isAdmin: e.target.checked,
                }))
              }
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Apply
            </Button>
          </Form.Item>
        </Form>
      </DrawerComponent>
    </div>
  );
};

export default AdminUser;
