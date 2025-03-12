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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
    setIsUserLoaded(true);
  }, [dispatch]);

  useEffect(() => {
    if (isUserLoaded) {
      if (user?.accessToken) {
        startTokenRefresh();
      } else {
        stopTokenRefresh();
      }
    }
  }, [user, isUserLoaded]);

  return (
    <AppContainer>
      <Router>
        <ScrollToTop />
        <MainContent>
          <Routes>
            {routes.map((route) => {
              const Page = route.page;
              const ischeckAuth = !route.isPrivate || user.isAdmin; // Kiểm tra quyền admin
              const LayoutComponent = route.isShowHeader
                ? Layout
                : React.Fragment;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    ischeckAuth ? (
                      <LayoutComponent>
                        <Page />
                      </LayoutComponent>
                    ) : (
                      <Navigate to="/home" /> // Chuyển hướng nếu không có quyền
                    )
                  }
                />
              );
            })}
          </Routes>
        </MainContent>
        {/* <FooterComponent /> */}
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
