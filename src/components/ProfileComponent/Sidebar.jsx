import React from "react";
import { Menu } from "antd";
import {
  UserOutlined,
  FormOutlined,
  EnvironmentOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const { activePage } = useParams();

  const handleMenuClick = (key) => {
    navigate(`/profile/${key}`);
  };

  return (
    <Menu
      mode="vertical"
      selectedKeys={[activePage || "customer-info"]}
      style={{
        borderRadius: "8px",
        border: "none",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {[
        {
          key: "customer-info",
          icon: <UserOutlined />,
          label: "Thông tin tài khoản",
        },
        { key: "orders", icon: <FormOutlined />, label: "Quản lý đơn hàng" },
        { key: "address", icon: <EnvironmentOutlined />, label: "Sổ địa chỉ" },
        {
          key: "like-products",
          icon: <HeartOutlined />,
          label: "Sản phẩm yêu thích",
        },
        {
          key: "review",
          icon: <HeartOutlined />,
          label: "Nhận xét của tôi",
        },
      ].map((item) => (
        <Menu.Item
          key={item.key}
          onClick={() => handleMenuClick(item.key)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "16px",
            fontSize: "16px",
            height: "50px",
            width: "97%",
            gap: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            color: activePage === item.key ? "#1677ff" : "#000",
            backgroundColor:
              activePage === item.key ? "rgb(230, 244, 255)" : "transparent",
            transition: "all 0.3s ease",
          }}
        >
          {item.icon} <span>{item.label}</span>
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default Sidebar;
