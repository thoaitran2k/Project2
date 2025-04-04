import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Card, Divider, Button, Tag, Checkbox, message } from "antd";
import AddressModal from "./AddressModal";

import {
  clearCart,
  removeFromCart,
  updateCartItemAmount,
  updateCartOnServer,
} from "../../redux/slices/cartSlice";
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
import { useNavigate } from "react-router";

const OrderComponent = () => {
  //const [quantities, setQuantities] = useState({});
  const [quantityPay, setQuantityPay] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const user = useSelector((state) => state.user);
  const defaultAddress = user.address.find((addr) => addr.isDefault);
  const [selectedAddress, setSelectedAddress] = useState(() => {
    if (!user.address || user.address.length === 0) return null;
    return user.address.find((addr) => addr.isDefault) || user.address[0];
  });
  const { isAuthenticated, address, _id } = useSelector((state) => state.user);
  const { cartItems, cartCount } = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAllChecked = selectedProducts.length === cartItems.length;

  console.log("cartItems", cartItems);

  const handleIncreaseQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      dispatch(
        updateCartItemAmount({
          itemId,
          newAmount: item.quantity + 1,
        })
      );
    }
  };

  useEffect(() => {
    if (user?._id) {
      dispatch(updateCartOnServer());
    }
  }, [cartItems, dispatch, user]);

  const handleDecreaseQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item && item.quantity > 1) {
      dispatch(
        updateCartItemAmount({
          itemId,
          newAmount: item.quantity - 1,
        })
      );
    }
  };

  const hanleRemoveAllCartItems = () => {
    if (selectedProducts.length === 0) {
      message.warning("Bạn chưa chọn sản phẩm nào!");
      return;
    }

    if (isAllChecked) {
      dispatch(clearCart()); // Xóa toàn bộ giỏ hàng nếu đã chọn tất cả
    } else {
      selectedProducts.forEach((itemId) => {
        dispatch(removeFromCart(itemId)); // Xóa từng sản phẩm đã tích
      });

      setSelectedProducts([]); // Reset danh sách chọn
    }
  };

  const handleChangeAddress = () => {
    console.log("Thay đổi địa chỉ");
    setIsOpenModal(true);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const handleCheckAll = (e) => {
    setSelectedProducts(
      e.target.checked ? cartItems.map((item) => item.id) : []
    );
  };

  const handleProductCheck = (checkedValues) => {
    setSelectedProducts(checkedValues);
  };

  console.log("selectedAddress", selectedAddress);

  const handleCheckout = () => {
    const selectedItems = cartItems.filter((item) =>
      selectedProducts.includes(item.id)
    );

    navigate("/checkout", {
      state: {
        selectedItems,
        total: calculateSelectedTotal(),
        discount: calculateDiscounts(),
        selectedAddress,
      },
    });
  };

  // const increaseQuantity = () =>
  //   setQuantityPay((prev) => Math.min(prev + 1, 10));
  // const decreaseQuantity = () =>
  //   setQuantityPay((prev) => Math.max(prev - 1, 1));

  // const getQuantity = (id) => quantities[id] || 1;

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <ShoppingCartOutlined style={{ fontSize: "48px", color: "#ccc" }} />
        <p>Vui lòng đăng nhập để xem giỏ hàng</p>
        <Button type="primary" onClick={() => navigate("/sign-in")}>
          Đăng nhập
        </Button>
      </div>
    );
  }

  //Hàm tính tổng tiền sản phẩm
  const calculateSelectedTotal = () => {
    return cartItems
      .filter((item) => selectedProducts.includes(item.id))
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  //Hàm tính giảm giá
  const calculateDiscounts = () => {
    return cartItems
      .filter((item) => selectedProducts.includes(item.id))
      .reduce((total, item) => {
        const itemDiscount = item.product.discount || 0; // % discount
        const discountPerItem = (item.product.price * itemDiscount) / 100;
        return total + discountPerItem * item.quantity;
      }, 0);
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => selectedProducts.includes(item.id))
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscounts();
    return subtotal - discount;
  };

  const logSelectedItems = () => {
    const selectedItems = cartItems.filter((item) =>
      selectedProducts.includes(item.id)
    );

    //console.log("Các sản phẩm đã chọn:", selectedItems);

    selectedItems.forEach((item, index) => {
      const isWatch = item.product.type === "Đồng hồ";
      const actualSize = isWatch ? item.variant?.diameter : item.size;

      console.log(`Sản phẩm ${index + 1}:`, {
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.color,
        size: actualSize,
        discount: item.product.discount,
        total: item.product.price * item.quantity,
      });
    });

    const totalPrice = selectedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    //console.log("Tổng tiền:", totalPrice);
  };

  useEffect(() => {
    if (selectedProducts.length > 0) {
      logSelectedItems();
    }
  }, [selectedProducts]);

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
              Tất cả ({cartItems.length} sản phẩm)
            </Checkbox>
            <HeaderPrice>Đơn giá</HeaderPrice>
            <HeaderQuantity>Số lượng</HeaderQuantity>
            <HeaderTotal>Thành tiền</HeaderTotal>
            <HeaderDelete style={{ textAlign: "right" }}>
              <DeleteOutlined onClick={hanleRemoveAllCartItems} />
            </HeaderDelete>
          </GridHeader>
          {/* Product list */}

          <Checkbox.Group
            value={selectedProducts}
            onChange={handleProductCheck}
          >
            {cartItems.map((item) => {
              return (
                <GridRow key={item.id}>
                  <ProductCell>
                    <Checkbox value={item.id} />
                    <ProductImage
                      src={
                        typeof item.product.image === "string"
                          ? item.product.image
                          : item.product.image?.[0]?.url ||
                            "https://via.placeholder.com/60"
                      }
                      alt={item.product.name}
                    />
                    <ProductInfo>
                      <ProductName>{item.product.name}</ProductName>
                      <ProductDetails>
                        {item.color && <div>Màu: {item.color}</div>}
                        {item.size && <div>Size: {item.size}</div>}
                        {item.diameter && (
                          <div>Đường kính: {item.diameter}</div>
                        )}
                      </ProductDetails>
                    </ProductInfo>
                  </ProductCell>

                  <PriceCell>{item.product.price.toLocaleString()}₫</PriceCell>

                  <QuantityCell>
                    <QuantityContainer>
                      <MinusOutlined
                        onClick={() => handleDecreaseQuantity(item.id)}
                        className="quantity-btn"
                      />
                      <span className="quantity-value">{item.quantity}</span>
                      <PlusOutlined
                        onClick={() => handleIncreaseQuantity(item.id)}
                        className="quantity-btn"
                      />
                    </QuantityContainer>
                  </QuantityCell>

                  <TotalCell>
                    {(item.product.price * item.quantity).toLocaleString()}₫
                  </TotalCell>

                  <DeleteCell onClick={() => dispatch(removeFromCart(item.id))}>
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
        {/* Thông tin giao hàng */}
        {user.isAuthenticated && (
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
                <strong>
                  {selectedAddress?.name || "Chưa có tên người nhận hàng"}
                </strong>
              </div>
              <div>
                {selectedAddress?.phoneDelivery || "Chưa có số điện thoại"}
              </div>
              <div>{selectedAddress?.address || "Chưa có địa chỉ"}</div>
            </AddressInfo>
          </Section>
        )}

        {/* Khu vực chọn khuyến mãi */}

        {/* Tổng kết thanh toán */}
        <Section>
          <PriceRow>
            <span>Tạm tính</span>
            <span>{calculateSelectedTotal().toLocaleString()}₫</span>
          </PriceRow>
          <PriceRow>
            <span>Thuế</span>
            <span>₫</span>
          </PriceRow>

          <PriceRow>
            <span>Giảm giá trực tiếp</span>
            <span>-{calculateDiscounts().toLocaleString()}₫</span>
          </PriceRow>

          <PriceRow>
            <span>Phí giao hàng</span>
            <span>₫</span>
          </PriceRow>

          <Divider style={{ margin: "16px 0" }} />

          <PriceRow>
            <TotalPrice>Tổng tiền thanh toán</TotalPrice>
            <TotalPrice>{calculateTotal().toLocaleString()}₫</TotalPrice>
          </PriceRow>

          <SavingsTag>Tiết kiệm 4.000.000₫</SavingsTag>

          <VATText>(Bao gồm VAT nếu có)</VATText>
        </Section>

        {/* Nút thanh toán */}
        <CheckoutButton
          type="primary"
          size="large"
          disabled={selectedProducts.length === 0}
          onClick={handleCheckout}
        >
          Mua Hàng ({selectedProducts.length})
        </CheckoutButton>
      </RightColumn>
      {/*  Modal đổi địa chỉ giao hàng */}
      <AddressModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSelect={handleSelectAddress}
      />
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
