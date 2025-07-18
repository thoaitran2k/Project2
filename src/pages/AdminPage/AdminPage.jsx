import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  OrderedListOutlined,
  PercentageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminProduct from "../../components/AdminProduct/AdminProduct";
import AdjustDiscountProducts from "../../components/AdminProduct/AdjustDiscountProducts";
import { getAllProduct } from "../../redux/slices/productSlice";

import OrderManage from "../../components/AdminUser/OrderManage";
import PromotionManagement from "../../components/AdminProduct/PromotionManagement";
import ReportComponent from "../../components/AdminProduct/ReportComponent";

// Menu items
const items = [
  {
    key: "user",
    icon: <UserOutlined />,
    label: "Người dùng",
    children: [{ key: "user_list", label: "Danh sách người dùng" }],
  },
  {
    key: "product",
    icon: <AppstoreOutlined />,
    label: "Sản phẩm",
    children: [{ key: "product_list", label: "Danh sách sản phẩm" }],
  },
  {
    key: "orders",
    icon: <OrderedListOutlined />,
    label: "Đơn hàng",
    children: [{ key: "orders_list", label: "Danh sách đơn hàng" }],
  },
  {
    key: "promotion",
    icon: <PercentageOutlined />,
    label: "Giảm giá",
    children: [
      { key: "product_discount", label: "Điều chỉnh giảm giá" },
      { key: "product_promotion", label: "Tạo mã giảm giá" },
    ],
  },
  {
    key: "report",
    icon: <BarChartOutlined />,
    label: "Báo cáo - Thống kê",
    children: [{ key: "product_report", label: "Báo cáo bán hàng" }],
  },
];
const AdminPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stateOpenKeys, setStateOpenKeys] = useState([]); // Trạng thái mở submenu
  const [selectedKey, setSelectedKey] = useState(
    localStorage.getItem("selectedKey") || "user_list" // Khởi tạo từ localStorage
  );

  // Tìm submenu cha của selectedKey
  const findParentKey = (key) => {
    for (const item of items) {
      if (item.children) {
        const found = item.children.find((child) => child.key === key);
        if (found) return item.key; // Trả về key của submenu cha
      }
    }
    return null;
  };

  useEffect(() => {
    const parentKey = findParentKey(selectedKey);
    if (parentKey) {
      setStateOpenKeys([parentKey]);

      // Khi mở menu Sản phẩm, tự động gọi API
      if (parentKey === "product") {
        dispatch(getAllProduct({ limit: 100, page: 1 })); // Gọi API với limit lớn
      }
    }
  }, [selectedKey, dispatch]);

  // Tự động mở submenu cha khi selectedKey thay đổi
  useEffect(() => {
    const parentKey = findParentKey(selectedKey);
    if (parentKey) {
      setStateOpenKeys([parentKey]); // Mở submenu cha
    }
  }, [selectedKey]);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/home"); // Chuyển hướng nếu không phải admin
    }

    // Khôi phục `selectedKey` từ localStorage
    const savedKey = localStorage.getItem("selectedKey");

    if (savedKey) {
      setSelectedKey(savedKey);
    }
  }, [user, navigate]);

  // Xử lý khi mở/đóng submenu
  const onOpenChange = (openKeys) => {
    setStateOpenKeys(openKeys);
  };

  // Xử lý khi click vào menu
  const handleOnClick = ({ key }) => {
    setSelectedKey(key);
    localStorage.setItem("selectedKey", key); // Lưu key vào localStorage
    console.log("Saved to localStorage:", key);
    if (key.startsWith("product_")) {
      dispatch(getAllProduct({ limit: 100, page: 1 }));
    } // Kiểm tra
  };

  // Render nội dung theo menu được chọn
  const renderContent = () => {
    switch (selectedKey) {
      case "user_list":
        return <AdminUser />;
      case "orders_list":
        return <OrderManage />;
      case "product_list":
        return <AdminProduct />;
      case "product_discount":
        return (
          <h2>
            <AdjustDiscountProducts />
          </h2>
        );
      case "product_promotion":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              width: "100%",
            }}
          >
            <PromotionManagement />
          </div>
        );
      case "product_report":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              width: "100%",
            }}
          >
            <ReportComponent />
          </div>
        );
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
          selectedKeys={[selectedKey]} // Đảm bảo selectedKey được truyền vào
          openKeys={stateOpenKeys} // Đảm bảo submenu cha được mở
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
    marginTop: "5vh",
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
  },
};

export default AdminPage;
