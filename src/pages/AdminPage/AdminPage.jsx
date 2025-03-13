import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu } from "antd";
import { AppstoreOutlined, UserOutlined } from "@ant-design/icons";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminProduct from "../../components/AdminProduct/AdminProduct";

// Menu items
const items = [
  {
    key: "user",
    icon: <UserOutlined />,
    label: "Người dùng",
    children: [
      { key: "user_list", label: "Danh sách người dùng" },
      { key: "user_add", label: "Thêm người dùng" },
    ],
  },
  {
    key: "product",
    icon: <AppstoreOutlined />,
    label: "Sản phẩm",
    children: [
      { key: "product_list", label: "Danh sách sản phẩm" },
      { key: "product_add", label: "Thêm sản phẩm" },
    ],
  },
];

const AdminPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [stateOpenKeys, setStateOpenKeys] = useState(["user"]);
  const [selectedKey, setSelectedKey] = useState("user_list");

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/home"); // Chuyển hướng nếu không phải admin
    }
  }, [user, navigate]);

  // Xử lý khi mở/đóng submenu
  const onOpenChange = (openKeys) => {
    setStateOpenKeys(openKeys);
  };

  // Xử lý khi click vào menu
  const handleOnClick = ({ key }) => {
    setSelectedKey(key);
  };

  // Render nội dung theo menu được chọn
  const renderContent = () => {
    switch (selectedKey) {
      case "user_list":
        return <AdminUser />;
      case "user_add":
        return <h2>Thêm người dùng</h2>;
      case "product_list":
        return <AdminProduct />;
      case "product_add":
        return <h2>Thêm sản phẩm</h2>;
      default:
        return <h2>Chọn một mục từ menu</h2>;
    }
  };

  return (
    <>
      <HeaderComponent isHiddenSerach isHiddenMenu isHiddenShoppingCard />

      <div style={styles.container}>
        {/* Sidebar Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={stateOpenKeys}
          onOpenChange={onOpenChange}
          style={styles.menu}
          items={items}
          onClick={handleOnClick}
          styles={{
            height: "75vh",
            boxShadow: "1px 1px 2px #ccc",
          }}
        />

        {/* Nội dung hiển thị */}
        <div style={styles.content}>{renderContent()}</div>
      </div>
    </>
  );
};

// CSS Styles
const styles = {
  container: {
    marginTop: "3vh",
    display: "flex",
    height: "100vh",
    width: "100%", // Đảm bảo full màn hình
  },
  menu: {
    width: 256,
    height: "100vh", // Menu chiếm toàn bộ chiều cao màn hình
    overflowY: "auto", // Thêm scroll nếu nội dung dài
  },
  content: {
    flex: 1, // Tự động mở rộng để lấp đầy không gian còn lại
    padding: "20px",
    backgroundColor: "#f5f5f5", // Giúp tách biệt menu với nội dung
    display: "flex",
    width: "100%",
    //justifyContent: "center",
    //alignItems: "center",
  },
};

export default AdminPage;
