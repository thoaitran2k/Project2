import React from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const ProfileForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Thông tin đã cập nhật:", values);
    message.success("Cập nhật thông tin thành công!");
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      style={{ background: "white", padding: "15px", marginBottom: "30px" }}
    >
      <Row gutter={24}>
        {/* Cột bên trái - Thông tin cá nhân */}
        <Col span={12}>
          <h2>Thông tin cá nhân</h2>
          <Form.Item
            name="fullName"
            label="Họ & Tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item name="nickname" label="Nickname">
            <Input placeholder="Nhập nickname" />
          </Form.Item>
          <Form.Item
            name="dob"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính">
            <Select placeholder="Chọn giới tính">
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="nationality" label="Quốc tịch">
            <Select placeholder="Chọn quốc tịch">
              <Option value="vietnam">Việt Nam</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
          {/* Nút Lưu thay đổi - Canh giữa */}
          <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
            <Button type="primary" htmlType="submit">
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Col>

        {/* Cột bên phải - Số điện thoại và Email */}
        <Col span={12}>
          <h2>Số điện thoại và Email</h2>
          <Form.Item name="phone" label="Số điện thoại">
            <Input
              prefix={<PhoneOutlined />}
              defaultValue="0794330648"
              disabled
            />
          </Form.Item>
          <Button type="primary">Cập nhật</Button>

          <Form.Item name="email" label="Địa chỉ email">
            <Input
              prefix={<MailOutlined />}
              defaultValue="thoaitran007x@gmail.com"
              disabled
            />
          </Form.Item>
          <Button type="primary">Cập nhật</Button>

          <h2>Bảo mật</h2>
          <Button type="primary" icon={<LockOutlined />}>
            Đổi mật khẩu
          </Button>

          <h2>Yêu cầu xóa tài khoản</h2>
          <Button type="primary" danger>
            Yêu cầu
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ProfileForm;
