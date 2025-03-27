import { useLocation, Link } from "react-router-dom";
import styled from "styled-components";

const categoryMapping = {
  "quan-nam": "Quần nam",
  "ao-nam": "Áo nam",
  "dong-ho": "Đồng hồ",
  "ao-nu": "Áo nữ",
  "quan-nu": "Quần nữ",
  "tui-xach": "Túi xách",
  "trang-suc": "Trang sức",
  vi: "Ví",
};

const BreadcrumbWrapper = ({ breadcrumb }) => {
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  let dynamicBreadcrumbs = [{ path: "/home", name: "Trang chủ" }];

  if (pathSegments[0] === "product-type") {
    const type = decodeURIComponent(pathSegments[1]); // Decode đúng cách
    const formattedType = categoryMapping[type] || type.replace(/-/g, " ");
    dynamicBreadcrumbs.push({
      path: `/product-type/${encodeURIComponent(type)}`,
      name: formattedType,
    });
  }

  const breadcrumbs =
    breadcrumb || location.state?.breadcrumb || dynamicBreadcrumbs;

  return (
    <BreadcrumbContainer>
      {breadcrumbs.map(({ path, name }, index) => {
        const isActive = path === location.pathname;
        return (
          <span key={path} className={isActive ? "active" : "inactive"}>
            {isActive ? (
              <span className="current">{name}</span>
            ) : (
              <Link to={path}>{name}</Link>
            )}
            {index < breadcrumbs.length - 1 && " > "}
          </span>
        );
      })}
    </BreadcrumbContainer>
  );
};

export default BreadcrumbWrapper;

const BreadcrumbContainer = styled.nav`
  font-size: 16px;
  margin: 0 20px;
  margin-bottom: 10px;

  span {
    display: inline;
  }

  a {
    text-decoration: none;
    color: rgb(77, 71, 71);
    font-size: 15px;
    transition: opacity 0.3s ease;
  }

  .inactive a {
    opacity: 0.5;
  }

  .active .current {
    font-weight: bold;
    text-decoration: underline;
    font-style: italic;
    color: black;
    cursor: default;
  }

  a:hover {
    text-decoration: underline;
    opacity: 0.8;
  }

  .active a:hover {
    text-decoration: none;
  }
`;
