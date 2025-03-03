import { Grid, Col, Drawer } from "antd";
import { SearchOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WrapperHeader, WrapperLogo, LoginButton, StyledLink } from "./style";
import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, setUser } from "../../redux/slices/userSlice";

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
  const dispatch = useDispatch();
  const { isAuthenticated, accessToken } = useSelector((state) => state.user);

  // Kiểm tra xem token có hết hạn không
  const checkTokenExpiration = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Giải mã JWT
      const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

      if (decodedToken.exp < currentTime) {
        handleLogout(); // Nếu token hết hạn, thực hiện logout và hiển thị thông báo
      } else {
        dispatch(setUser(token)); // Token còn hiệu lực, setUser trong Redux
      }
    } else {
      dispatch(logoutUser()); // Nếu không có token, logout
    }
  };

  // Hàm logout
  const handleLogout = () => {
    alert("Bạn đã hết phiên đăng nhập");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(logoutUser()); // Dispatch logout action
    navigate("/sign-in", { replace: true });
  };

  useEffect(() => {
    checkTokenExpiration(); // Kiểm tra khi component mount

    // Kiểm tra lại khi token thay đổi trong localStorage
    const intervalId = setInterval(() => {
      checkTokenExpiration(); // Kiểm tra định kỳ
    }, 1000 * 5); // Kiểm tra mỗi phút

    return () => {
      clearInterval(intervalId); // Dọn dẹp khi component unmount
    };
  }, [dispatch]);

  const handleLogoClick = () => {
    if (location.pathname !== "/home") navigate("/home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ height: screens.xs ? "4rem" : "7rem" }}>
      <WrapperHeader>
        {location.pathname === "/sign-in" ? (
          <Col span={24} style={{ textAlign: "center" }}>
            <div
              onClick={handleLogoClick}
              style={{
                cursor: "pointer",
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
                  cursor: location.pathname === "/home" ? "default" : "pointer",
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
          </>
        )}
      </WrapperHeader>
    </div>
  );
};

export default HeaderComponent;
