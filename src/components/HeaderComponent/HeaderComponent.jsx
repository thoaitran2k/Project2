import { Grid, Col, Drawer, Dropdown, Badge } from "antd";
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
import { setLoading } from "../../redux/slices/loadingSlice";
import CartIcon from "./CartIcon";
import { persistor } from "../../redux/store";

const { useBreakpoint } = Grid;

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const [selectedCategory, setSelectedCategory] = useState(null);

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
        <MenuOutlined style={{ fontSize: "17px" }} /> Menu
      </div>

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
        width={screens.xs ? "90%" : selectedCategory ? "800px" : "400px"}
      >
        <NavbarComponent
          onClose={() => setOpen(false)}
          isOpen={open}
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
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
  const isLoading = useSelector((state) => state.loading.isLoading);
  const cartCount = useSelector((state) => state.cart.cartCount);
  const cartItems = useSelector((state) => state.cart.cartItems);

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
        console.log("Refresh thành công và đang lưu Token", newToken);

        await fetchUserDetails();
      }
    }
  };

  const handleAddToCart = () => {
    setCartCount((prevCount) => prevCount + 1);
  };

  const handleToOrder = () => {
    try {
      dispatch(setLoading(true));
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false));
        navigate("/order");
      }, 1000);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      dispatch(setUser(storedUser));
    }
  }, []);

  // Hàm tự động logout khi token hết hạn
  const AutoLogoutTokenExpired = () => {
    alert("Bạn đã hết phiên đăng nhập");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(logoutUser());
    navigate("/sign-in", { replace: true });
  };

  // Hàm lấy thông tin người dùng từ server
  const fetchUserDetails = async () => {
    //console.log("🔍 Bắt đầu gọi fetchUserDetails()......................."); // Debug

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.log("🚨 Không có token, thoát khỏi fetchUserDetails()");
        return;
      }

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

      const newUserData = {
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
      };

      // Lưu thông tin người dùng vào Redux & localStorage
      dispatch(setUser(newUserData));

      localStorage.setItem("user", JSON.stringify(newUserData));
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      AutoLogoutTokenExpired(); // Nếu có lỗi, tự động logout
    }
  };

  // Hàm logout
  const handleLogout = async () => {
    const willLogout = await swal({
      title: "Bạn muốn đăng xuất?",
      icon: "warning",
      buttons: {
        cancel: "Hủy",
        confirm: {
          text: "OK",
          value: true,
        },
      },
      dangerMode: true,
    });

    if (willLogout) {
      try {
        // Chỉ xóa thông tin user, không xóa cart
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        await dispatch(logoutUser()).unwrap();
        await persistor.purge();
        //navigate("/sign-in", { replace: true });
      } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
      }
    }
  };

  useEffect(() => {
    if (!isUserDetailsFetched && localStorage.getItem("accessToken")) {
      fetchUserDetails();
      setIsUserDetailsFetched(true);
    }

    checkTokenExpiration();

    // Kiểm tra lại token mỗi phút
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 1000 * 60);

    return () => clearInterval(intervalId);
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
                                      ? "https://res.cloudinary.com/dxwqi77i8/image/upload/v1742141833/avatars/cf5iyblengym8et8pone.jpg"
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
                          backgroundColor: "#2C839E",
                          color: "BLUE",
                          border: "solid 2px rgb(44, 131, 158)",
                          borderRadius: "35%",
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
                        <StyledLink to="/products">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <SearchOutlined style={{ fontSize: "17px" }} />
                            <div style={{ margin: "0 5px", fontSize: "17px" }}>
                              Tìm kiếm
                            </div>
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
                              flexDirection: "row",
                              alignItems: "center",
                              padding: "2px",
                              minWidth: "80px",
                              width: "auto",
                              height: "auto",
                              background: "transparent",
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
                                      : "https://res.cloudinary.com/dxwqi77i8/image/upload/v1743435676/avatars/pt0w7sb1lyvzyivnci8r.jpg"
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
                          width: "130px",
                          height: "50px",
                          backgroundColor: "#2C839E",
                          color: "white",
                          border: "solid 2px rgb(44, 131, 158)",
                          borderRadius: "50px",
                          cursor: "pointer",
                          fontSize: "20px",
                          fontWeight: "400",

                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          transition: "all 0.3s ease-in-out", // Hiệu ứng chuyển động mượt mà

                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Đổ bóng nhẹ tạo hiệu ứng nổi
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = "#1B5C74"; // Màu đậm hơn khi hover
                          e.target.style.transform = "scale(1.05)"; // Phóng to nhẹ
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = "#2C839E"; // Trả lại màu cũ
                          e.target.style.transform = "scale(1)"; // Trả lại kích thước cũ
                        }}
                        onMouseDown={(e) => {
                          e.target.style.boxShadow =
                            "0px 2px 4px rgba(0, 0, 0, 0.3)"; // Giảm đổ bóng khi nhấn
                          e.target.style.transform = "scale(0.98)"; // Nhấn xuống nhẹ
                        }}
                        onMouseUp={(e) => {
                          e.target.style.boxShadow =
                            "0px 4px 8px rgba(0, 0, 0, 0.2)"; // Trả lại đổ bóng
                          e.target.style.transform = "scale(1.05)"; // Trả lại hiệu ứng hover
                        }}
                        onClick={() => navigate("/sign-in")}
                      >
                        LOGIN
                      </button>
                    )}
                  </Col>

                  {!isHiddenShoppingCard && (
                    <Col>
                      {cartCount > 0 ? (
                        <Badge count={cartItems.length}>
                          <ShoppingCartOutlined
                            style={{
                              fontSize: "30px",
                              color: "rgb(65, 44, 189)",
                              transition:
                                "transform 0.2s ease, color 0.2s ease",
                              cursor: "pointer",
                            }}
                            onClick={handleToOrder}
                            onMouseEnter={(e) => {
                              e.target.style.color = "red"; // Đổi màu khi hover
                              e.target.style.transform = "scale(1.2)"; // Phóng to nhẹ
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = "rgb(65, 44, 189)"; // Trả về màu gốc
                              e.target.style.transform = "scale(1)"; // Trả về kích thước ban đầu
                            }}
                          />
                        </Badge>
                      ) : (
                        <ShoppingCartOutlined
                          style={{
                            fontSize: "30px",
                            color: "rgb(65, 44, 189)",
                            transition: "transform 0.2s ease, color 0.2s ease",
                            cursor: "pointer",
                          }}
                          onClick={handleToOrder}
                          onMouseEnter={(e) => {
                            e.target.style.color = "red"; // Đổi màu khi hover
                            e.target.style.transform = "scale(1.2)"; // Phóng to nhẹ
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "rgb(65, 44, 189)"; // Trả về màu gốc
                            e.target.style.transform = "scale(1)"; // Trả về kích thước ban đầu
                          }}
                        />
                      )}
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
