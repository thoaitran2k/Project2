import React, { useEffect, useRef, useState } from "react";
import { TableProduct, WrapperHeader } from "./style";
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Upload,
  message,
  DatePicker,
  Select,
  Tooltip,
  AutoComplete,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FilterFilled,
  LockOutlined,
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
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const AdminUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CopyUserDetails, setCopyStateUser] = useState(null);
  const [errorFormatDate, setErrorFormatDate] = useState("");

  const [stateUser, setStateUser] = useState({
    email: "",
    username: "",
    phone: "",
    dob: "",
    avatar: "",
    gender: "",
    isAdmin: false,
  });

  const handleToggleBlockUser = async (id, isBlocked) => {
    try {
      await axios.put(`http://localhost:3002/api/user/block/${id}`, {
        isBlocked: !isBlocked,
      });

      message.success(
        !isBlocked ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!"
      );

      // Gọi lại danh sách người dùng sau khi cập nhật
      dispatch(getAllUsers());
    } catch (error) {
      message.error("error");
      console.log("Lỗi?", error);
    }
  };

  const [form] = Form.useForm();
  const { Option } = Select;

  //Chỉnh sửa
  const [stateDetailsUser, setStateDetailsUser] = useState({
    email: "",
    username: "",
    phone: "",
    dob: "",
    avatar: "",
    gender: "",
    address: [], // Danh sách địa chỉ
    defaultAddress: null,
    isAdmin: false,
  });

  const [fileList, setFileList] = useState([]);
  const dispatch = useDispatch();
  const { products, isloading } = useSelector((state) => state.product);
  const [rowSelected, setRowSelected] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const userDetail = useSelector((state) => state.user.userDetail);
  const { users, data } = useSelector((state) => state.adminUsers);
  const [isModalOpenDeleteUser, setIsModalOpenDeleteUser] = useState(false);
  const [isModalOpenBlockUser, setIsModalOpenBlockUser] = useState(false);

  //_______________________________________________________XÁC ĐỊNH TRANG SẢN PHẨM BỊ UPDATE
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const currentUsers = users.slice(startIndex, endIndex); // Lấy dữ liệu cho trang hiện tại
  const emptyRowsCount = 10 - currentUsers.length; // Số hàng trống cần thêm
  // Tạo một bản sao của mảng users trước khi sắp xếp
  const sortedUsers = Array.isArray(users)
    ? [...users].sort((a, b) => (b.isAdmin ? 1 : -1)) // Sử dụng spread để tạo bản sao
    : [];

  // Tạo mảng hàng trống
  const emptyRows = Array.from({ length: emptyRowsCount }, () => ({}));

  //______________________SEARCH AND FILTER
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [filteredInfo, setFilteredInfo] = useState({
    price: null,
    rating: null,
    type: null,
  }); //________________________Giá trị filter

  //_________________________________________HÀM HANDLE KHI CHỌN NGÀY
  const handleDateChange = (date, dateString) => {
    // Kiểm tra nếu ngày nhập vào không hợp lệ
    if (!dayjs(dateString, "DD/MM/YYYY", true).isValid()) {
      message.error(
        "❌ Ngày tháng không hợp lệ! Vui lòng nhập theo định dạng DD/MM/YYYY."
      );
      return;
    }

    // Lưu trữ giá trị `dob` dưới dạng DD-MM-YYYY
    const formattedDate = dayjs(dateString, "DD/MM/YYYY").format("DD-MM-YYYY");
    setStateDetailsUser((prev) => ({
      ...prev,
      dob: formattedDate,
    }));
  };

  //_________________________________VALIDDATE
  const isValidDate = (dateString) => {
    return dayjs(dateString, "DD-MM-YYYY", true).isValid();
  };

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
    //console.log("adminUsers từ Redux Store:", users);
  }, [users]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      dispatch(getDetailsUserById(rowSelected)).then((response) => {
        if (response.payload) {
          const userDetails = response.payload.data;

          // Chuyển đổi `dob` từ chuỗi ISO 8601 sang định dạng DD-MM-YYYY
          const formattedDob = userDetails.dob
            ? dayjs(userDetails.dob).format("DD-MM-YYYY")
            : null;

          const defaultAddress =
            userDetails.address?.find((addr) => addr.isDefault) || null;
          console.log("Default Address:", defaultAddress);
          console.log("Address:", userDetails.address);

          // Cập nhật state và form
          setStateDetailsUser({
            ...userDetails,
            dob: formattedDob,
            defaultAddress,
          });

          form.setFieldsValue({
            ...userDetails,
            dob: formattedDob ? dayjs(formattedDob, "DD-MM-YYYY") : null,
            defaultAddress: defaultAddress?._id || null,
          });
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
    setIsOpenDrawer(true); // Mở Drawer
    dispatch(getDetailsUserById(id)); // Gọi API lấy thông tin người dùng
  };

  useEffect(() => {
    if (userDetail?.data) {
      // Thay productDetail bằng userDetail
      setCopyStateUser(userDetail.data);
      setStateDetailsUser({
        email: userDetail.data.email,
        username: userDetail.data.username,
        phone: userDetail.data.phone,
        dob: userDetail.data.dob, // Định dạng DD-MM-YYYY
        gender: userDetail.data.gender,
        isAdmin: userDetail.data.isAdmin,
        avatar: userDetail.data.avatar,
      });

      form.setFieldsValue({
        email: userDetails.email,
        username: userDetails.username,
        phone: userDetails.phone,
        dob: userDetails.dob ? dayjs(userDetails.dob, "DD-MM-YYYY") : null, // Parse dob thành dayjs
        gender: userDetails.gender,
        isAdmin: userDetails.isAdmin,
        avatar: userDetails.avatar,
      });
    }
  }, [userDetail, form]);

  useEffect(() => {
    //console.log("📌 Trạng thái sau khi reset:", stateUser);
  }, [stateUser]);

  useEffect(() => {
    dispatch(getAllUsers()).then((response) => {
      if (response.payload) {
        const usersWithBlockedStatus = response.payload.data.map((user) => ({
          ...user,
          isBlocked: user.isBlocked || false, // Thêm thuộc tính isBlocked nếu chưa có
        }));
        // Cập nhật state hoặc store với dữ liệu đã xử lý
      }
    });
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
      align: "center",
      ...getColumnSearchProps("username"),
      render: (text, record) => {
        if (!record._id) return null; // Hàng trống, trả về null
        return <div style={{ textAlign: "left" }}>{text}</div>;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      ...getColumnSearchProps("email"),
      render: (text, record) => {
        if (!record._id) return null; // Hàng trống, trả về null
        return <div style={{ textAlign: "left" }}>{text}</div>;
      },
    },
    {
      title: "Default Address",
      dataIndex: "address",
      align: "center",
      width: "10vw",
      render: (address, record) => {
        if (!record._id) return null; // Hàng trống, trả về null

        // Kiểm tra xem address có tồn tại và là một mảng
        if (Array.isArray(address)) {
          const defaultAddress = address.find((addr) => addr.isDefault);
          return (
            <div style={{ textAlign: "left" }}>
              {defaultAddress ? defaultAddress.address : "No default address"}
            </div>
          );
        }

        // Nếu address không tồn tại hoặc không phải là mảng, trả về "No default address"
        return <div style={{ textAlign: "left" }}>No default address</div>;
      },
    },
    {
      title: "Phone",
      dataIndex: "phone",
      align: "center",
      ...getColumnSearchProps("phone"),
      render: (text, record) => {
        if (!record._id) return null; // Hàng trống, trả về null
        return text;
      },
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      align: "center",
      render: (dob, record) => {
        if (!record._id) return null; // Hàng trống, trả về null
        return dob && dayjs(dob, "DD-MM-YYYY").isValid()
          ? dayjs(dob, "DD-MM-YYYY").format("DD-MM-YYYY")
          : "";
      },
      ...getColumnSearchProps("dob"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      align: "center",
      ...getColumnSearchProps("gender"),
      render: (text, record) => {
        if (!record._id) return null; // Hàng trống, trả về null
        return text;
      },
    },
    {
      title: "Admin",
      dataIndex: "isAdmin",
      align: "center",
      render: (isAdmin, record) => {
        if (!record._id) return null; // Hàng trống, trả về null
        return isAdmin ? "Yes" : "No";
      },
    },
    {
      title: "Action",
      dataIndex: "_id",
      align: "center",
      render: (id, record) => {
        if (!record._id) return null; // Hàng trống, trả về null
        return (
          <div>
            <EditOutlined
              style={{
                color: "rgb(47, 85, 155)",
                fontSize: "20px",
                cursor: "pointer",
              }}
              onClick={() => handleDetailsUser(id)}
            />{" "}
            <DeleteOutlined
              style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
              onClick={() => handleDeleteUser(id)}
            />
            {!record.isAdmin && (
              <LockOutlined
                style={{
                  color: record.isBlocked ? "red" : "green",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() => handleBlockUser(id, record.isBlocked)}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isBlocked",
      align: "center",
      render: (isBlocked, record) => {
        if (!record._id) return null; // Hàng trống, trả về null
        return (
          <Tooltip
            title={isBlocked ? "Tài khoản bị khóa" : "Tài khoản hoạt động"}
          >
            {isBlocked ? "🔒" : "✅"}
          </Tooltip>
        );
      },
    },
  ];

  //____________________________________________Dữ liệu bảng
  const dataTable = [
    // Sắp xếp currentUsers để admin lên đầu
    ...currentUsers
      .map((user) => ({
        ...user,
        key: user._id,
        isBlocked: user.isBlocked || false,
      }))
      .sort((a, b) => (b.isAdmin ? 1 : -1)), // Admin lên đầu
    ...emptyRows, // Thêm hàng trống vào cuối
  ];
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
    console.log("Xóa user với ID:", id);
  };

  //__________________________________KHÓA NGƯỜI DÙNG
  const handleBlockUser = async (id) => {
    setRowSelected(id);
    setIsModalOpenBlockUser(true);
    console.log("Khóa user với ID:", id);
  };

  //________________________________________________________________________Update sản phẩm
  const onApply = async (updatedUser, userId) => {
    try {
      dispatch(setLoading(true));

      // Kiểm tra và định dạng lại `dob` nếu cần
      const formattedDob = updatedUser.dob
        ? dayjs(updatedUser.dob, "DD-MM-YYYY").format("DD-MM-YYYY")
        : null;

      const updatedData = {
        ...updatedUser,
        dob: formattedDob,
      };

      const resultAction = await dispatch(updateUser({ userId, updatedData }));

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

  const handleCancelDeleteUser = () => {
    setIsModalOpenDeleteUser(false);
  };

  const handleCancelBlockUser = () => {
    setIsModalOpenBlockUser(false);
  };

  const onConfirmDelete = async (userId) => {
    setIsModalOpenDeleteUser(false);
    try {
      const response = await dispatch(deleteUser(userId)).unwrap();

      console.log("Response từ API:", response); // Debug để kiểm tra

      message.success("Xóa người dùng thành công!");
      dispatch(getAllUsers());
    } catch (error) {
      console.error("Lỗi từ Redux:", error);
      message.error(error || "Xóa người dùng thất bại!");
    }
  };

  const onConfirmBlock = async (userId, isBlocked) => {
    setIsModalOpenBlockUser(false);
    try {
      await axios.put(`http://localhost:3002/api/user/block/${userId}`, {
        isBlocked: !isBlocked,
      });

      message.success(
        !isBlocked ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!"
      );

      // Gọi lại danh sách người dùng sau khi cập nhật
      dispatch(getAllUsers());
    } catch (error) {
      message.error("error");
      console.log("Lỗi?", error);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <WrapperHeader>Quản lý người dùng</WrapperHeader>
      <div style={{ marginTop: "10px" }}></div>
      <div style={{ marginTop: "20px" }}>
        <TableProduct
          columns={columns}
          data={dataTable}
          pagination={{
            current: currentPage, // Trang hiện tại
            pageSize: 10, // Số lượng hàng mỗi trang
            total: sortedUsers.length, // Tổng số lượng người dùng
            showSizeChanger: false, // Ẩn tùy chọn thay đổi số lượng hàng mỗi trang
            position: ["bottomRight"], // Đặt phân trang ở góc dưới bên phải
            onChange: (page) => setCurrentPage(page), // Xử lý khi chuyển trang
          }}
          onChange={handleTableChange}
          rowClassName={(record) => (record.isBlocked ? "row-blocked" : "")}
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
      {/* ________________MODAL CHỌN XÓA NGƯỜI DÙNG _________________ */}
      <Modal
        title="Xác nhận xóa sản phẩm"
        open={isModalOpenDeleteUser}
        closable={false}
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
          Bạn có chắc chắn muốn xóa người dùng này không?
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
              onClick={handleCancelDeleteUser}
            >
              Hủy
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận khóa người dùng"
        open={isModalOpenBlockUser}
        footer={null}
        closable={false}
        centered
      >
        <p
          style={{
            textAlign: "center",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          Bạn có chắc chắn muốn xóa người dùng này không?
        </p>

        <Form
          onFinish={() => {
            const user = users.find((u) => u._id === rowSelected);
            if (user) {
              onConfirmBlock(rowSelected, user.isBlocked);
            }
          }}
          autoComplete="off"
        >
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
              onClick={handleCancelBlockUser}
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
          <Form.Item label="Default Address" name="defaultAddress">
            {stateDetailsUser.address.length > 0 ? (
              <Select
                value={stateDetailsUser.defaultAddress?._id || ""}
                disabled // Chỉ đọc, không cho thay đổi
              >
                {stateDetailsUser.address.map((addr) => (
                  <Select.Option key={addr._id} value={addr._id}>
                    {addr.address}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Input
                placeholder="Người dùng chưa nhập địa chỉ"
                value={stateDetailsUser.defaultAddress?.address || ""}
                disabled // Chỉ đọc, không cho thay đổi
              />
            )}
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
            <DatePicker
              format="DD/MM/YYYY" // Hiển thị ngày theo định dạng DD/MM/YYYY
              value={
                stateDetailsUser.dob
                  ? dayjs(stateDetailsUser.dob, "MM-DD-YYYY")
                  : null
              }
              onChange={handleDateChange}
            />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Select
              value={stateDetailsUser.gender}
              onChange={(value) =>
                setStateDetailsUser((prev) => ({
                  ...prev,
                  gender: value,
                }))
              }
            >
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
            </Select>
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
