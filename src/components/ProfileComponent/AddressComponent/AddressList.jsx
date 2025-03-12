import { useMemo, React, useState, useEffect } from "react";
import styled from "styled-components";
import {
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Button, Modal, Form, Input, Select, message } from "antd";
import { getAddresses } from "../../../Services/UserService";
import { addNewAddress } from "../../../Services/UserService";
import { deleteUserAddress } from "../../../Services/UserService";
import { useSelector, useDispatch } from "react-redux";
import { removeUserAddress } from "../../../redux/actions/userActions";
import {
  updateUserAddress,
  setUserAddresses,
  addUserAddress,
  deleteAddress,
} from "../../../redux/slices/userSlice";
import Loading from "../../LoadingComponent/Loading";

import ErrorBoundary from "../../ErrorBoundary/ErrorBoundary";
import { setLoading } from "../../../redux/slices/loadingSlice";

const AddressList = ({ userId, accessToken, addressId }) => {
  //console.log("Danh sách địa chỉ:", address);
  //const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [selectedDefault, setSelectedDefault] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [ButtonUpdate, setButtonUpdate] = useState(null);

  const addresses = useSelector((state) => state.user.address);
  //const userId = useSelector((state) => state.user._id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();
  const address = useSelector((state) => state.user.address);
  const addressesInStore = useSelector((state) => state.user.address);
  //const userAddresses = useSelector((state) => state.user.address);

  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);
  //Xử lý chọn vị trí địa lý
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) => {
      if (a.isDefault && !b.isDefault) {
        return -1; // Địa chỉ có isDefault = true sẽ xuất hiện trước
      }
      if (!a.isDefault && b.isDefault) {
        return 1; // Địa chỉ có isDefault = false sẽ xuất hiện sau
      }
      return 0; // Nếu cả hai địa chỉ có isDefault giống nhau, không thay đổi thứ tự
    });
  }, [addresses]);

  useEffect(() => {
    fetch("/provinces.json")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(Object.values(data)); // Chuyển object thành array
      })
      .catch((err) => console.error("Lỗi khi lấy dữ liệu tỉnh thành:", err));
  }, []);

  // Xử lý khi chọn tỉnh/thành phố
  const handleProvinceChange = (provinceCode) => {
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    if (selectedProvince) {
      setDistricts(selectedProvince.districts || []);
      setWards([]); // Reset danh sách phường/xã
      form.setFieldsValue({ district: undefined, ward: undefined }); // Reset các giá trị đã chọn
    }
  };

  // Xử lý khi chọn quận/huyện
  const handleDistrictChange = (districtCode) => {
    const selectedDistrict = districts.find((d) => d.code === districtCode);
    if (selectedDistrict) {
      setWards(selectedDistrict.wards || []);
      form.setFieldsValue({ ward: undefined }); // Reset phường/xã
    }
  };

  //Sau khi thêm mới địa chỉ thành công thành công

  // useEffect(() => {
  //   // Đây sẽ là cách để theo dõi sự thay đổi của Redux state
  //   console.log("Đã cập nhật địa chỉ mới trong Redux:", addresses);
  // }, [addresses]);

  // Xử lý chọn vị trí địa lý
  useEffect(() => {
    if (!userId || !accessToken) return;

    const fetchAddresses = async () => {
      try {
        const data = await getAddresses(userId, accessToken);
        //console.log("Dữ liệu nhận được từ API:", data);

        if (data.data && Array.isArray(data.data)) {
          dispatch(setUserAddresses(data.data));
          // console.log("data", data.data);
          // console.log("✅ Đã cập nhật vào Redux:", data.data);
        } else {
          console.error("❌ API trả về dữ liệu không hợp lệ:", data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ", error.message);
      }
    };

    fetchAddresses();
  }, [userId, accessToken, dispatch]);

  const handleAddAddress = async () => {
    //console.log("Thêm địa chỉ");
    if (addressesInStore.length >= 6) {
      message.warning("Bạn chỉ có thể lưu tối đa 6 địa chỉ!");
      setIsModalOpen(false); // Đóng modal nếu vượt quá giới hạn
      return;
    }
    setSelectedAddress(null); //Không chọn địa chỉ nào vì là thêm mới
    setIsEditing(false); // Không phải là chỉnh sửa mà là thêm mới
    setIsModalOpen(true); // Mở Modal
    form.resetFields(); // Làm trống các Fields
    //e.preventDefault();
  };

  //Xóa
  const handleDeleteAddress = async (userId, addressId) => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Xóa địa chỉ:", accessToken);
    console.log("Xóa địa chỉ với ID:", address);

    if (!accessToken) {
      console.error("Không có access token!");
      return;
    }

    try {
      const response = await deleteUserAddress(userId, addressId, accessToken);
      console.log("Địa chỉ đã được xóa:", response);
      dispatch(setLoading(true));

      // Dispatch action để cập nhật lại danh sách địa chỉ trong Redux
      console.log("Chạy dispatch......", addressId);
      dispatch(removeUserAddress(addressId));

      setTimeout(async () => {
        const updatedAddresses = await getAddresses(userId, accessToken);
        if (updatedAddresses && updatedAddresses.data) {
          dispatch(setUserAddresses(updatedAddresses.data)); // Cập nhật lại địa chỉ trong Redux
        }
        dispatch(setLoading(false));
      }, 1500);

      // Thông báo xóa thành công cho người dùng
      message.success("Đã xóa địa chỉ thành công!");
    } catch {
      console.error("Xóa địa chỉ thất bại:", error);
      alert("Đã có lỗi xảy ra khi xóa địa chỉ.");
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 1500);
    }
  };

  //Chọn làm mặc định
  const handleCheckboxChange = async (checked, addr, addressId) => {
    if (addr.isDefault) return;

    setSelectedAddress(addr);
    setSelectedDefault(checked ? addressId : null); // Cập nhật state

    setButtonUpdate(checked ? addr._id : null);
    //console.log("📌BUTTON Ở ĐÂY SẼ ĐỔI THÀNH CẬP NHẬT :", ButtonUpdate);

    //console.log("📌SelectedDefault :", selectedDefault);
    //console.log("Địa chỉ đang chọn có ID:", addressId); // Kiểm tra giá trị checked}
  };

  //Sửa
  const handleEdit = async (addr, userId, addressId) => {
    if (selectedDefault === addr._id && !addr.isDefault) {
      // Nếu checkbox được tick và địa chỉ không phải mặc định
      console.log(
        "Cập nhật địa chỉ",
        addressId,
        "làm mặc định cho user:",
        userId
      );

      dispatch(setLoading(true));
      try {
        // Cập nhật địa chỉ này thành mặc định
        await dispatch(
          updateUserAddress({
            userId,
            addressId,
            newAddress: { isDefault: true },
          })
        ).unwrap();
        message.success("Đã chọn địa chi mặc định mới!");
        // Cập nhật tất cả các địa chỉ khác thành `isDefault = false`
        const updatePromises = address
          .filter((item) => item._id !== addressId)
          .map((item) =>
            dispatch(
              updateUserAddress({
                userId,
                addressId: item._id,
                newAddress: { isDefault: false },
              })
            ).unwrap()
          );

        await Promise.all(updatePromises);
      } catch (error) {
        console.error("❌ Lỗi khi cập nhật địa chỉ mặc định:", error);
      } finally {
        setTimeout(() => {
          dispatch(setLoading(false));
        }, 1500);
      }
    } else {
      // Nếu không tick checkbox, chỉ mở form chỉnh sửa
      console.log("🔍 Mở form chỉnh sửa cho địa chỉ:", addr);
      setSelectedAddress(addr);
      setIsEditing(true);
      setIsModalOpen(true);

      const addressParts = addr.address.split(",").map((part) => part.trim());
      let street, ward, district, city;

      if (addressParts.length > 3) {
        street = addressParts[0] || "";
        ward = addressParts[1] || "";
        district = addressParts[2] || "";
        city = addressParts[3] || "";
      } else {
        ward = addressParts[0] || "";
        district = addressParts[1] || "";
        city = addressParts[2] || "";
        street = "";
      }

      const selectedProvince = provinces.find((p) => p.name === city);
      const provinceCode = selectedProvince?.code || undefined;

      if (selectedProvince) {
        setDistricts(selectedProvince.districts || []);
      }

      const selectedDistrict = selectedProvince?.districts.find(
        (d) => d.name === district
      );
      const districtCode = selectedDistrict?.code || undefined;

      if (selectedDistrict) {
        setWards(selectedDistrict.wards || []);
      }

      const selectedWard = selectedDistrict?.wards.find((w) => w.name === ward);
      const wardCode = selectedWard?.code || undefined;

      setTimeout(() => {
        form.setFieldsValue({
          name: addr.name || "",
          phoneDelivery: addr.phoneDelivery || "",
          street,
          ward: wardCode || undefined,
          district: districtCode || undefined,
          city: provinceCode || undefined,
          address: addr.address || "",
        });
      }, 300);
    }
  };

  //Update địa chỉ
  const handleUpdateAddress = async (values) => {
    console.log("📤 Gửi request cập nhật/thêm địa chỉ...", values);

    // Kiểm tra thông tin địa chỉ
    if (!values.city || !values.district || !values.ward) {
      message.warning("Bạn phải chọn đầy đủ tỉnh, quận/huyện và phường/xã!");
      return;
    }

    if (isEditing && !selectedAddress) {
      console.error("❌ Không tìm thấy địa chỉ để cập nhật!");
      return;
    }

    // Xử lý địa chỉ đầy đủ
    const street = values.street || "";
    const selectedProvince = provinces.find((p) => p.code === values.city);
    const selectedDistrict = districts.find((d) => d.code === values.district);
    const selectedWard = wards.find((w) => w.code === values.ward);

    const fullAddress = [
      street,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ]
      .filter(Boolean)
      .join(", ");

    console.log("📌 Địa chỉ đầy đủ:", fullAddress);

    try {
      let result;
      const isAlreadyDefault = isEditing && selectedAddress?.isDefault;

      let newAddressData = {
        name: values.name || "",
        phoneDelivery: values.phoneDelivery || "",
        address: fullAddress,
        isDefault: isAlreadyDefault ? true : values.isDefault || false, // Giữ nguyên nếu đang là mặc định
      };

      if (isEditing) {
        // 📝 CẬP NHẬT ĐỊA CHỈ
        result = await dispatch(
          updateUserAddress({
            userId,
            addressId: selectedAddress._id,
            newAddress: newAddressData,
          })
        ).unwrap();

        console.log("✅ Cập nhật thành công:", result);
      } else {
        // ➕ THÊM ĐỊA CHỈ MỚI
        const response = await addNewAddress(
          userId,
          newAddressData.address,
          newAddressData.isDefault,
          accessToken,
          newAddressData.name,
          newAddressData.phoneDelivery
        );

        console.log("📤 Phản hồi từ API khi thêm địa chỉ:", response);

        if (response.status === "OK" && response.data?.address) {
          dispatch(setLoading(true));
          const newAddresses = response.data.address; // Danh sách địa chỉ sau khi thêm
          console.log("✅ Đã thêm địa chỉ mới:", newAddresses);
          message.success("Đã thêm địa chỉ mới thành công!");

          setTimeout(() => {
            dispatch(setLoading(false));
          }, 1500);

          // Cập nhật Redux với danh sách mới
          dispatch(addUserAddress(newAddresses));
        } else {
          // 🛑 XỬ LÝ TRƯỜNG HỢP API TRẢ VỀ CẢNH BÁO
          const errorMessage = response.message || "Không thể thêm địa chỉ!";
          message.warning(errorMessage);
          console.warn("⚠️ Cảnh báo từ API:", errorMessage);
          return;
        }
      }

      // Nếu địa chỉ mới là mặc định, cập nhật các địa chỉ khác về `isDefault: false`
      if (values.isDefault) {
        const updatePromises = addressesInStore
          .filter(
            (addr) =>
              addr._id !== (isEditing ? selectedAddress._id : result?._id)
          )
          .map((addr) =>
            dispatch(
              updateUserAddress({
                userId,
                addressId: addr._id,
                newAddress: { isDefault: false },
              })
            ).unwrap()
          );

        await Promise.all(updatePromises);
      }

      // Đóng modal sau khi hoàn thành
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Lỗi khi xử lý địa chỉ:", error);
      message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  return (
    <ErrorBoundary>
      <Container>
        <Title>Số địa chỉ ({address.length})</Title>
        <AddNewAddress onClick={() => handleAddAddress()}>
          <PlusOutlined /> <span>Thêm địa chỉ mới</span>
        </AddNewAddress>
        {Array.isArray(sortedAddresses) &&
          sortedAddresses
            .filter(
              (addr) => addr && typeof addr === "object" && !Array.isArray(addr)
            ) // Chỉ giữ lại object
            .map((addr) => (
              <AddressCard
                style={
                  addr.isDefault ? { background: "rgb(204, 228, 230)" } : {}
                }
                key={addr._id}
              >
                <div style={{ position: "relative" }}>
                  {/* Checkbox và text "Đặt làm mặc định" */}
                  {addr.isDefault ? (
                    <span style={{ fontStyle: "italic", color: "gray" }}></span>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "5px",
                        float: "right",
                      }}
                    >
                      <h4 style={{ margin: 0 }}>Đặt làm mặc định</h4>
                      <input
                        type="checkbox"
                        checked={selectedDefault === addr._id} // Tick nếu địa chỉ được chọn
                        style={{ position: "relative", zIndex: 10 }}
                        onChange={(e) =>
                          handleCheckboxChange(e.target.checked, addr, addr._id)
                        }
                      />
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Name>{addr.name || "Không có tên"}</Name>
                    <div>
                      {addr.isDefault && (
                        <CheckCircleOutlined
                          className="default-icon"
                          style={{ color: "green" }}
                        />
                      )}
                      {addr.isDefault && <Tag>Địa chỉ mặc định</Tag>}
                    </div>
                  </div>
                  <Address>
                    <strong>Địa chỉ:</strong>{" "}
                    {addr.address || "Không có địa chỉ"}
                  </Address>
                  <Phone>
                    <strong>Điện thoại:</strong>{" "}
                    <span>
                      {addr.phoneDelivery || "Không có số điện thoại"}
                    </span>
                  </Phone>
                  {/* Giữ nút chỉnh sửa ở chỗ cũ */}
                  {/* Icon thùng rác ở bên phải checkbox */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <TrashIcon
                      style={{
                        cursor: "pointer",
                        fontSize: "25px",
                      }}
                      onClick={() => handleDeleteAddress(userId, addr._id)}
                    />
                    <EditButton
                      style={
                        ButtonUpdate === addr._id && !addr.isDefault
                          ? { background: "rgb(168, 179, 16)", color: "white" } // Nếu điều kiện đúng, có background màu xanh
                          : {} // Nếu điều kiện sai, không có style (trả về object rỗng)
                      }
                      onClick={() => handleEdit(addr, userId, addr._id)}
                      className={
                        ButtonUpdate === addr._id
                          ? "update-button"
                          : "edit-button"
                      }
                    >
                      {ButtonUpdate === addr._id && !addr.isDefault ? (
                        <>Cập nhật</>
                      ) : (
                        <>
                          <EditOutlined /> Chỉnh sửa
                        </>
                      )}
                    </EditButton>
                  </div>
                </div>
              </AddressCard>
            ))}

        {/* Modal chỉnh sửa địa chỉ */}
        <Modal
          title="Chỉnh sửa địa chỉ"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={700}
          centered={true}
          style={{
            maxWidth: 1200,
            width: "1200px",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateAddress}
            style={{
              maxWidth: 700,
              margin: "auto",
              padding: 20,
              background: "#fff",
            }}
          >
            <Form.Item label="Họ & Tên" name="name">
              <Input />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phoneDelivery">
              <Input />
            </Form.Item>

            {/* Xử lý chọn vị trí địa lý */}

            {/* Chọn tỉnh/thành phố */}
            <Form.Item label="Tỉnh/Thành phố" name="city">
              <Select onChange={handleProvinceChange}>
                {provinces.map((province) => (
                  <Option key={province.code} value={province.code}>
                    {province.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Chọn quận/huyện */}
            <Form.Item label="Quận/Huyện" name="district">
              <Select onChange={handleDistrictChange}>
                {districts.map((district) => (
                  <Option key={district.code} value={district.code}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Chọn phường/xã */}
            <Form.Item label="Phường/Xã" name="ward">
              <Select>
                {wards.map((ward) => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Xử lý chọn vị trí địa lý */}

            <Form.Item label="Địa chỉ chi tiết" name="street">
              <Input />
            </Form.Item>

            <Form.Item
              label={isEditing ? "Địa chỉ hiện tại" : null}
              name="address"
            >
              {isEditing ? <Input.TextArea rows={3} readOnly /> : null}
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ height: 50 }}
              >
                {isEditing ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Container>
    </ErrorBoundary>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(300px, 1fr)
  ); /* Tự động điều chỉnh số cột dựa trên kích thước màn hình */
  gap: 40px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
`;

const Title = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
`;

const AddNewAddress = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 5px;
  color: #1890ff;
  cursor: pointer;
  font-size: 16px;
  gap: 5px;
  &:hover {
    background: #eef5ff;
  }
`;

const AddressCard = styled.div`
  background: white;
  padding: 15px;
  margin-top: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  width: 100%; /* Đảm bảo chiều rộng linh hoạt */
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const DefaultInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Name = styled.div`
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;

  .default-icon {
    color: green;
  }
`;

const TrashIcon = styled(DeleteOutlined)`
  font-size: 20px;
  color: red; // Thùng rác màu đỏ
  &:hover {
    color: darkred; // Đổi màu khi hover
  }
`;

const Tag = styled.span`
  color: green;
  font-size: 14px;
`;

const Address = styled.div`
  font-size: 14px;
  color: #333;
`;

const Phone = styled.div`
  font-size: 14px;
  color: #333;
  span {
    font-weight: bold;
  }
`;

const EditButton = styled(Button)`
  align-self: flex-end;
  color: #1890ff;
  font-size: 14px;
  min-width: 120px;
  .edit-button {
    background-color: #f0f0f0;
    color: #333;
  }

  .edit-button:hover {
    background-color: #ddd;
  }

  .update-button {
    background-color: #007bff;
    color: white;
  }

  .update-button:hover {
    background-color: #0056b3;
  }
`;

export default AddressList;
