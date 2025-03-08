import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Row,
  Col,
  Modal,
  Upload,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { changePasswordUser, updateUser } from "../../Services/UserService";
import { setLoading } from "../../redux/slices/loadingSlice";
import { setUser } from "../../redux/slices/userSlice";
import Loading from "../LoadingComponent/Loading";
import { getBase64 } from "../../utils/UploadAvatar";
import axios from "axios";

const { Option } = Select;

const ProfileForm = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState([]);

  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  // Lấy dữ liệu từ Redux
  const user = useSelector((state) => state.user);
  const accessToken = useSelector((state) => state.user.accessToken);
  const [phone, setPhone] = useState(user.phone || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const API_BASE_URL = import.meta.env.VITE_URL_BACKEND;

  const handleChangeImage = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setFileList(fileList.slice(-1));

    const formData = new FormData();
    formData.append("avatar", file.originFileObj);

    console.log("File gửi lên backend:", file.originFileObj);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/upload-avatar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Response từ server:", response.data);
      setAvatar(response.data.imageUrl);
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại!");
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      Modal.error({ title: "Chỉ được tải lên file ảnh!" });
    }
    return isImage;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  useEffect(() => {
    if (user) {
      const formattedAddress = Array.isArray(user.address)
        ? user.address.map((addr) => ({
            address: addr.address || "", // Đảm bảo address là chuỗi
            isDefault: addr.isDefault || false, // Đảm bảo isDefault là boolean
          }))
        : [];
      form.setFieldsValue({
        username: user.username || "",
        phone: user.phone ? String(user.phone) : "",
        email: user.email || "",
        dob: user.dob && dayjs(user.dob).isValid() ? dayjs(user.dob) : null,
        gender: user.gender || null,
        address: formattedAddress,
        avatar: user.avatar || null,
      });
    }
  }, [user, form]);

  // Cập nhật số điện thoại
  const handlePhoneUpdate = async () => {
    if (!phone.trim()) {
      message.error("Vui lòng nhập số điện thoại hợp lệ!");
      return;
    }
    if (!/^(0[3-9][0-9]{8}|84[3-9][0-9]{8})$/.test(phone)) {
      message.error("Số điện thoại không hợp lệ! Vui lòng nhập lại.");
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await updateUser(user._id, { phone }, accessToken);
      message.success(response.message || "Cập nhật số điện thoại thành công!");

      dispatch(setUser({ ...user, phone }));
      setIsPhoneModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (values) => {
    console.log("📤 Dữ liệu gửi đi:", values);
    try {
      dispatch(setLoading(true));
      const { oldPassword, newPassword, confirmPassword } = values;

      if (newPassword !== confirmPassword) {
        message.error("Mật khẩu xác nhận không khớp!");
        return;
      }

      try {
        const response = await changePasswordUser(
          oldPassword,
          newPassword,
          confirmPassword,
          accessToken
        );

        console.log("📨 Phản hồi từ API:", response);
        message.success(response.message || "Đổi mật khẩu thành công!");

        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      } catch (error) {
        console.error("🔥 Lỗi FE:", error);
        message.error(error); // In toàn bộ lỗi để xem chi tiết
        const errorMessage =
          error.response?.data?.message || "Lỗi khi đổi mật khẩu!";
        message.error(errorMessage); // Hiển thị thông báo lỗi từ backend
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpdateUser = async (values) => {
    if (!user?._id) {
      message.error("Lỗi: Không tìm thấy ID người dùng!");
      return;
    }

    try {
      dispatch(setLoading(true));

      // Kiểm tra giá trị date hợp lệ
      const formattedDob =
        values.dob && dayjs(values.dob).isValid()
          ? dayjs(values.dob).format("YYYY-MM-DD")
          : null;

      // Kiểm tra và xử lý trường address
      let updatedAddress = [];
      if (Array.isArray(values.address)) {
        updatedAddress = values.address.map((addr) => ({
          address: addr.address || "", // Đảm bảo address là chuỗi
          isDefault: addr.isDefault || false, // Đảm bảo isDefault là boolean
        }));
      } else if (typeof values.address === "string") {
        // Nếu address là chuỗi, chuyển đổi thành mảng
        updatedAddress = [{ address: values.address, isDefault: true }];
      } else {
        // Nếu address không hợp lệ, đặt lại thành mảng rỗng
        updatedAddress = [];
      }

      const updatedData = {
        username: values.username,
        avatar: avatar,
        dob: formattedDob, // Đảm bảo giá trị hợp lệ
        gender: values.gender,
        address: updatedAddress, // Sử dụng address đã được xử lý
      };

      const response = await updateUser(user._id, updatedData, accessToken);
      message.success(response.message || "Cập nhật thông tin thành công!");

      dispatch(
        setUser({
          ...user, // Giữ nguyên các trường khác
          ...updatedData,
          username: values.username, // Cập nhật username mới
        })
      );

      setTimeout(() => {
        dispatch(setLoading(false)); // Dừng loading trước khi reload
        //window.location.reload();
      }, 1500); // Chờ 1 giây để hiển thị thông báo

      // Cập nhật lại form sau khi lưu thành công
      form.setFieldsValue({
        ...values,
        dob: formattedDob ? dayjs(formattedDob) : null,
      });
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false)); // Dừng loading trước khi reload
        //window.location.reload();
      }, 1000); // Chờ 1 giây để hiển thị thông báo
    }
  };

  return (
    <Loading>
      <Form
        form={form}
        onFinish={handleUpdateUser}
        layout="vertical"
        style={{
          background: "white",
          padding: "15px",
          marginBottom: "30px",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="username"
              label="Họ & Tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item name="avatar" label="Avatar">
              <CustomUpload>
                {avatar && (
                  <img
                    src={avatar}
                    style={{
                      height: "60px",
                      width: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    alt="Avatar"
                  />
                )}
                <Upload
                  action={null}
                  customRequest={() => {}}
                  onChange={handleChangeImage}
                  maxCount={1}
                >
                  <Button icon={<PlusOutlined />}>Chọn Avatar</Button>
                </Upload>
              </CustomUpload>
            </Form.Item>
            <Form.Item
              name="dob"
              label="Ngày sinh"
              rules={[
                { required: true, message: "Vui lòng chọn ngày sinh!" },
                {
                  validator: (_, value) => {
                    if (value && !value.isValid()) {
                      return Promise.reject("Ngày sinh không hợp lệ!");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="gender" label="Giới tính">
              <Select placeholder="Chọn giới tính">
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item name="email" label="Địa chỉ email">
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại">
              <StyleInputUpdatePhone
                prefix={<PhoneOutlined />}
                readOnly
                className="readonly-input"
              />
            </Form.Item>
            <Button
              type="primary"
              style={{ marginTop: 5 }}
              onClick={() => setIsPhoneModalVisible(true)}
            >
              Cập nhật
            </Button>
            <h3>Bảo mật</h3>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={() => setIsPasswordModalVisible(true)}
            >
              Đổi mật khẩu
            </Button>
            <h3>Yêu cầu xóa tài khoản</h3>
            <Button type="primary" danger>
              Yêu cầu
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Modal cập nhật số điện thoại */}
      <Modal
        title="Cập nhật số điện thoại"
        open={isPhoneModalVisible}
        onCancel={() => {
          setIsPhoneModalVisible(false);
          setTimeout(() => setPhone(user.phone || ""), 0); // Đặt lại phone ngay sau khi đóng modal
        }}
        centered
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsPhoneModalVisible(false);
              setPhone(user.phone || "");
            }}
          >
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handlePhoneUpdate}>
            Xác nhận
          </Button>,
        ]}
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="Nhập số điện thoại mới"
          value={phone}
          onChange={(e) => {
            const value = e.target.value;
            // Chỉ cho phép nhập số
            if (/^\d*$/.test(value)) {
              setPhone(value);
            } else {
              message.warning("Chỉ được nhập số!");
            }
          }}
        />
      </Modal>
      {/* Đổi mật khẩu */}
      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModalVisible}
        onCancel={() => setIsPasswordModalVisible(false)}
        centered
        footer={null}
      >
        <Form
          form={passwordForm}
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Xác nhận
          </Button>
        </Form>
      </Modal>
    </Loading>
  );
};

export default ProfileForm;

// Styled Component
export const StyleInputUpdatePhone = styled(Input)`
  .readonly-input {
    background-color: red !important;
    color: black !important;
    cursor: not-allowed;
    border: 1px solid #d9d9d9;
  }
`;

export const CustomUpload = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;

  .ant-upload-list-item-name {
    display: none;
  }
  .ant-btn-icon {
    display: none;
  }
  .ant-upload-icon {
    display: none;
  }
  .ant-upload-list-item-container {
    display: none;
  }
`;
