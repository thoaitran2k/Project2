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

  // Kiểm tra route hiện tại có isShowHeader và isShowFooter không
  const currentRoute = routes.find((route) =>
    location.pathname.startsWith(route.path)
  );
  const shouldShowHeader = currentRoute ? currentRoute.isShowHeader : true;
  const shouldShowFooter = currentRoute ? currentRoute.isShowFooter : true;

  // Kiểm tra nếu là trang Products
  const isProductsPage = location.pathname.startsWith("/products");

  return (
    <>
      {shouldShowHeader && <HeaderComponent />}
      <LayoutContainer isProductsPage={isProductsPage}>
        {children}
      </LayoutContainer>
      {shouldShowFooter && <FooterComponent />}
    </>
  );
};

export default Layout;

// Styled Components
const LayoutContainer = styled.div`
  max-width: ${({ isProductsPage }) => (isProductsPage ? "1900px" : "1400px")};
  margin: 0 ${({ isProductsPage }) => (isProductsPage ? "100px" : "auto")};
  padding: 0px;
  min-height: 100vh;
  // border: solid 2px red;
  padding-top: 4vh;
`;
