import React, { useState, useEffect } from "react";
import { Col, Drawer, Grid } from "antd";
import { WrapperHeader } from "./style";
import { MenuOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { WrapperLogo, LoginButton, StyledLink } from "./style";
import { useNavigate, useLocation } from "react-router-dom";
import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";

const { useBreakpoint } = Grid;

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();

  return (
    <div>
      <div
        style={{
          fontSize: screens.xs ? "14px" : "16px",
          cursor: "pointer",
          padding: "10px",
        }}
        onClick={() => setOpen(true)}
      >
        <MenuOutlined /> Menu
      </div>

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CloseOutlined
              onClick={() => setOpen(false)}
              style={{
                cursor: "pointer",
                fontSize: screens.xs ? "16px" : "18px",
                marginLeft: "50px",
                height: screens.xs ? "2rem" : "5.3rem",
              }}
            />
            <span
              onClick={() => setOpen(false)}
              style={{
                cursor: "pointer",
                fontSize: screens.xs ? "14px" : "16px",
              }}
            >
              Đóng
            </span>
          </div>
        }
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        closeIcon={null}
        width={screens.xs ? "90%" : "400px"}
      >
        <ul
          style={{
            listStyle: "none",
            padding: screens.xs ? "10px" : "20px",
            fontSize: screens.xs ? "16px" : "18px",
          }}
        >
          {[<NavbarComponent />].map((item, index) => (
            <li
              key={index}
              style={{
                marginBottom: "10px",
                marginLeft: screens.xs ? "10px" : "30px",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </Drawer>
    </div>
  );
};

const HeaderComponent = () => {
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);

    // Kiểm tra trạng thái đăng nhập khi component được mount
    if (localStorage.getItem("token")) {
      setIsAuthenticated(true);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (location.pathname !== "/home") {
      navigate("/home");
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    // Xóa accessToken khỏi localStorage
    localStorage.removeItem("token");

    // Cập nhật trạng thái đăng xuất
    setIsAuthenticated(false);

    // Chuyển hướng về trang đăng nhập
    navigate("/sign-in");
  };

  return (
    <div style={{ height: screens.xs ? "4rem" : "7rem" }}>
      <WrapperHeader>
        {location.pathname === "/sign-in" ? (
          <Col span={24} style={{ textAlign: "center" }}>
            <div
              onClick={handleLogoClick}
              style={{
                cursor:
                  isAtTop && location.pathname === "/" ? "default" : "pointer",
                transition: "opacity 0.3s",
                display: "inline-block",
              }}
            >
              <WrapperLogo>LOGO</WrapperLogo>
            </div>
          </Col>
        ) : (
          <>
            <Col style={{ textAlign: "center" }} span={screens.xs ? 4 : 2}>
              <Sidebar />
            </Col>
            <Col style={{ textAlign: "center" }} span={screens.xs ? 0 : 2}>
              <div className="Search">
                <StyledLink to="/search">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <SearchOutlined />
                    <div style={{ margin: "0 5px" }}>Tìm kiếm</div>
                  </div>
                </StyledLink>
              </div>
            </Col>
            <Col span={screens.xs ? 16 : 16} style={{ textAlign: "center" }}>
              <div
                onClick={handleLogoClick}
                style={{
                  cursor:
                    isAtTop && location.pathname === "/home"
                      ? "default"
                      : "pointer",
                  transition: "opacity 0.3s",
                  display: "inline-block",
                }}
              >
                <WrapperLogo>LOGO</WrapperLogo>
              </div>
            </Col>
            <Col style={{ textAlign: "center" }} span={screens.xs ? 0 : 2}>
              {isAuthenticated ? (
                <LoginButton onClick={handleLogout}>LOGOUT</LoginButton>
              ) : (
                <LoginButton onClick={() => navigate("/sign-in")}>
                  LOGIN
                </LoginButton>
              )}
            </Col>
            <Col style={{ textAlign: "center" }} span={screens.xs ? 4 : 2}>
              col-8
            </Col>
          </>
        )}
      </WrapperHeader>
    </div>
  );
};

export default HeaderComponent;
