import React, { useState } from "react";
import styled from "styled-components";
import { Card, Divider, Button, Tag, Checkbox } from "antd";
import AddressModal from "./AddressModal";
import {
  ShoppingCartOutlined,
  EnvironmentOutlined,
  TagOutlined,
  RightOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { hover } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

const OrderComponent = () => {
  const [quantities, setQuantities] = useState({});
  const [quantityPay, setQuantityPay] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const user = useSelector((state) => state.user);
  const defaultAddress = user.address.find((addr) => addr.isDefault);
  const [selectedAddress, setSelectedAddress] = useState(
    user.address.find((addr) => addr.isDefault) || user.address[0] || null
  );

  console.log("defaultAddress", defaultAddress);
  console.log("address", user.address);
  console.log("user", user);

  const products = [
    {
      image:
        "https://res.cloudinary.com/dxwqi77i8/image/upload/v1742565539/products/q1zxlailzgz7kpor1bdi.png",
      id: "1",
      name: "Áo sơ mi HugoBros",
      color: "Titan Sa Mạc, 256GB",
      delivery: "Giao sáng thứ 2, 31/03",
      price: 30990000,
    },
    {
      image:
        "https://res.cloudinary.com/dxwqi77i8/image/upload/v1742565539/products/q1zxlailzgz7kpor1bdi.png",
      id: "2",
      name: "Áo Thun Nam",
      color: "Titan Sa Mạc, 256GB",
      delivery: "Giao sáng thứ 2, 31/03",
      price: 30990000,
    },
    {
      image:
        "https://res.cloudinary.com/dxwqi77i8/image/upload/v1742565539/products/q1zxlailzgz7kpor1bdi.png",
      id: "3",
      name: "Áo sơ mi Vinstar",
      color: "Titan Sa Mạc, 256GB",
      delivery: "Giao sáng thứ 2, 31/03",
      price: 30990000,
    },
    {
      image:
        "https://res.cloudinary.com/dxwqi77i8/image/upload/v1742565539/products/q1zxlailzgz7kpor1bdi.png",
      id: "4",
      name: "Vòng tay Heris",
      color: "Titan Sa Mạc, 256GB",
      delivery: "Giao sáng thứ 2, 31/03",
      price: 30990000,
    },
    {
      image:
        "https://res.cloudinary.com/dxwqi77i8/image/upload/v1742565539/products/q1zxlailzgz7kpor1bdi.png",
      id: "5",
      name: "Vòng tay Heris",
      color: "Titan Sa Mạc, 256GB",
      delivery: "Giao sáng thứ 2, 31/03",
      price: 30990000,
    },
  ];

  const isAllChecked = selectedProducts.length === products.length;

  const handleChangeAddress = () => {
    console.log("Thay đổi địa chỉ");
    setIsOpenModal(true);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const handleCheckAll = (e) => {
    setSelectedProducts(e.target.checked ? products.map((p) => p.id) : []);
  };

  const handleProductCheck = (checkedValues) => {
    setSelectedProducts(checkedValues);
  };

  const increaseQuantity = () =>
    setQuantityPay((prev) => Math.min(prev + 1, 10));
  const decreaseQuantity = () =>
    setQuantityPay((prev) => Math.max(prev - 1, 1));

  const getQuantity = (id) => quantities[id] || 1;

  return (
    <OrderContainer>
      <LeftColumn>
        {/* Header Giỏ hàng */}
        <SectionTitle>
          <ShoppingCartOutlined /> GIỎ HÀNG
        </SectionTitle>

        <Section>
          {/* Header row - Fixed column widths */}
          <GridHeader>
            <Checkbox onChange={handleCheckAll} checked={isAllChecked}>
              Tất cả ({products.length} sản phẩm)
            </Checkbox>
            <HeaderPrice>Đơn giá</HeaderPrice>
            <HeaderQuantity>Số lượng</HeaderQuantity>
            <HeaderTotal>Thành tiền</HeaderTotal>
            <HeaderDelete style={{ textAlign: "right" }}>
              <DeleteOutlined />
            </HeaderDelete>
          </GridHeader>

          {/* Product list */}
          <Checkbox.Group
            value={selectedProducts}
            onChange={handleProductCheck}
          >
            {products.map((product) => {
              const quantity = getQuantity(product.id);
              return (
                <GridRow key={product.id}>
                  <ProductCell>
                    <Checkbox value={product.id} />
                    <ProductImage src={product.image} alt={product.name} />
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductDetails>
                        <div>{product.color}</div>
                        <div>{product.delivery}</div>
                      </ProductDetails>
                    </ProductInfo>
                  </ProductCell>

                  <PriceCell>{product.price.toLocaleString()}₫</PriceCell>

                  <QuantityCell>
                    <QuantityContainer>
                      <MinusOutlined
                        onClick={() => decreaseQuantity(product.id)}
                        className="quantity-btn"
                      />
                      <span className="quantity-value">{quantity}</span>
                      <PlusOutlined
                        onClick={() => increaseQuantity(product.id)}
                        className="quantity-btn"
                      />
                    </QuantityContainer>
                  </QuantityCell>

                  <TotalCell>
                    {(product.price * quantity).toLocaleString()}₫
                  </TotalCell>

                  <DeleteCell>
                    <DeleteOutlined />
                  </DeleteCell>
                </GridRow>
              );
            })}
          </Checkbox.Group>
        </Section>

        {/* Khu vực mã khuyến mãi */}
        <Section>
          <ArrowLink>
            <span>
              <TagOutlined /> Thêm mã khuyến mãi của Shop
            </span>
            <RightOutlined />
          </ArrowLink>
          <Divider style={{ margin: "12px 0" }} />
          <PromotionTag>
            <span style={{ marginRight: 4 }}>🚚</span>
            Freeship 10k đơn từ 45k, Freeship 25k đơn từ 100k
          </PromotionTag>
        </Section>
      </LeftColumn>
      <RightColumn>
        <SectionTitle>
          <br />
        </SectionTitle>
        {/* Thông tin giao hàng */}
        <Section>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4>
              <EnvironmentOutlined /> Giao tới
            </h4>
            <div
              style={{
                alignItems: "center",
                cursor: "pointer",
                color: "blue",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "red")}
              onMouseLeave={(e) => (e.target.style.color = "#1890ff")}
              onClick={handleChangeAddress}
            >
              Đổi địa chỉ
            </div>
          </div>
          <AddressInfo>
            <div>
              <strong>{selectedAddress.name}</strong>
            </div>
            <div>
              {selectedAddress.phoneDelivery || "Chưa có số điện thoại"}
            </div>
            <div>{selectedAddress.address}</div>
          </AddressInfo>
        </Section>

        {/* Khu vực chọn khuyến mãi */}

        {/* Tổng kết thanh toán */}
        <Section>
          <PriceRow>
            <span>Tổng tiền hàng</span>
            <span>34.990.000₫</span>
          </PriceRow>

          <PriceRow>
            <span>Giảm giá trực tiếp</span>
            <span>-4.000.000₫</span>
          </PriceRow>

          <Divider style={{ margin: "16px 0" }} />

          <PriceRow>
            <TotalPrice>Tổng tiền thanh toán</TotalPrice>
            <TotalPrice>30.990.000₫</TotalPrice>
          </PriceRow>

          <SavingsTag>Tiết kiệm 4.000.000₫</SavingsTag>

          <VATText>(Bao gồm VAT nếu có)</VATText>
        </Section>

        {/* Nút thanh toán */}
        <CheckoutButton type="primary" size="large">
          Mua Hàng (1)
        </CheckoutButton>
      </RightColumn>
      {/*  Modal đổi địa chỉ giao hàng */}
      <AddressModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSelect={handleSelectAddress}
      />
      ;
    </OrderContainer>
  );
};

export default OrderComponent;

// Styled components

const OrderContainer = styled.div`
  display: flex;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const GridHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 2fr) 120px 120px 120px 40px;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 2fr) 120px 120px 120px 40px;
  align-items: center;
  gap: 10px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  min-width: 900px;
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0; /* Important for text truncation */
  flex: 1;
`;

const PriceCell = styled.div`
  text-align: center;
  padding: 0 10px;
`;

const QuantityCell = styled.div`
  display: flex;
  justify-content: center;
`;

const TotalCell = styled.div`
  text-align: center;
  padding: 0 10px;
`;

const DeleteCell = styled.div`
  text-align: right;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #ff4d4f;
  }
`;

const HeaderPrice = styled.div`
  text-align: center;
  font-weight: 500;
`;

const HeaderQuantity = styled.div`
  text-align: center;
  font-weight: 500;
`;

const HeaderTotal = styled.div`
  text-align: center;
  font-weight: 500;
`;

const HeaderDelete = styled.div`
  /* Empty but maintains grid structure */
  text-align: "right";
`;

const ProductImage = styled.img`
  width: 60px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  min-width: 0; /* Allows text truncation */
`;

const ProductName = styled.div`
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Hiển thị tối đa 2 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const ProductDetails = styled.div`
  color: #666;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
`;

const LeftColumn = styled.div`
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RightColumn = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Section = styled(Card)`
  margin-bottom: 0;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  .ant-card-body {
    padding: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProductItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 40px;
  align-items: center;
  gap: 10px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const HeaderText = styled.div`
  font-weight: 500;
  text-align: center;
`;

const PriceText = styled.div`
  text-align: center;
`;

const DeleteButton = styled.div`
  text-align: right;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #ff4d4f;
  }
`;

const QuantityContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px;
  width: 70px;
  margin: 0 auto;
  user-select: none;

  .quantity-btn {
    padding: 0 8px;
    cursor: pointer;
    color: #555;
    user-select: none;
    &:hover {
      color: #1890ff;
    }
  }

  .quantity-value {
    width: 30px;
    text-align: center;
    user-select: none;
  }
`;

const PromotionTag = styled.div`
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
`;

const AddressInfo = styled.div`
  line-height: 1.6;
  font-size: 14px;
`;

const PromotionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: 14px;
`;

const TotalPrice = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
`;

const SavingsTag = styled(Tag)`
  background-color: #fff2f0;
  color: #ff4d4f;
  border-color: #ffccc7;
  margin-top: 8px;
`;

const VATText = styled.div`
  color: #999;
  font-size: 12px;
  margin-top: 8px;
`;

const CheckoutButton = styled(Button)`
  width: 100%;
  height: 48px;
  font-weight: 600;
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: white;

  &:hover {
    background-color: #ff7875;
    border-color: #ff7875;
    color: white;
  }
`;

const ArrowLink = styled.div`
  color: #1890ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;

  &:hover {
    text-decoration: underline;
  }
`;
