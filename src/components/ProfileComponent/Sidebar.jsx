import React from "react";
import { Menu } from "antd";
import {
  UserOutlined,
  FormOutlined,
  EnvironmentOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const { activePage } = useParams(); // Lấy trang hiện tại từ URL

  const handleMenuClick = (key) => {
    navigate(`/profile/${key}`); // Điều hướng URL khi click
  };

  return (
    <Menu
      mode="vertical"
      selectedKeys={[activePage || "profile"]} // Nếu activePage undefined, mặc định "profile"
      style={{ width: 256 }}
    >
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => handleMenuClick("customer-info")}
      >
        Thông tin tài khoản
      </Menu.Item>
      <Menu.Item
        key="orders"
        icon={<FormOutlined />}
        onClick={() => handleMenuClick("orders")}
      >
        Quản lý đơn hàng
      </Menu.Item>
      <Menu.Item
        key="address"
        icon={<EnvironmentOutlined />}
        onClick={() => handleMenuClick("address")}
      >
        Sổ địa chỉ
      </Menu.Item>
      <Menu.Item
        key="change-password"
        icon={<LockOutlined />}
        onClick={() => handleMenuClick("change-password")}
      >
        Đổi mật khẩu
      </Menu.Item>
    </Menu>
  );
};

export default Sidebar;
