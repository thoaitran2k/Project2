import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { routes } from "./routes";
import { setUser } from "./redux/slices/userSlice";
import { startTokenRefresh, stopTokenRefresh } from "./utils/TokenManager";
import { addToCart, updateCartOnServer } from "../src/redux/slices/cartSlice";
import styled from "styled-components";
import ProductDetailsComponent from "./components/ProductDetailsComponent/ProductDetailsComponent";
import PageTransitionEffect from "./Effect/PageTransitionEffect";
import Layout from "./components/Layout/Layout";
import { AnimatePresence, motion } from "framer-motion";
import { SearchProvider, useSearch } from "./components/Layout/SearchContext";
import SearchPage from "./pages/SearchPage/SearchPage";
import SearchOverlay from "./components/SearchComponent/SearchOverlay";
import SearchComponent from "./components/SearchComponent/SearchComponent";
import useAutoLogoutWhenTokenMissing from "./hooks/useAutoLogoutWhenTokenMissing";
import FooterComponent from "./components/FooterComponent/FooterComponent";
import ChatbotComponent from "./components/Chatbot/ChatbotComponent";
import { fetchUserLikes } from "./redux/slices/likeSlice";
// import { SearchProvider } from "./components/Layout/SearchContext";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigatingFromApp, setIsNavigatingFromApp] = useState(false); // Để theo dõi điều hướng từ trong ứng dụng
  const [targetPath, setTargetPath] = useState(null);
  const user = useSelector((state) => state.user);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [applySlideDownEffect, setApplySlideDownEffect] = useState(false);
  const { isSearchOpen } = useSearch();

  // Kiểm tra nếu điều hướng từ trong ứng dụng (không phải từ Back của trình duyệt)
  useEffect(() => {
    const handlePopState = () => {
      setIsNavigatingFromApp(false); // Nếu là sự kiện popState (nút back), không cho hiệu ứng
    };

    // Lắng nghe sự kiện popstate (Back button)
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Điều hướng qua ứng dụng
  const handleNavigate = (path) => {
    setTargetPath(path); // Bắt đầu hiệu ứng
    setIsNavigatingFromApp(true); // Đánh dấu là đang điều hướng từ ứng dụng
  };

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (storedUser) {
  //     dispatch(setUser(JSON.parse(storedUser)));
  //   }
  //   setIsUserLoaded(true);
  // }, [dispatch]);

  useEffect(() => {
    if (user.isAuthenticated) {
      const tempCartItem = localStorage.getItem("tempCartItem");
      if (tempCartItem) {
        const item = JSON.parse(tempCartItem);
        dispatch(addToCart(item));
        dispatch(updateCartOnServer());
        localStorage.removeItem("tempCartItem");
      }
    }
  }, [user.isAuthenticated, dispatch]);

  useEffect(() => {
    if (isUserLoaded) {
      if (user?.accessToken) {
        startTokenRefresh();
      } else {
        stopTokenRefresh();
      }
    }
  }, [user, isUserLoaded]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserLikes());
    }
  }, [user, dispatch]);

  return (
    <AppContainer>
      <MainContent>
        <PageTransitionEffect
          targetPath={targetPath}
          onComplete={() => {
            navigate(targetPath);
            setTargetPath(null); // Reset lại để không re-trigger
            setIsNavigatingFromApp(false);
          }}
        />

        <Routes>
          {routes.map((route) => {
            const Page = route.page;
            const ischeckAuth = !route.isPrivate || user.isAdmin;
            const LayoutComponent = route.isShowHeader
              ? Layout
              : React.Fragment;

            const showChatbot = route.isShowChatbot;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  ischeckAuth ? (
                    <LayoutComponent>
                      <>
                        <Page />
                        {showChatbot && <ChatbotComponent />}
                      </>
                    </LayoutComponent>
                  ) : (
                    <Navigate to="/home" />
                  )
                }
              />
            );
          })}
          <Route
            path="/product-details/:id"
            element={<ProductDetailsComponent />}
          />
        </Routes>
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "white",
                zIndex: 1000,
                overflowY: "auto",
              }}
            >
              <SearchOverlay />
            </motion.div>
          )}
        </AnimatePresence>
      </MainContent>
      {/* <FooterComponent /> */}
    </AppContainer>
  );
}

// Cuộn lên đầu khi đổi trang
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
};

export default () => (
  <Router>
    {" "}
    {/* Đảm bảo Router bao bọc App component */}
    <App />
  </Router>
);

// CSS
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(to right, #dddcdb, #f7f6f5);
`;

const MainContent = styled.main`
  flex: 1;
  // padding-top: 20px;
`;
