import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Button, Drawer } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { MenuOutlined } from "@ant-design/icons";
import Sidebar from "../../components/ProfileComponent/Sidebar";
import ProfileForm from "../../components/ProfileComponent/ProfileForm";
import { setActivePage } from "../../redux/slices/profileSlice";

import AddressList from "../../components/ProfileComponent/AddressComponent/AddressList";

const { Title } = Typography;

const pageTitles = {
  "customer-info": "Thông tin tài khoản",
  orders: "Quản lý đơn hàng",
  address: "Chỉnh sửa địa chỉ",
  "change-password": "Đổi mật khẩu",
};

const ProfilePage = () => {
  const { activePage } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!activePage) {
      navigate("/profile/customer-info", { replace: true });
    } else {
      dispatch(setActivePage(activePage));
    }
  }, [activePage, dispatch, navigate]);

  const renderContent = () => {
    switch (activePage) {
      case "customer-info":
        return <ProfileForm />;
      case "orders":
        return <h2>Quản lý đơn hàng</h2>;
      case "address":
        return (
          <div style={{ width: "100%" }}>
            {user?.isAuthenticated ? (
              <AddressList userId={user._id} accessToken={user.accessToken} />
            ) : (
              <p>Đang tải dữ liệu...</p>
            )}
          </div>
        );
      case "change-password":
        return <h2>Đổi mật khẩu</h2>;
      default:
        return <ProfileForm />;
    }
  };

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      {/* Nút Menu (chỉ hiển thị trên mobile) */}
      <Col xs={24} sm={0} style={{ textAlign: "left", marginBottom: "10px" }}>
        <Button
          type="primary"
          icon={<MenuOutlined />}
          onClick={() => setVisible(true)}
        >
          {pageTitles[activePage] || "Menu"}
        </Button>
      </Col>

      {/* Sidebar (ẩn trên mobile) */}
      <Col xs={0} sm={6} md={5} style={{ minHeight: "100vh" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          <Title
            level={4}
            style={{
              color: "#1890ff",
              textAlign: "left",
              marginTop: "5px",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "14px" }}>Tài khoản của </span> <br />
            <span style={{ fontSize: "25px", color: "red" }}>
              {user.username}
            </span>
          </Title>
          <Sidebar />
        </Card>
      </Col>

      {/* Nội dung chính */}
      <Col xs={24} sm={18} md={19}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          <Title level={4} style={{ marginTop: "0", marginBottom: "16px" }}>
            {pageTitles[activePage] || "Thông tin tài khoản"}
          </Title>
          {renderContent()}
        </Card>
      </Col>

      {/* Drawer Sidebar cho mobile */}
      <Drawer
        title="Menu"
        placement="left"
        closable
        onClose={() => setVisible(false)}
        open={visible}
      >
        <Sidebar />
      </Drawer>
    </Row>
  );
};

export default ProfilePage;
