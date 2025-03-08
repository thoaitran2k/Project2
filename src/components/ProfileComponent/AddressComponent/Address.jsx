import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAddresses, addAddress } from "../../../Services/UserService";
import { setUser, updateAddressList } from "../../../redux/slices/userSlice";
import { setLoading } from "../../../redux/slices/loadingSlice";
import { message, Button, Modal, Input, Radio, Form } from "antd";
import { EditOutlined } from "@ant-design/icons";
import EditAddressForm from "./EditAddressForm ";

const EditAddress = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState("");
  const [checked, setChecked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
    setIsUserLoaded(true);
  }, [dispatch]);

  // Lấy danh sách địa chỉ từ API khi component load
  useEffect(() => {
    if (isUserLoaded && user?._id) {
      console.log("Fetching addresses for user:", user._id);

      fetchAddresses();
    }
  }, [user, isUserLoaded]);

  // Điều chỉnh overflow khi modal hiển thị
  useEffect(() => {
    if (isModalVisible) {
      document.body.classList.add("modal-open"); // Khóa cuộn trang
    } else {
      document.body.classList.remove("modal-open"); // Khôi phục lại cuộn trang
    }
  }, [isModalVisible]);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses(user._id, user.accessToken);
      console.log("Dữ liệu API trả về:", response);
      setAddresses(response.data || []); // ✅ Đảm bảo không bị `undefined`
      //dispatch(updateAddressList());
    } catch (error) {
      message.error("Lỗi khi tải danh sách địa chỉ!");
    }
  };

  const handleUpdateAddress = async () => {
    if (!user?._id) {
      message.error("Lỗi: Không tìm thấy ID người dùng!");
      return;
    }

    if (!address) {
      message.warning("Vui lòng nhập địa chỉ trước khi cập nhật!");
      return;
    }

    try {
      dispatch(setLoading(true));

      // Nếu địa chỉ mới được chọn làm mặc định, loại bỏ mặc định của các địa chỉ cũ
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: checked ? false : addr.isDefault, // Nếu có địa chỉ mới làm mặc định, đặt tất cả còn lại thành false
      }));

      // Thêm địa chỉ mới vào danh sách
      const newAddress = {
        address,
        isDefault: checked, // Nếu người dùng chọn, đây sẽ là mặc định mới
      };

      // Gọi API để thêm địa chỉ mới
      const response = await addAddress(user._id, newAddress, user.accessToken);

      if (response.status === "OK") {
        message.success("Thêm địa chỉ thành công!");

        // Cập nhật danh sách với địa chỉ mới
        setAddresses([...updatedAddresses, response.data]); // Thêm địa chỉ mới vào danh sách
        setAddress("");
        setChecked(false);

        // Cập nhật Redux Store
        dispatch(updateAddressList());
        fetchAddresses();
      } else {
        message.error(response.message || "Thêm địa chỉ thất bại!");
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null); // Xóa dữ liệu cũ để nhập mới
    setIsEditing(true); // Đánh dấu đang thêm mới
    setIsModalVisible(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address); // Gán địa chỉ cần chỉnh sửa
    setIsEditing(false); // Đánh dấu đang sửa
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    setIsModalVisible(false); // Đóng modal khi người dùng nhấn OK
    if (editingAddress) {
      // Cập nhật địa chỉ nếu có thay đổi
      handleUpdateAddress();
    }
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingAddress(null); // Reset dữ liệu khi đóng
  };

  const handleSuccess = () => {
    // Thực hiện các hành động sau khi cập nhật thành công (ví dụ: đóng modal, thông báo...)
    console.log("Đã cập nhật địa chỉ thành công!");

    setIsModalVisible(false);
    fetchAddresses();
    dispatch(updateAddressList());
  };

  return (
    <Container
      style={{ display: "flex", alignItems: "flex-start", margin: "0" }}
    >
      <FormWrapper
        style={{
          alignItems: "flex-start",
          textAlign: "left",
          margin: "0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <FormControl>
          <div style={{ display: "flex", fontWeight: "500", fontSize: "20px" }}>
            Danh sách địa chỉ:
          </div>
          <AddressList>
            {addresses
              .slice() // Tạo bản sao mảng để tránh thay đổi mảng gốc
              .sort((a, b) => (b.isDefault ? 1 : -1)) // Sắp xếp: Địa chỉ mặc định lên đầu
              .map((item, index) => (
                <AddressItem key={index} isDefault={item.isDefault}>
                  <div className="address-info">
                    <div className="address-text">{item.address}</div>
                  </div>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditAddress(item)}
                  />
                </AddressItem>
              ))}
          </AddressList>
        </FormControl>
        <div>
          <FormControl>
            <div style={{ fontWeight: "500", fontSize: "20px" }}>
              Nhập địa chỉ mới:
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
              <textarea
                rows="3"
                value={address}
                style={{ width: "500px", height: "100px" }}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Button
                style={{
                  width: "120px",
                  height: "50px",
                  fontSize: "18px",
                }}
                //size="large"
                type="primary"
                onClick={handleAddAddress}
              >
                Thêm địa chỉ
              </Button>
            </div>
          </FormControl>

          <FormControl style={{ display: "flex", flexDirection: "row" }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <div style={{ color: "blue" }}>Đặt làm địa chỉ mặc định</div>
          </FormControl>

          <FormControl
            style={{
              display: "flex",
            }}
          >
            <Button
              style={{
                width: "120px",
                height: "50px",
                fontSize: "18px",
              }}
              //size="large"
              type="primary"
              onClick={handleUpdateAddress}
            >
              Xác nhận
            </Button>
          </FormControl>
        </div>
      </FormWrapper>

      <StyledModal
        title={isEditing ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"} // 🛠 Đổi tiêu đề động
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        centered={true}
      >
        <EditAddressForm
          editingAddress={editingAddress}
          isEditing={isEditing}
          userId={user._id} // Sử dụng user._id thay vì userId
          addressId={editingAddress?._id} // Sử dụng _id của địa chỉ đang chỉnh sửa
          onUpdateSuccess={handleSuccess}
        />
      </StyledModal>
    </Container>
  );
};

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
`;
const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 600px; /* ✅ Đảm bảo kích thước cố định */
`;
const FormControl = styled.div`
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%; /* Chiếm toàn bộ chiều ngang */
  box-sizing: border-box; /* Đảm bảo padding không làm thay đổi kích thước */
`;
const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%; /* Chiếm toàn bộ chiều ngang */
  box-sizing: border-box; /* Đảm bảo padding không làm thay đổi kích thước */
`;
const AddressItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 2px solid ${({ isDefault }) => (isDefault ? "gold" : "#ddd")}; /* Mặc định màu xám, nếu là mặc định thì vàng */
  width: 100%;
  max-width: 900px;
  box-sizing: border-box;
  border-radius: 10px;
  background: ${({ isDefault }) =>
    isDefault ? "#fff9db" : "white"}; /* Tô nhẹ nền màu vàng nhạt */
  transition: all 0.3s ease; /* Hiệu ứng mượt */

  .address-info {
    flex-grow: 1;
    margin-right: 10px;
  }

  .address-text {
    font-size: 16px;
    color: #333;
    word-wrap: break-word;
  }

  .ant-btn-link {
    padding: 0;
    color: #1890ff;
    white-space: nowrap;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal {
    overflow: hidden;
  }
`;

export default EditAddress;
