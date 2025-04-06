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
import {
  WrapperHeader,
  WrapperLogo,
  LoginButton,
  StyledLink,
  UserAvatar,
  UserName,
  MenuTrigger,
  DropdownMenu,
  CloseButton,
} from "./style";
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
import styled from "styled-components";
import { color } from "framer-motion";
import { useSearch } from "../Layout/SearchContext";
import useAutoLogoutWhenTokenMissing from "../../hooks/useAutoLogoutWhenTokenMissing";

const { useBreakpoint } = Grid;

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drawerWidth, setDrawerWidth] = useState(300); // State để điều chỉnh width

  // Khi category được chọn, mở rộng drawer
  useEffect(() => {
    if (selectedCategory?.items?.length > 0) {
      setDrawerWidth(600); // Gấp đôi width khi có danh mục con
    } else {
      setDrawerWidth(300); // Trở lại width ban đầu
    }
  }, [selectedCategory]);

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      <MenuTrigger onClick={() => setOpen(!open)}>
        <MenuOutlined style={{ fontSize: "18px", marginRight: 5 }} />
        <span style={{ fontSize: screens.xs ? "14px" : "16px" }}>Menu</span>
      </MenuTrigger>
      <div>
        <br />
        <Drawer
          title="Danh mục sản phẩm"
          placement="left"
          closable={true}
          onClose={() => {
            setOpen(false);
            setSelectedCategory(null); // Reset khi đóng drawer
          }}
          open={open}
          width={drawerWidth}
          styles={{
            body: { padding: 0, display: "flex" }, // Thêm display flex
            header: {
              padding: "16px 24px",
              borderBottom: "1px solid #f0f0f0",
            }, // Thay headerStyle thành styles.header
          }}
        >
          <NavbarComponent
            onClose={() => setOpen(false)}
            isOpen={open}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
            mode="vertical"
            drawerWidth={drawerWidth} // Truyền width xuống NavbarComponent
          />
        </Drawer>
      </div>
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
  const [showMessage, setShowMessage] = useState(false);
  const [showMessageCart, setShowMessageCart] = useState(false);
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

  const { toggleSearch } = useSearch();

  const handleSearchClick = () => {
    const searchParams = new URLSearchParams(location.search);

    searchParams.set("search", "true");

    console.log("searchParams", searchParams);

    toggleSearch();
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });

    // Đảo trạng thái tìm kiếm ngay lập tức
  };
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

  const CartIcon = ({ count, onClick, isAuthenticated }) => (
    <CartStyledHover>
      <Badge
        style={{ marginTop: 10, marginRight: 5 }}
        count={isAuthenticated ? count || null : null}
      >
        <CartIconStyled
          onClick={onClick}
          onMouseEnter={() => !isAuthenticated && setShowMessageCart(true)}
          onMouseLeave={() => setShowMessageCart(false)}
        />
      </Badge>

      {!isAuthenticated && showMessageCart && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
            backgroundColor: "#fff",
            color: "#ff4d4f",
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          Đăng nhập để xem giỏ hàng
        </div>
      )}
    </CartStyledHover>
  );

  const getDefaultAvatar = (gender) =>
    gender === "Nữ"
      ? "https://res.cloudinary.com/dxwqi77i8/image/upload/v1741365430/avatars/kdnh7mfqp91kqc6zjef8.jpg"
      : "https://res.cloudinary.com/dxwqi77i8/image/upload/v1743435676/avatars/pt0w7sb1lyvzyivnci8r.jpg";

  // Hàm tự động logout khi token hết hạn
  const AutoLogoutTokenExpired = () => {
    alert("Bạn đã hết phiên đăng nhập");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(logoutUser());
    navigate("/sign-in", { replace: true });
  };

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
        orderHistory,
        orders,
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
        orderHistory,
        orders,
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

        if (location.pathname !== "/home") {
          navigate("/home", { replace: true });
        }
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
                : "center",
          }}
        >
          {/* Menu (nếu không bị ẩn) */}
          {!isHiddenMenu && (
            <Col style={{}} span={screens.xs ? 4 : 2}>
              <Sidebar />
            </Col>
          )}

          {!isHiddenSerach && !screens.xs && (
            <Col span={1.2}>
              {/* <StyledLink to="/search"> */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
                onClick={handleSearchClick}
              >
                <SearchOutlined style={{ fontSize: "17px" }} />
                <div style={{ margin: "0 5px", fontSize: "17px" }}>
                  Tìm kiếm
                </div>
              </div>
              {/* </StyledLink> */}
            </Col>
          )}

          {/* Logo - luôn hiển thị */}
          <Col
            span={
              isHiddenMenu && isHiddenSerach && isHiddenShoppingCard
                ? undefined
                : screens.xs
                ? 17
                : 17
            }
            style={{ textAlign: "center" }}
          >
            <div
              onClick={handleLogoClick}
              style={{
                cursor: "pointer",
                display: "inline-block",
                marginLeft:
                  isHiddenMenu && isHiddenSerach && isHiddenShoppingCard
                    ? "50"
                    : screens.xs
                    ? -0
                    : -55,
              }}
            >
              <WrapperLogo>LOGO</WrapperLogo>
            </div>
          </Col>

          {/* Search (nếu không bị ẩn) */}

          {/* User/Auth section */}
          <Col span={screens.xs ? 0 : 2}>
            {isAuthenticated ? (
              <Dropdown
                menu={{ items }}
                trigger={["click"]}
                dropdownRender={(menu) => (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginLeft: "-50px",
                      width: "200px",
                    }}
                  >
                    {menu}
                  </div>
                )}
              >
                <UserAvatar style={{ display: "flex" }}>
                  <img
                    src={avatar || getDefaultAvatar(gender)}
                    alt={username || "User"}
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <UserName>{username || "Người dùng"}</UserName>
                </UserAvatar>
              </Dropdown>
            ) : (
              <UserNoLogin
                style={{
                  position: "relative",
                  fontSize: 17,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setShowMessage(true)} // Hiển thị khi di chuột vào
                onMouseLeave={() => setShowMessage(false)}
                onClick={() => {
                  navigate("/sign-in");
                }} // Ẩn khi di chuột ra
              >
                <UserOutlined /> Tài khoản
                {showMessage && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "35%",
                      transform: "translateX(-50%)",
                      marginTop: "8px",
                      backgroundColor: "#fff",
                      color: "#ff4d4f",
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      whiteSpace: "nowrap",
                      //zIndex: 10,
                    }}
                  >
                    Bạn chưa đăng nhập
                  </div>
                )}
              </UserNoLogin>
            )}
          </Col>

          {/* Shopping cart (nếu không bị ẩn) */}
          {!isHiddenShoppingCard && (
            <Col>
              <CartIcon
                count={cartItems.length}
                onClick={handleToOrder}
                isAuthenticated={isAuthenticated}
              />
            </Col>
          )}
        </WrapperHeader>
      </div>
    </Loading>
  );
};

export default HeaderComponent;

const UserNoLogin = styled.div`
  &:hover {
    text-decoration: underline;
    color: #92c6ff;
  }
`;

const CartIconStyled = styled(ShoppingCartOutlined)`
  font-size: 25px;
  color: black;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 50%;

  &:hover {
    text-decoration: underline;
    background-color: #92c6ff;
  }
`;

const CartStyledHover = styled.div`
  position: relative;
  display: inline-block;
`;
