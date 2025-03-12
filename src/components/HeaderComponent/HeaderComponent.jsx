import { Grid, Col, Drawer, Dropdown } from "antd";
import {
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
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

const HeaderComponent = ({
  isHiddenSerach = false,
  isHiddenMenu = false,
  isHiddenShoppingCard = false,
}) => {
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isUserDetailsFetched, setIsUserDetailsFetched] = useState(false);

  const {
    _id,
    isLoggingOut,
    isAuthenticated,
    accessToken,
    email,
    address,
    gender,
    username,
    avatar,
    isAdmin,
  } = useSelector((state) => state.user);

  // Hàm kiểm tra token hết hạn
  const checkTokenExpiration = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      const newToken = await refreshTokenApi(); // Thử refresh token
      console.log("Đang cố găng refresh token");
      if (!newToken) {
        AutoLogoutTokenExpired(); // Nếu không refresh được, logout
        console.log("Refresh Token thất bại");
      } else {
        dispatch(setUser({ ...user, accessToken: newToken }));
        console.log("Refresh thành công và đang lưu Token");
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

        const {
          _id,
          email,
          phone,
          dob,
          username,
          gender,
          address,
          avatar,
          isAdmin,
        } = response.data.data;

        // Lưu thông tin người dùng vào Redux
        dispatch(
          setUser({
            _id,
            accessToken: token,
            refreshToken: localStorage.getItem("refreshToken"),
            isAuthenticated: true,
            username,
            email,
            phone,
            dob,
            gender,
            address,
            avatar,
            isAdmin,
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
          localStorage.clear();
          dispatch(logoutUser());
          dispatch(setLoggingOut(false));
          navigate("/sign-in", { replace: true });
        }, 1500);
      }
    });
  };

  useEffect(() => {
    if (
      !isAuthenticated &&
      !isUserDetailsFetched &&
      localStorage.getItem("accessToken")
    ) {
      fetchUserDetails();
      setIsUserDetailsFetched(true);
    }

    checkTokenExpiration();

    // Kiểm tra lại token mỗi phút
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 1000 * 60); // 1 phút

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, isAuthenticated, isUserDetailsFetched]);

  const handleLogoClick = () => {
    if (location.pathname !== "/home") navigate("/home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tạo menu dropdown

  const items = [
    {
      key: "1",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "2",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];
  if (isAdmin) {
    items.push({
      key: "3",
      label: "Quản lý hệ thống",
      icon: <SettingOutlined />,
      onClick: () => navigate("/system/admin"),
    });
  }

  return (
    <Loading>
      <div style={{ height: screens.xs ? "4rem" : "5rem" }}>
        <WrapperHeader
          style={{
            justifyContent:
              isHiddenMenu && isHiddenSerach && isHiddenShoppingCard
                ? "space-between"
                : "unset",
          }}
        >
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
              {isHiddenMenu && isHiddenSerach && isHiddenShoppingCard ? (
                // Khi tất cả đều bị ẩn, LOGO bên trái, LOGIN hoặc Avatar bên phải
                <>
                  <Col style={{ textAlign: "left", flex: 1 }}>
                    <div
                      onClick={handleLogoClick}
                      style={{
                        cursor: "pointer",
                        transition: "opacity 0.3s",
                        display: "inline-block",
                        marginLeft: "50px",
                      }}
                    >
                      <WrapperLogo>LOGO</WrapperLogo>
                    </div>
                  </Col>

                  <Col style={{ textAlign: "right" }}>
                    {isAuthenticated ? (
                      <Dropdown menu={{ items }} trigger={["click"]}>
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
                              gap: "5px",
                              alignItems: "center",
                              padding: "8px",
                              minWidth: "80px",
                              width: "auto",
                              height: "auto",
                              background: "#ECE9DF",
                              border: "none",
                              boxShadow: "none",
                            }}
                          >
                            <span
                              style={{ fontSize: "11px", textAlign: "center" }}
                            >
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt="User Avatar"
                                  style={{
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <img
                                  src={
                                    gender === "Nữ"
                                      ? "https://res.cloudinary.com/dxwqi77i8/image/upload/v1741365430/avatars/kdnh7mfqp91kqc6zjef8.jpg"
                                      : "https://res.cloudinary.com/dxwqi77i8/image/upload/v1741365420/avatars/e9yxquyfuaifggq201ma.jpg"
                                  }
                                  alt="Default Avatar"
                                  style={{
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                            </span>
                            <span
                              style={{
                                fontSize: "15px",
                                textAlign: "center",
                                color: "Blue",
                                fontWeight: "400",
                              }}
                            >
                              {username || "Người dùng"}
                            </span>
                          </LoginButton>
                        </div>
                      </Dropdown>
                    ) : (
                      <button
                        style={{
                          width: "100px",
                          padding: "10px 20px",
                          backgroundColor: "#ECE9DF",
                          color: "BLUE",
                          border: "solid 2px rgb(44, 131, 158)",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "26px",
                        }}
                        onClick={() => navigate("/sign-in")}
                      >
                        LOGIN
                      </button>
                    )}
                  </Col>
                </>
              ) : (
                // Trường hợp bình thường (vẫn hiển thị các thành phần khác)
                <>
                  {!isHiddenMenu && (
                    <Col
                      style={{ textAlign: "center" }}
                      span={screens.xs ? 4 : 2}
                    >
                      <Sidebar />
                    </Col>
                  )}

                  {!isHiddenSerach && (
                    <Col
                      style={{ textAlign: "center" }}
                      span={screens.xs ? 0 : 2}
                    >
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
                  )}

                  <Col
                    span={screens.xs ? 16 : 16}
                    style={{ textAlign: "center" }}
                  >
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

                  <Col
                    style={{ textAlign: "center" }}
                    span={screens.xs ? 0 : 2}
                  >
                    {isAuthenticated ? (
                      <Dropdown menu={{ items }} trigger={["click"]}>
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
                              gap: "5px",
                              alignItems: "center",
                              padding: "8px",
                              minWidth: "80px",
                              width: "auto",
                              height: "auto",
                              background: "#ECE9DF",
                              border: "none",
                              boxShadow: "none",
                            }}
                          >
                            <span
                              style={{ fontSize: "11px", textAlign: "center" }}
                            >
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt="User Avatar"
                                  style={{
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <img
                                  src={
                                    gender === "Nữ"
                                      ? "https://res.cloudinary.com/dxwqi77i8/image/upload/v1741365430/avatars/kdnh7mfqp91kqc6zjef8.jpg"
                                      : "https://res.cloudinary.com/dxwqi77i8/image/upload/v1741365420/avatars/e9yxquyfuaifggq201ma.jpg"
                                  }
                                  alt="Default Avatar"
                                  style={{
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                            </span>
                            <span
                              style={{
                                fontSize: "15px",
                                textAlign: "center",
                                color: "Blue",
                                fontWeight: "400",
                              }}
                            >
                              {username || "Người dùng"}
                            </span>
                          </LoginButton>
                        </div>
                      </Dropdown>
                    ) : (
                      <button
                        style={{
                          width: "120px", // Tăng chiều rộng để đảm bảo chữ không bị bó hẹp
                          height: "50px", // Đặt chiều cao cụ thể để giúp căn giữa chữ
                          backgroundColor: "#ECE9DF",
                          color: "blue",
                          border: "solid 2px rgb(44, 131, 158)",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "20px",
                          fontWeight: "bold",

                          /** Căn giữa chữ theo cả hai chiều */
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                        onClick={() => navigate("/sign-in")}
                      >
                        LOGIN
                      </button>
                    )}
                  </Col>

                  {!isHiddenShoppingCard && (
                    <Col>
                      <ShoppingCartOutlined
                        style={{ fontSize: "45px", color: "rgb(36, 31, 31)" }}
                      />
                    </Col>
                  )}
                </>
              )}
            </>
          )}
        </WrapperHeader>
      </div>
    </Loading>
  );
};

export default HeaderComponent;
