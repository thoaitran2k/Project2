import { useLocation } from "react-router-dom";
import { routes } from "../../routes/index";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import FooterComponent from "../../components/FooterComponent/FooterComponent";
import styled from "styled-components";
import { useEffect } from "react";

const Layout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Kiểm tra route hiện tại
  const currentRoute = routes.find((route) =>
    location.pathname.startsWith(route.path)
  );
  const shouldShowHeader = currentRoute ? currentRoute.isShowHeader : true;
  const shouldShowFooter = currentRoute ? currentRoute.isShowFooter : true;

  // Xác định loại trang
  const isWidePage =
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/product-type");
  const isHomePage = location.pathname === "/home";

  return (
    <>
      {shouldShowHeader && <HeaderComponent />}
      <LayoutContainer $isWidePage={isWidePage} $isHomePage={isHomePage}>
        {children}
      </LayoutContainer>
      {shouldShowFooter && <FooterComponent />}
    </>
  );
};

export default Layout;

// Styled Components
const LayoutContainer = styled.div`
  max-width: ${({ $isWidePage, $isHomePage }) =>
    $isHomePage ? "100%" : $isWidePage ? "1900px" : "1400px"};
  margin: ${({ $isHomePage }) => ($isHomePage ? "0" : "0 auto")};
  padding: ${({ $isHomePage }) => ($isHomePage ? "0" : "0px")};
  width: ${({ $isHomePage }) => ($isHomePage ? "100%" : "auto")};
  min-height: 100vh;
  padding-top: 4vh;
  margin-bottom: 10px;
  flex: 1
    ${({ $isWidePage, $isHomePage }) =>
      $isWidePage && !$isHomePage && "margin: 0 100px;"};
`;
