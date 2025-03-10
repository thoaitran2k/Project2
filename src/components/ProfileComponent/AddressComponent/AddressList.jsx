import { React, useState, useEffect } from "react";
import styled from "styled-components";
import {
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Button, Modal, Form, Input, Select } from "antd";
import { getAddresses } from "../../../Services/UserService";
import { updateAddress } from "../../../Services/UserService";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserAddress,
  setUserAddresses,
  addUserAddress,
} from "../../../redux/slices/userSlice";

import ErrorBoundary from "../../ErrorBoundary/ErrorBoundary";

const AddressList = ({ userId, accessToken }) => {
  //console.log("Danh sách địa chỉ:", address);
  //const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const addresses = useSelector((state) => state.user.address);
  //const userId = useSelector((state) => state.user._id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [form] = Form.useForm();
  const address = useSelector((state) => state.user.address);
  //const userAddresses = useSelector((state) => state.user.address);

  const dispatch = useDispatch();

  //Xử lý chọn vị trí địa lý
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

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

  // Xử lý chọn vị trí địa lý
  useEffect(() => {
    if (!userId || !accessToken) return;

    const fetchAddresses = async () => {
      try {
        const data = await getAddresses(userId, accessToken);
        //console.log("Dữ liệu nhận được từ API:", data);

        if (data.data && Array.isArray(data.data)) {
          dispatch(setUserAddresses(data.data));
          console.log("data", data.data);
          console.log("✅ Đã cập nhật vào Redux:", data.data);
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
    console.log("Thêm địa chỉ");
    setSelectedAddress(null); //Không chọn địa chỉ nào vì là thêm mới
    setIsEditing(false); // Không phải là chỉnh sửa mà là thêm mới
    setIsModalOpen(true); // Mở Modal
    form.resetFields(); // Làm trống các Fields
    //e.preventDefault();
  };

  const handleEdit = (addr) => {
    console.log("🔍 Kiểm tra dữ liệu của addr:", addr);
    setSelectedAddress(addr);
    setIsEditing(true);
    setIsModalOpen(true);

    const addressParts = addr.address.split(",").map((part) => part.trim());
    console.log("📌 Tách địa chỉ:", addressParts);

    const street = addressParts[0] || "";
    const ward = addressParts[1] || "";
    const district = addressParts[2] || "";
    const city = addressParts[3] || "";

    // Tìm mã tỉnh/thành phố
    const selectedProvince = provinces.find((p) => p.name === city);
    const provinceCode = selectedProvince?.code || undefined;

    // Nếu tìm thấy tỉnh, cập nhật danh sách quận/huyện
    if (selectedProvince) {
      setDistricts(selectedProvince.districts || []);
    }

    // Tìm mã quận/huyện
    const selectedDistrict = selectedProvince?.districts.find(
      (d) => d.name === district
    );
    const districtCode = selectedDistrict?.code || undefined;

    // Nếu tìm thấy quận, cập nhật danh sách phường/xã
    if (selectedDistrict) {
      setWards(selectedDistrict.wards || []);
    }

    // Tìm mã phường/xã
    const selectedWard = selectedDistrict?.wards.find((w) => w.name === ward);
    const wardCode = selectedWard?.code || undefined;

    // Đợi cập nhật danh sách quận/huyện và phường/xã trước khi đặt giá trị form
    setTimeout(() => {
      form.setFieldsValue({
        name: addr.name || "",
        phoneDelivery: addr.phoneDelivery || "",
        street,
        ward: wardCode,
        district: districtCode,
        city: provinceCode,
        address: addr.address || "",
      });
    }, 300);
  };

  const handleUpdateAddress = async (values) => {
    console.log("Gửi request cập nhật địa chỉ...", values);
    if (!selectedAddress && isEditing) {
      console.error("❌ Không tìm thấy địa chỉ để cập nhật!");
      return;
    }

    // Xử lý địa chỉ đầy đủ
    const street = values.street || "";
    const selectedProvince = provinces.find((p) => p.code === values.city);
    const selectedDistrict = districts.find((d) => d.code === values.district);
    const selectedWard = wards.find((w) => w.code === values.ward);

    // Đảm bảo không có `undefined` trong `fullAddress`
    const fullAddress = [
      street,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const validatedValues = values; // Kiểm tra form hợp lệ

      if (isEditing) {
        // Cập nhật địa chỉ
        const result = await dispatch(
          updateUserAddress({
            userId,
            addressId: selectedAddress._id,
            newAddress: { ...values, address: fullAddress },
          })
        ).unwrap();

        console.log("✅ Cập nhật thành công:", result);
      } else {
      }

      // Cập nhật `localStorage`

      //localStorage.setItem("userAddress", JSON.stringify(updatedAddresses));

      // Đóng modal sau khi cập nhật thành công
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật địa chỉ:", error);
    }
  };

  return (
    <ErrorBoundary>
      <Container>
        <Title>Số địa chỉ ({address.length})</Title>
        <AddNewAddress onClick={() => handleAddAddress()}>
          <PlusOutlined /> <span>Thêm địa chỉ mới</span>
        </AddNewAddress>
        {Array.isArray(address) &&
          address
            .filter(
              (addr) => addr && typeof addr === "object" && !Array.isArray(addr)
            ) // Chỉ giữ lại object
            .map((addr) => (
              <AddressCard key={addr._id}>
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
                  <strong>Địa chỉ:</strong> {addr.address || "Không có địa chỉ"}
                </Address>
                <Phone>
                  <strong>Điện thoại:</strong>{" "}
                  <span>{addr.phoneDelivery || "Không có số điện thoại"}</span>
                </Phone>
                <EditButton onClick={() => handleEdit(addr)}>
                  <EditOutlined /> Chỉnh sửa
                </EditButton>
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
  max-width: 100%;
  background: #f9f9f9;
  padding: 20px;
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
  gap: 5px;
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
`;

export default AddressList;
