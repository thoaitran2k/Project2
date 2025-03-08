import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { routes } from "./routes";
import HeaderComponent from "./components/HeaderComponent/HeaderComponent";
import Layout from "./components/Layout/Layout";
import FooterComponent from "./components/FooterComponent/FooterComponent";
import styled from "styled-components";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { setUser } from "./redux/slices/userSlice";
import { startTokenRefresh, stopTokenRefresh } from "./utils/TokenManager";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // ✅ Load user từ localStorage trước khi render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
    setIsUserLoaded(true); // ✅ Đánh dấu user đã được load
  }, [dispatch]);

  // ✅ Chỉ chạy startTokenRefresh nếu user đã load
  useEffect(() => {
    if (isUserLoaded) {
      if (user?.accessToken) {
        startTokenRefresh();
      } else {
        stopTokenRefresh();
      }
    }
  }, [user, isUserLoaded]);

  const fetchAPI = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL_BACKEND}/product/get-all`
      );
      return res.data;
    } catch (error) {
      console.error("Fetch API error:", error);
      throw error;
    }
  };

  // ✅ Chỉ gọi API nếu user đã load & đã đăng nhập
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAPI,
    enabled: isUserLoaded && user.isAuthenticated,
  });

  if (!isUserLoaded) return <p>Loading user...</p>;
  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <AppContainer>
      <Router>
        <ScrollToTop />
        <HeaderComponent />
        <MainContent>
          <Routes>
            {routes.map((route) => {
              const Page = route.page;
              const LayoutComponent = route.isShowHeader
                ? Layout
                : React.Fragment;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <LayoutComponent>
                      <Page />
                    </LayoutComponent>
                  }
                />
              );
            })}
          </Routes>
        </MainContent>
        <FooterComponent />
      </Router>
    </AppContainer>
  );
}

// Cuộn lên đầu khi đổi trang
const ScrollToTop = () => {
  const location = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
};

export default App;

// CSS
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(to right, rgb(165, 152, 152), rgb(201, 174, 174));
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 20px;
`;
