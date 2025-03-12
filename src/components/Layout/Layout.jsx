import { useLocation } from "react-router-dom";
import { routes } from "../../routes/index";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import FooterComponent from "../../components/FooterComponent/FooterComponent";
import styled from "styled-components";

const Layout = ({ children }) => {
  const location = useLocation();

  // Kiểm tra route hiện tại có isShowHeader = true không
  const currentRoute = routes.find((route) =>
    location.pathname.startsWith(route.path)
  );
  const shouldShowHeader = currentRoute ? currentRoute.isShowHeader : true;
  const shouldShowFooter = currentRoute ? currentRoute.isShowFooter : true;

  return (
    <>
      {shouldShowHeader && <HeaderComponent />}
      <LayoutContainer>{children}</LayoutContainer>
      {shouldShowFooter && <FooterComponent />}
    </>
  );
};

export default Layout;

// Styled Components
const LayoutContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0px;
  min-height: 100vh;
  border: solid 2px red;
`;
