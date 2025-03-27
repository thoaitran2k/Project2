import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SideBar from "../../components/SideBar/SideBar";
import { Breadcrumb, Button } from "antd";
import styled from "styled-components";
import CardComponent from "../../components/CardComponent/CardComponent";
import { getProductType } from "../../Services/ProductService";
import BreadcrumbWrapper from "../../components/BreadcrumbWrapper/BreadcrumbWrapper";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";

// Mapping danh mục không dấu sang có dấu
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

const slugify = (str) =>
  str
    .normalize("NFD") // Chuyển thành dạng Unicode chuẩn
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .toLowerCase()
    .replace(/\s+/g, "-"); // Thay dấu cách bằng dấu `-`

const TypeProductPage = () => {
  const { type } = useParams();
  const decodedType = decodeURIComponent(type);

  const formattedType =
    Object.entries(categoryMapping).find(([slug]) => slug === type)?.[1] ||
    type.replace(/-/g, " "); // Nếu không có trong mapping thì giữ nguyên

  const [limit, setLimit] = useState(8);

  // Dùng useQuery để lấy tất cả sản phẩm
  const { data, isLoading } = useQuery({
    queryKey: ["products", formattedType],
    queryFn: () => getProductType({ type: formattedType }),
  });

  // Lọc sản phẩm theo `type`
  const filteredProducts = data?.data
    ? data.data.filter((product) => product.type === formattedType)
    : [];

  // Lấy danh sách sản phẩm theo limit
  const displayedProducts = data?.data ? data.data.slice(0, limit) : [];

  const totalProducts = data?.data?.length || 0;

  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { path: "/home", name: "Trang chủ" },
    { path: `/product-type/${type}`, name: formattedType },
  ];

  return (
    <>
      <br />
      <BreadcrumbWrapper breadcrumb={breadcrumbItems} />
      <div style={{ minHeight: "100vh" }}>
        <PageLayout>
          <SideBarContainer>
            <SideBar hideCategories={true} />
          </SideBarContainer>

          <ProductContainer>
            {isLoading ? (
              <p>Đang tải...</p>
            ) : (
              <CardComponent
                products={displayedProducts.map((product) => ({
                  ...product,
                  link: (
                    <Link
                      to={`/product-details/${product.id}`}
                      state={{
                        breadcrumb: [
                          { path: "/home", name: "Trang chủ" },
                          {
                            path: `/product-type/${type}`,
                            name: formattedType,
                          },
                          {
                            path: `/product-details/${product.id}`,
                            name: product.name,
                          },
                        ],
                        fromTypePage: true, // 🛠️ Đánh dấu là vào từ trang loại sản phẩm
                      }}
                    >
                      <h3>{product.name}</h3>
                    </Link>
                  ),
                }))}
              />
            )}

            {/* Chỉ hiện nút Xem thêm nếu có nhiều hơn `limit` sản phẩm */}
            {totalProducts > limit ? (
              <WrapperButtonContainer>
                <WrapperButtonMore
                  style={{ marginTop: 50 }}
                  type="default"
                  onClick={() => setLimit((prev) => prev + 8)}
                >
                  Xem thêm
                </WrapperButtonMore>
              </WrapperButtonContainer>
            ) : (
              <div style={{ height: "5vh" }}></div>
            )}
          </ProductContainer>
        </PageLayout>
      </div>
    </>
  );
};

export default TypeProductPage;

// Styled Components

const PageLayout = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 100px;
  max-width: 1900px;
  margin: 0 auto;
  padding: 20px;
`;

const SideBarContainer = styled.div`
  width: 250px;
  flex-shrink: 0;
`;

const ProductContainer = styled.div`
  flex: 1;
`;

const WrapperButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 50px;
  text-align: center;
`;

const WrapperButtonMore = styled(Button)`
  border: 1px solid rgb(11, 116, 229);
  color: rgb(11, 116, 229);
  width: 240px;
  height: 38px;
  font-weight: 500;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: rgb(18, 96, 190) !important;
    span {
      color: #fff;
    }
  }
`;
