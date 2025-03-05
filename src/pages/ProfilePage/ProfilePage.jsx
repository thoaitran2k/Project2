import React, { useEffect } from "react";
import { Row, Col } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/ProfileComponent/Sidebar";
import ProfileForm from "../../components/ProfileComponent/ProfileForm";
import { setActivePage } from "../../redux/slices/profileSlice";

const ProfilePage = () => {
  const { activePage } = useParams(); // Lấy trạng thái từ URL
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!activePage) {
      navigate("/profile/customer-info", { replace: true }); // Điều hướng mặc định
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
    <Row
      gutter={16}
      style={{
        height: "85vh",
        padding: "0 10px",
      }}
    >
      <Col span={5} style={{ display: "flex", flexDirection: "column" }}>
        <h1>Thoại Trần</h1>
        <Sidebar />
      </Col>
      <Col span={19} style={{ display: "flex", flexDirection: "column" }}>
        <h1>Thông tin tài khoản</h1>
        {renderContent()}
      </Col>
    </Row>
  );
};

export default ProfilePage;
