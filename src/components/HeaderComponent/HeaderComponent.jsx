import { Grid, Col, Drawer, Dropdown, Menu } from "antd";
import {
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WrapperHeader, WrapperLogo, LoginButton, StyledLink } from "./style";
import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutUser,
  setUser,
  setLoggingOut,
} from "../../redux/slices/userSlice";
import swal from "sweetalert";
import refreshTokenApi from "../../utils/jwtService";
import axios from "axios";
import Loading from "../LoadingComponent/Loading";

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

  const { isLoggingOut, isAuthenticated, accessToken, email, username } =
    useSelector((state) => state.user);

  // Hàm kiểm tra token hết hạn
  const checkTokenExpiration = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      dispatch(logoutUser()); // Đảm bảo logout nếu không có token
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      const newToken = await refreshTokenApi(); // Thử refresh token
      if (!newToken) {
        AutoLogoutTokenExpired(); // Nếu không refresh được, logout
      } else {
        dispatch(setUser(newToken)); // Cập nhật user với token mới
      }
    }
  };

  // Hàm tự động logout khi token hết hạn
  const AutoLogoutTokenExpired = () => {
    alert("Bạn đã hết phiên đăng nhập");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(logoutUser()); // Dispatch logout action
    navigate("/sign-in", { replace: true });
  };

  // Hàm lấy thông tin người dùng từ server
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (token && !isAuthenticated) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        // Gửi yêu cầu API để lấy thông tin người dùng
        const response = await axios.get(
          `http://localhost:3002/api/user/get-details/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { email, phone, dob, username, gender } = response.data.data;
        console.log("Data", response.data.data);

        // Lưu thông tin người dùng vào Redux
        dispatch(
          setUser({
            accessToken: token,
            refreshToken: localStorage.getItem("refreshToken"),
            isAuthenticated: true,
            username,
            email,
            phone,
            dob,
            gender,
          })
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      AutoLogoutTokenExpired(); // Nếu có lỗi, tự động logout
    }
  };

  // Hàm logout
  const handleLogout = () => {
    swal({
      title: "Bạn muốn đăng xuất?",
      icon: "",
      buttons: {
        cancel: "Hủy",
        confirm: {
          text: "OK",
          value: true,
          visible: true,
          className: "",
          closeModal: true,
        },
      },
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) {
        dispatch(setLoggingOut(true)); // Bật trạng thái loading
        setTimeout(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch(logoutUser()); // Đăng xuất
          dispatch(setLoggingOut(false)); // Tắt trạng thái loading
          navigate("/sign-in", { replace: true });
        }, 1500);
      }
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUserDetails();
    } // Lấy thông tin người dùng khi component mount
    checkTokenExpiration(); // Kiểm tra token hết hạn

    // Kiểm tra lại token mỗi phút
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 1000 * 60); // 1 phút

    return () => {
      clearInterval(intervalId); // Dọn dẹp khi component unmount
    };
  }, [dispatch, isAuthenticated]);

  const handleLogoClick = () => {
    if (location.pathname !== "/home") navigate("/home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tạo menu dropdown
  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        icon={<UserOutlined />}
        onClick={() => navigate("/profile")}
      >
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Loading>
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
                    cursor:
                      location.pathname === "/home" && window.scrollY === 0
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
                  <Dropdown overlay={menu} trigger={["click"]}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <LoginButton
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "8px",
                          minWidth: "80px", // Đảm bảo không quá nhỏ
                          width: "auto", // Tự động điều chỉnh chiều rộng theo nội dung
                          height: "auto", // Tự động điều chỉnh chiều cao theo nội dung
                          whiteSpace: "nowrap", // Đảm bảo chữ không bị xuống dòng
                        }}
                      >
                        <span style={{ fontSize: "11px", textAlign: "center" }}>
                          Xin chào,
                        </span>
                        <span
                          style={{
                            fontSize: "17px",
                            textAlign: "center",
                            color: "red",
                          }}
                        >
                          {username}
                        </span>
                      </LoginButton>
                    </div>
                  </Dropdown>
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
    </Loading>
  );
};

export default HeaderComponent;
