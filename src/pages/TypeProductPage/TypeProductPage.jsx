import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SideBar from "../../components/SideBar/SideBar";
import { Breadcrumb, Button } from "antd";
import styled from "styled-components";
import CardComponent from "../../components/CardComponent/CardComponent";
import { getProductType } from "../../Services/ProductService";

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

const TypeProductPage = () => {
  const { type } = useParams();
  const formattedType = categoryMapping[type] || type.replace(/-/g, " ");
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

  console.log("filteredProducts", filteredProducts);
  // Lấy danh sách sản phẩm theo limit
  const displayedProducts = data?.data ? data.data.slice(0, limit) : [];

  const totalProducts = data?.data?.length || 0;
  console.log("totalProducts", totalProducts);

  return (
    <>
      <br />
      <BreadcrumbWrapper>
        <Breadcrumb separator=">">
          <Breadcrumb.Item href="/home">Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>
            <u>
              <i>{formattedType}</i>
            </u>
          </Breadcrumb.Item>
        </Breadcrumb>
      </BreadcrumbWrapper>
      <div style={{ minHeight: "100vh" }}>
        <PageLayout>
          <SideBarContainer>
            <SideBar hideCategories={true} />
          </SideBarContainer>

          <ProductContainer>
            {isLoading ? (
              <p>Đang tải...</p>
            ) : (
              <CardComponent products={displayedProducts} />
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
const BreadcrumbWrapper = styled.div`
  width: 100%;
  padding: 12px 24px;
  max-width: 80vw;
`;

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
