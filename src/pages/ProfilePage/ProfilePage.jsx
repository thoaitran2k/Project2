import React, { useEffect } from "react";
import { Row, Col, Card, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/ProfileComponent/Sidebar";
import ProfileForm from "../../components/ProfileComponent/ProfileForm";
import { setActivePage } from "../../redux/slices/profileSlice";

const { Title } = Typography;

const ProfilePage = () => {
  const { activePage } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username } = useSelector((state) => state.user);

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
        return <h2>Sổ địa chỉ</h2>;
      case "change-password":
        return <h2>Đổi mật khẩu</h2>;
      default:
        return <ProfileForm />;
    }
  };

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      {/* Sidebar */}
      <Col xs={24} sm={6} md={5} style={{ minHeight: "100vh" }}>
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
            <span style={{ fontSize: "14px" }}>Tài khoản của </span> <br />{" "}
            <span style={{ fontSize: "25px", color: "red" }}>{username}</span>
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
          {/* <Title level={3}>Thông tin tài khoản</Title> */}
          {renderContent()}
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;
