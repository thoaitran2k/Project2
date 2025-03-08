import React, { useState, useEffect } from "react";
import { Input, Select, Button, Form, Radio } from "antd";
import axios from "axios";

const { Option } = Select;

const EditAddressForm = ({
  editingAddress,
  isEditing,
  userId,
  addressId,
  onUpdateSuccess,
}) => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [checked, setChecked] = useState(false);
  const [allAddresses, setAllAddresses] = useState([]);

  // Lấy danh sách tỉnh/thành phố khi component mount
  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/?depth=1")
      .then((response) => setProvinces(response.data))
      .catch((error) => console.error("Lỗi khi lấy tỉnh/thành:", error));
  }, []);

  // Lấy danh sách quận/huyện khi tỉnh/thành phố thay đổi
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((response) => {
          setDistricts(response.data.districts);
          setSelectedDistrict(""); // Reset quận/huyện
          setWards([]); // Reset phường/xã
        })
        .catch((error) => console.error("Lỗi khi lấy quận/huyện:", error));
    }
  }, [selectedProvince]);

  // Lấy danh sách phường/xã khi quận/huyện thay đổi
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((response) => setWards(response.data.wards))
        .catch((error) => console.error("Lỗi khi lấy phường/xã:", error));
    }
  }, [selectedDistrict]);

  // Cập nhật giá trị form khi `editingAddress` thay đổi
  useEffect(() => {
    if (editingAddress) {
      const { city, district, ward, address, isDefault, street } =
        editingAddress;
      setSelectedProvince(city);
      setSelectedDistrict(district);
      setSelectedWard(ward);
      setChecked(isDefault); // Đặt checked từ isDefault của editingAddress

      // Cập nhật giá trị form
      form.setFieldsValue({
        city,
        district,
        ward,
        address,
        street,
      });
    }
  }, [editingAddress, form]);

  //Lấy tất cả địa chỉ
  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:3002/api/user/${userId}/addresses`)
        .then((response) => {
          // Kiểm tra xem dữ liệu trả về có hợp lệ không
          if (response.data && Array.isArray(response.data.data)) {
            setAllAddresses(response.data.data); // Lấy mảng địa chỉ từ data
          } else {
            console.log("Dữ liệu không hợp lệ:", response.data);
          }
        })
        .catch((error) => console.error("Lỗi khi lấy địa chỉ:", error));
    }
  }, [userId]);

  const handleSubmit = async (values) => {
    // Lấy thông tin đầy đủ của địa chỉ
    const fullAddress = [
      values.street,
      wards.find((ward) => ward.name === values.ward)?.name,
      districts.find((district) => district.code === values.district)?.name,
      provinces.find((province) => province.code === values.city)?.name,
    ]
      .filter(Boolean) // Lọc bỏ các giá trị falsy (undefined, null, "")
      .join(", "); // Nối các phần lại với nhau, cách nhau bằng dấu phẩy

    try {
      // Kiểm tra nếu chỉ thay đổi trạng thái mặc định mà không thay đổi thông tin địa chỉ
      if (!values.street && !values.ward && !values.district && !values.city) {
        console.log("Chỉ thay đổi trạng thái mặc định");

        // Nếu người dùng chọn làm mặc định và chưa có địa chỉ mặc định khác
        if (checked) {
          // Đặt tất cả các địa chỉ khác thành không mặc định trước khi cập nhật địa chỉ này
          await Promise.all(
            allAddresses.map(async (address) => {
              if (address._id !== addressId) {
                await axios.put(
                  `http://localhost:3002/api/user/${userId}/address/${address._id}/update-address`,
                  {
                    isDefault: false,
                  }
                );
              }
            })
          );
        }

        // Cập nhật địa chỉ hiện tại và đặt làm mặc định nếu cần
        const response = await axios.put(
          `http://localhost:3002/api/user/${userId}/address/${addressId}/update-address`,
          {
            isDefault: checked, // chỉ thay đổi isDefault nếu người dùng chọn
          }
        );
        console.log("Cập nhật thành công:", response.data);
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        // Trường hợp có thay đổi thông tin địa chỉ
        console.log("Đang cập nhật địa chỉ");

        // Đặt tất cả các địa chỉ không phải là mặc định thành không mặc định trước khi cập nhật
        await Promise.all(
          allAddresses.map(async (address) => {
            if (address._id !== addressId && checked) {
              await axios.put(
                `http://localhost:3002/api/user/${userId}/address/${address._id}/update-address`,
                {
                  isDefault: false,
                }
              );
            }
          })
        );

        // Cập nhật địa chỉ mới
        const response = await axios.put(
          `http://localhost:3002/api/user/${userId}/address/${addressId}/update-address`,
          {
            address: fullAddress,
            isDefault: checked, // Chỉ thay đổi isDefault nếu người dùng chọn
          }
        );

        console.log("Cập nhật thành công:", response.data);
        if (onUpdateSuccess) onUpdateSuccess();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: 600, margin: "auto", padding: 20, background: "#fff" }}
    >
      <Form.Item
        label="Tỉnh/Thành phố"
        name="city"
        // rules={[{ required: true }]}
      >
        <Select onChange={setSelectedProvince} value={selectedProvince}>
          {provinces.map((province) => (
            <Option key={province.code} value={province.code}>
              {province.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Quận/Huyện"
        name="district"
        // rules={[{ required: true }]}
      >
        <Select
          disabled={!selectedProvince}
          onChange={setSelectedDistrict}
          value={selectedDistrict}
        >
          {districts.map((district) => (
            <Option key={district.code} value={district.code}>
              {district.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Phường/Xã"
        name="ward"
        // rules={[{ required: true }]}
      >
        <Select disabled={!selectedDistrict} value={selectedWard}>
          {wards.map((ward) => (
            <Option key={ward.code} value={ward.name}>
              {ward.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Địa chỉ chi tiết"
        name="street"
        // rules={[{ required: true }]}
      >
        <Input></Input>
      </Form.Item>

      <Form.Item
        label={
          <span style={{ fontWeight: "700", fontSize: "22px" }}>
            Địa chỉ hiện tại
          </span>
        }
        name="address"
        // rules={[{ required: true }]}
      >
        <Input.TextArea rows={3} readOnly />
      </Form.Item>

      <Form.Item
        name="addressType"
        style={{ display: "flex", alignItems: "center", gap: "20px" }}
      >
        <input
          style={{ alignItems: "center", justifyContent: "center" }}
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <div
          style={{
            color: "blue",
            float: "right",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: "10px",
          }}
        >
          Đặt làm địa chỉ mặc định
        </div>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block style={{ height: 50 }}>
          {isEditing ? "Thêm mới" : "Cập nhật"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditAddressForm;
