import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Card,
  Divider,
  Button,
  Tag,
  Checkbox,
  message,
  Empty,
  Modal,
} from "antd";
import AddressModal from "./AddressModal";
import {
  clearCart,
  removeFromCart,
  toggleAllCartItemsSelected,
  toggleCartItemSelected,
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
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

const UnauthenticatedCart = () => {
  const navigate = useNavigate();

  return (
    <EmptyContainer>
      <Empty
        image={
          <ShoppingCartOutlined style={{ fontSize: 64, color: "#1890ff" }} />
        }
        description={
          <div>
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              Vui lòng đăng nhập để xem giỏ hàng
            </p>
            <Button
              type="primary"
              onClick={() =>
                navigate("/sign-in", { state: { from: "/order" } })
              }
            >
              Đăng nhập
            </Button>
          </div>
        }
      />
    </EmptyContainer>
  );
};

const OrderComponent = () => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const user = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Set default address
  const [selectedAddress, setSelectedAddress] = useState(() => {
    if (!user.address || user.address.length === 0) return null;
    return user.address.find((addr) => addr.isDefault) || user.address[0];
  });

  // Selected products
  const selectedProducts = cartItems
    .filter((item) => item.selected)
    .map((item) => item.id);

  const isAllChecked =
    cartItems.length > 0 && cartItems.every((item) => item.selected);

  // Handle quantity changes
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

  // Sync cart with server
  useEffect(() => {
    if (user?._id) {
      dispatch(updateCartOnServer());
    }
  }, [cartItems, dispatch, user]);

  // Handle remove items
  const showDeleteModal = (itemId = null) => {
    setItemToDelete(itemId);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete === null) {
      // Delete all selected items
      if (isAllChecked) {
        dispatch(clearCart());
        dispatch(updateCartOnServer({ forceUpdateEmptyCart: true }));
      } else {
        selectedProducts.forEach((itemId) => {
          dispatch(removeFromCart(itemId));
          dispatch(updateCartOnServer({ forceUpdateEmptyCart: true }));
        });
      }
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } else {
      // Delete single item
      dispatch(removeFromCart(itemToDelete));
      dispatch(updateCartOnServer({ forceUpdateEmptyCart: true }));
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    }
    setIsDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const hanleRemoveAllCartItems = () => {
    if (selectedProducts.length === 0) {
      message.warning("Bạn chưa chọn sản phẩm nào!");
      return;
    }
    showDeleteModal();
  };

  // Address handling
  const handleChangeAddress = () => setIsOpenModal(true);
  const handleSelectAddress = (address) => setSelectedAddress(address);

  // Checkbox handlers
  const handleCheckAll = (e) => {
    dispatch(toggleAllCartItemsSelected(e.target.checked));
  };

  const handleProductCheck = (checkedValues) => {
    const allIds = cartItems.map((item) => item.id);
    allIds.forEach((id) => {
      const shouldBeSelected = checkedValues.includes(id);
      const item = cartItems.find((item) => item.id === id);
      if (item && item.selected !== shouldBeSelected) {
        dispatch(toggleCartItemSelected(id));
      }
    });
  };

  // Checkout handler
  const handleCheckout = () => {
    const selectedItems = cartItems.filter((item) =>
      selectedProducts.includes(item.id)
    );

    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    if (!selectedAddress) {
      message.warning("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    navigate("/checkout", {
      state: {
        selectedItems,
        total: calculateSelectedTotal(),
        discount: calculateDiscounts(),
        selectedAddress,
      },
    });
  };

  // Calculation functions
  const calculateSelectedTotal = () => {
    return cartItems
      .filter((item) => selectedProducts.includes(item.id))
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const calculateDiscounts = () => {
    return cartItems
      .filter((item) => selectedProducts.includes(item.id))
      .reduce((total, item) => {
        const itemDiscount = item.product.discount || 0;
        const discountPerItem = (item.product.price * itemDiscount) / 100;
        return total + discountPerItem * item.quantity;
      }, 0);
  };

  const calculateTotal = () => {
    return calculateSelectedTotal() - calculateDiscounts();
  };

  if (!isAuthenticated) {
    return <UnauthenticatedCart />;
  }

  const sortedCartItems = [...cartItems].sort((a, b) => {
    return new Date(b.addedAt) - new Date(a.addedAt);
  });

  return (
    <OrderContainer>
      <LeftColumn>
        <SectionTitle>
          <ShoppingCartOutlined /> GIỎ HÀNG ({cartItems.length})
        </SectionTitle>

        <CartSection>
          <GridHeader>
            <Checkbox onChange={handleCheckAll} checked={isAllChecked}>
              <strong>Tất cả ({cartItems.length} sản phẩm)</strong>
            </Checkbox>
            <HeaderPrice>Đơn giá</HeaderPrice>
            <HeaderQuantity>Số lượng</HeaderQuantity>
            <HeaderTotal>Thành tiền</HeaderTotal>
            <HeaderAction>
              <DeleteOutlined
                onClick={hanleRemoveAllCartItems}
                style={{
                  color: selectedProducts.length > 0 ? "#ff4d4f" : "#d9d9d9",
                }}
              />
            </HeaderAction>
          </GridHeader>

          {cartItems.length === 0 ? (
            <EmptyCartMessage>
              <Empty
                description="Giỏ hàng của bạn đang trống"
                image={
                  <ShoppingCartOutlined
                    style={{ fontSize: 48, color: "#ccc" }}
                  />
                }
              />
              <Button type="primary" onClick={() => navigate("/home")}>
                Tiếp tục mua sắm
              </Button>
            </EmptyCartMessage>
          ) : (
            <Checkbox.Group
              value={selectedProducts}
              onChange={handleProductCheck}
            >
              {sortedCartItems.map((item) => (
                <GridRow key={item.id}>
                  <ProductCell>
                    <Checkbox
                      value={item.id}
                      checked={item.selected || false}
                    />
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
                        {item.color && (
                          <DetailItem>Màu: {item.color}</DetailItem>
                        )}
                        {item.size && (
                          <DetailItem>Size: {item.size}</DetailItem>
                        )}
                        {item.diameter && (
                          <DetailItem>Đường kính: {item.diameter}</DetailItem>
                        )}
                      </ProductDetails>
                    </ProductInfo>
                  </ProductCell>

                  <PriceCell>
                    {item.product.discount > 0 ? (
                      <>
                        <OriginalPrice hasDiscount>
                          {item.product.price.toLocaleString()}₫
                        </OriginalPrice>
                        <DiscountPrice>
                          {(
                            item.product.price *
                            (1 - item.product.discount / 100)
                          ).toLocaleString()}
                          ₫
                        </DiscountPrice>
                      </>
                    ) : (
                      <OriginalPrice>
                        {item.product.price.toLocaleString()}₫
                      </OriginalPrice>
                    )}
                  </PriceCell>

                  <QuantityCell>
                    <QuantityControl>
                      <QuantityButton
                        onClick={() => handleDecreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusOutlined />
                      </QuantityButton>
                      <QuantityValue>{item.quantity}</QuantityValue>
                      <QuantityButton
                        onClick={() => handleIncreaseQuantity(item.id)}
                      >
                        <PlusOutlined />
                      </QuantityButton>
                    </QuantityControl>
                  </QuantityCell>

                  <TotalCell>
                    <FinalPrice>
                      {(
                        (item.product.discount > 0
                          ? item.product.price *
                            (1 - item.product.discount / 100)
                          : item.product.price) * item.quantity
                      ).toLocaleString()}
                      ₫
                    </FinalPrice>
                    {item.product.discount > 0 && (
                      <DiscountBadge>-{item.product.discount}%</DiscountBadge>
                    )}
                  </TotalCell>

                  <ActionCell>
                    <DeleteButton onClick={() => showDeleteModal(item.id)} />
                  </ActionCell>
                </GridRow>
              ))}
            </Checkbox.Group>
          )}
        </CartSection>

        <PromotionSection>
          <PromotionHeader>
            <TagOutlined /> Mã giảm giá
            <RightOutlined />
          </PromotionHeader>
          <PromotionTag>
            <span style={{ marginRight: 8 }}>🚚</span>
            Freeship 10k đơn từ 45k, Freeship 25k đơn từ 100k
          </PromotionTag>
        </PromotionSection>
      </LeftColumn>

      <RightColumn>
        <br />
        <br />
        <br />
        <SummarySection>
          <SectionHeader>
            <EnvironmentOutlined /> ĐỊA CHỈ GIAO HÀNG
          </SectionHeader>
          <AddressCard>
            <AddressHeader>
              <strong>
                {selectedAddress?.name || "Chưa có tên người nhận hàng"}
              </strong>
              <ChangeAddressButton onClick={handleChangeAddress}>
                Thay đổi
              </ChangeAddressButton>
            </AddressHeader>
            <AddressDetail>
              {selectedAddress?.phoneDelivery || "Chưa có số điện thoại"}
            </AddressDetail>
            <AddressDetail>
              {selectedAddress?.address || "Chưa có địa chỉ"}
            </AddressDetail>
          </AddressCard>

          <Divider style={{ margin: "16px 0", borderColor: "#f0f0f0" }} />

          <SectionHeader>THANH TOÁN</SectionHeader>
          <PriceSummary>
            <PriceRow>
              <span>Tạm tính</span>
              <span>{calculateSelectedTotal().toLocaleString()}₫</span>
            </PriceRow>
            <PriceRow>
              <span>Giảm giá</span>
              <span>-{calculateDiscounts().toLocaleString()}₫</span>
            </PriceRow>
            <Divider style={{ margin: "12px 0", borderColor: "#f0f0f0" }} />
            <TotalPriceRow>
              <span>Tổng cộng</span>
              <TotalPrice>{calculateTotal().toLocaleString()}₫</TotalPrice>
            </TotalPriceRow>
            <SavingsNote>
              Bạn đã tiết kiệm {calculateDiscounts().toLocaleString()}₫
            </SavingsNote>
            <VATNote>(Đã bao gồm VAT nếu có)</VATNote>
          </PriceSummary>

          <CheckoutButton
            type="primary"
            size="large"
            disabled={selectedProducts.length === 0 || !selectedAddress}
            onClick={handleCheckout}
            block
          >
            ĐẶT HÀNG ({selectedProducts.length})
          </CheckoutButton>
        </SummarySection>
      </RightColumn>

      <AddressModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSelect={handleSelectAddress}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa sản phẩm"
        visible={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          {itemToDelete
            ? "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
            : "Bạn có chắc chắn muốn xóa tất cả sản phẩm đã chọn khỏi giỏ hàng?"}
        </p>
      </Modal>
    </OrderContainer>
  );
};

export default OrderComponent;

// Styled components (remain the same as before)
const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
`;

const OrderContainer = styled.div`
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

  @media (max-width: 768px) {
    flex-direction: column;
  }
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

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
`;

const CartSection = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  overflow: hidden;

  .ant-card-body {
    padding: 0;
  }
`;

const GridHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(190px, 2fr) 1fr 1fr 1fr 40px;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: minmax(277px, 2fr) 1fr 1fr 1fr 40px;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fafafa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
`;

const ProductInfo = styled.div`
  min-width: 0;
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #333;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DetailItem = styled.span`
  font-size: 12px;
  color: #666;
`;

const PriceCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: ${(props) => (props.hasDiscount ? "#999" : "#333")};
  text-decoration: ${(props) => (props.hasDiscount ? "line-through" : "none")};
`;

const DiscountPrice = styled.span`
  font-size: 14px;
  color: #ff4d4f;
  font-weight: 500;
`;

const QuantityCell = styled.div`
  display: flex;
  justify-content: center;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  width: fit-content;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #1890ff;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    background: #fafafa;
  }
`;

const QuantityValue = styled.span`
  width: 36px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-left: 1px solid #d9d9d9;
  border-right: 1px solid #d9d9d9;
`;

const TotalCell = styled.div`
  position: relative;
  text-align: right;
  padding-right: 8px;
`;

const FinalPrice = styled.div`
  font-weight: 500;
  color: #ff4d4f;
  font-size: 14px;
`;

const DiscountBadge = styled.span`
  position: absolute;
  top: -16px;
  right: 0;
  font-size: 11px;
  background: #ff4d4f;
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
`;

const ActionCell = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const DeleteButton = styled(DeleteOutlined)`
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 16px;

  &:hover {
    color: #ff4d4f;
  }
`;

const EmptyCartMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 16px;
`;

const PromotionSection = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
`;

const PromotionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1890ff;
  cursor: pointer;
  font-weight: 500;
  padding: 8px 0;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

const PromotionTag = styled.div`
  background-color: #f6f6f6;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  margin-top: 8px;
  color: #666;
`;

const SummarySection = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  position: sticky;
  top: 20px;
`;

const SectionHeader = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddressCard = styled.div`
  background: #fafafa;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
`;

const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ChangeAddressButton = styled.button`
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 13px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const AddressDetail = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.5;
`;

const PriceSummary = styled.div`
  margin-bottom: 16px;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
`;

const TotalPriceRow = styled(PriceRow)`
  margin-top: 12px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const SavingsNote = styled.div`
  font-size: 12px;
  color: #ff4d4f;
  text-align: right;
  margin-top: 4px;
`;

const VATNote = styled.div`
  font-size: 11px;
  color: #999;
  text-align: right;
  margin-top: 4px;
`;

const CheckoutButton = styled(Button)`
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  background: #ff4d4f;
  border: none;
  margin-top: 16px;
  transition: all 0.2s;

  &:hover {
    background: #ff7875;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #f5f5f5;
    color: rgba(0, 0, 0, 0.25);
    transform: none;
  }
`;

const HeaderPrice = styled.div`
  text-align: center;
`;

const HeaderQuantity = styled.div`
  text-align: center;
`;

const HeaderTotal = styled.div`
  text-align: center;
`;

const HeaderAction = styled.div`
  text-align: center;
`;

const TotalPrice = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
`;
