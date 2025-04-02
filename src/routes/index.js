import HomePage from "../pages/HomePage/HomePage";
import OrderPage from "../pages/OrderPage/OrderPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import ProductDetailsPage from "../pages/ProductDetailsPage/ProductDetailsPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SearchPage from "../pages/SearchPage/SearchPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import AdminPage from "../pages/AdminPage/AdminPage";
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage";

export const routes = [
  //PAGE
  {
    path: "/home",
    page: HomePage,
    isShowHeader: true,
    isShowFooter: true,
  },
  {
    path: "/order",
    page: OrderPage,
    isShowHeader: true,
    isShowFooter: true,
  },
  {
    path: "/products",
    page: ProductsPage,
    isShowHeader: true,
    isShowFooter: true,
  },
  {
    path: "/product-type/:type",
    page: TypeProductPage,
    isShowHeader: true,
    isShowFooter: true,
  },
  {
    path: "/product-details/:id",
    page: ProductDetailsPage,
    isShowHeader: true,
    isShowFooter: true,
  },
  {
    path: "/sign-in",
    page: SignInPage,
    isShowHeader: false,
    isShowFooter: true,
  },
  {
    path: "/search",
    page: SearchPage,
    isShowHeader: false,
    isShowFooter: false,
  },
  {
    path: "*",
    page: NotFoundPage,
    isShowFooter: true,
  },
  //COMPONENT
  {
    path: "/profile/:activePage?",
    page: ProfilePage,
    isShowHeader: true,
    isShowFooter: true,
  },
  //ADMIN
  {
    path: "/system/admin",
    page: AdminPage,
    isShowHeader: false,
    iPrivate: true,
    isShowFooter: false,
  },
];
