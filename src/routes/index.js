import HomePage from "../pages/HomePage/HomePage";
import OrderPage from "../pages/OrderPage/OrderPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import ProductDetailsPage from "../pages/ProductDetailsPage/ProductDetailsPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SearchPage from "../pages/SearchPage/SearchPage";

export const routes = [
  // {
  //   path: "/",
  //   page: HomePage,
  //   isShowHeader: true,
  // },
  {
    path: "/home",
    page: HomePage,
    isShowHeader: true,
  },
  {
    path: "/order",
    page: OrderPage,
    isShowHeader: true,
  },
  {
    path: "/products",
    page: ProductsPage,
    isShowHeader: true,
  },
  {
    path: "/product-details",
    page: ProductDetailsPage,
    isShowHeader: true,
  },
  {
    path: "/sign-in",
    page: SignInPage,
    isShowHeader: false,
  },
  {
    path: "/search",
    page: SearchPage,
    isShowHeader: true,
  },
  {
    path: "*",
    page: NotFoundPage,
  },
];
