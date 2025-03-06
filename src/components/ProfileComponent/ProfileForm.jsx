import React, { useEffect } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { updateUser } from "../../Services/UserService";
import { setLoading } from "../../redux/slices/loadingSlice";
import { setUser } from "../../redux/slices/userSlice";
import Loading from "../LoadingComponent/Loading";

const { Option } = Select;

const ProfileForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux
  const user = useSelector((state) => state.user);
  const accessToken = useSelector((state) => state.user.accessToken);

  console.log("User từ Redux:", user);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username || "",
        nickname: user.nickname || "",
        phone: user.phone ? String(user.phone) : "",
        email: user.email || "",
        dob: user.dob && dayjs(user.dob).isValid() ? dayjs(user.dob) : null, // Chuyển đổi Date sang dayjs
        gender: user.gender || null,
        nationality: user.nationality ?? undefined,
      });
    }
  }, [user, form]);

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

      const updatedData = {
        username: values.username,
        nickname: values.nickname,
        dob: formattedDob, // Đảm bảo giá trị hợp lệ
        gender: values.gender,
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
        style={{ background: "white", padding: "15px", marginBottom: "30px" }}
      >
        <Row gutter={24}>
          <Col
            span={12}
            style={{
              borderRight: "1px solid #d9d9d9", // Đường gạch dọc
              paddingRight: "18px", // Tạo khoảng cách với nội dung
            }}
          >
            <Form.Item
              name="username"
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
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="email" label="Địa chỉ email">
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại">
              <Input prefix={<PhoneOutlined />} />
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
    </Loading>
  );
};

export default ProfileForm;
