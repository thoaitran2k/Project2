import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Card, Radio, Button, Input, Typography, Divider, Tag } from "antd";
import {
  CreditCardOutlined,
  WalletOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  TagOutlined,
  RightOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { message } from "antd";

import cash from "../../assets/cash.png";
import momo from "../../assets/momoicon.jpg";
import zalopay from "../../assets/zalopayicon.png";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import AddressModal from "../Order/AddressModal";

const { Title, Text } = Typography;

const CheckoutComponent = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [globalPromoCode, setGlobalPromoCode] = useState("");
  const [globalPromo, setGlobalPromo] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const user = useSelector((state) => state.user);
  const { selectedItems = [], total = 0, discount = 0 } = state || {};
  const getInitialAddress = () => {
    try {
      const savedData = JSON.parse(localStorage.getItem("checkoutData"));
      if (savedData?.selectedAddress) return savedData.selectedAddress;
    } catch (e) {
      console.error("Lỗi đọc dữ liệu checkout", e);
    }
    return (
      state?.selectedAddress ||
      user.address?.find((addr) => addr.isDefault) ||
      user.address?.[0] ||
      null
    );
  };

  // Sử dụng trong component
  const [selectedAddressOrder, setSelectedAddressOrder] = useState(null);

  const { address } = useSelector((state) => state.user);

  const addressOrder = useSelector((state) => state.user?.address);

  const [orderData, setOrderData] = useState({
    products: [],
    subtotal: 0,
    discount: 0,
    shippingFee: 0,
    total: 0,
    savings: 0,
    address: null,
  });

  const [productPromotions, setProductPromotions] = useState({});

  const applyProductPromotion = async (productId, promotionCode) => {
    const result = await checkPromotionCode(productId, promotionCode);

    if (result.error) {
      message.error(result.error);
      return;
    }

    setProductPromotions((prev) => ({
      ...prev,
      [productId]: {
        code: promotionCode,
        discount: result.discount,
        couponId: result.couponId,
      },
    }));

    // Cập nhật tổng tiền
    setOrderData((prev) => ({
      ...prev,
      discount: prev.discount + result.discount,
      total: prev.total - result.discount,
    }));

    message.success(result.message || "Áp dụng mã thành công");
  };

  const removeProductPromotion = (productId) => {
    const promotion = productPromotions[productId];
    if (!promotion) return;

    setProductPromotions((prev) => {
      const newPromotions = { ...prev };
      delete newPromotions[productId];
      return newPromotions;
    });

    // Cập nhật lại tổng tiền
    setOrderData((prev) => ({
      ...prev,
      discount: prev.discount - promotion.discount,
      total: prev.total + promotion.discount,
    }));
  };

  useEffect(() => {
    const address = getInitialAddress();
    setSelectedAddressOrder(address);

    const savedData = JSON.parse(localStorage.getItem("checkoutData")) || {};
    const items = state?.selectedItems || savedData.selectedItems || [];

    if (items.length === 0) return;

    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const discount = state?.discount || savedData.discount || 0;
    const shippingFee = subtotal > 100000 ? 0 : 15000;

    setOrderData({
      products: items,
      subtotal,
      discount,
      shippingFee,
      total: subtotal - discount + shippingFee,
      savings: discount,
      address: address
        ? {
            name: address.name,
            phone: address.phoneDelivery || address.phone,
            address: address.address,
          }
        : null,
    });
  }, [state]);

  useEffect(() => {
    if (selectedAddressOrder) {
      setOrderData((prev) => ({
        ...prev,
        address: {
          name: selectedAddressOrder.name,
          phone:
            selectedAddressOrder.phoneDelivery || selectedAddressOrder.phone,
          address: selectedAddressOrder.address,
        },
      }));

      // Cập nhật localStorage
      const currentData =
        JSON.parse(localStorage.getItem("checkoutData")) || {};
      localStorage.setItem(
        "checkoutData",
        JSON.stringify({
          ...currentData,
          selectedAddress: selectedAddressOrder,
        })
      );
    }
  }, [selectedAddressOrder]);

  const handleChangeAddress = () => {
    console.log("Thay đổi địa chỉ");
    setIsOpenModal(true);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressOrder(address);
    setIsOpenModal(false);
  };

  useEffect(() => {
    const initData = () => {
      if (state?.selectedItems) {
        const subtotal = state.selectedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        const discount = state.discount || 0;
        const shippingFee = subtotal > 100000 ? 0 : 15000;

        setOrderData({
          products: state.selectedItems,
          subtotal,
          discount,
          shippingFee,
          total: subtotal - discount + shippingFee,
          savings: discount,
          address: state.selectedAddress || {
            name: "Nguyễn Văn A",
            phone: "0987654321",
            address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
          },
        });

        // Lưu vào localStorage để tránh mất dữ liệu khi refresh
        localStorage.setItem(
          "checkoutData",
          JSON.stringify({
            selectedItems: state.selectedItems,
            selectedAddress: state.selectedAddress,
            subtotal,
            discount,
          })
        );
      } else {
        // Fallback khi truy cập trực tiếp URL
        const savedData = JSON.parse(localStorage.getItem("checkoutData"));
        console.log("savedData", savedData);
        if (savedData) {
          const subtotal = savedData.selectedItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const shippingFee = subtotal > 100000 ? 0 : 15000;

          setOrderData({
            products: savedData.selectedItems,
            subtotal,
            discount: savedData.discount || 0,
            shippingFee,
            total: subtotal - (savedData.discount || 0) + shippingFee,
            savings: savedData.discount || 0,
            address: savedData.selectedAddress || {
              name: addressOrder.name,
              phone: addressOrder.phone,
              address: addressOrder.address,
            },
          });
        }
      }
    };

    initData();
  }, [state]);

  console.log("orderData ", orderData);

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      const orderItems = orderData.products.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.product.price,
        promotion: productPromotions[item.id]?.couponId,
      }));

      const response = await axios.post("http://localhost:3002/api/orders", {
        items: orderItems,
        paymentMethod,
        address: orderData.address,
        total: orderData.total,
        discount: orderData.discount,
        couponIds: Object.values(productPromotions).map((p) => p.couponId),
      });

      navigate("/order-success", {
        state: {
          orderId: response.data.orderId,
          total: orderData.total,
        },
      });

      localStorage.removeItem("checkoutData");
    } catch (error) {
      message.error(error.response?.data?.message || "Đặt hàng thất bại");
    }
  };

  if (orderData.products.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Không có sản phẩm nào để thanh toán</h3>
        <Button type="primary" onClick={() => navigate("/order")}>
          Quay lại giỏ hàng
        </Button>
      </div>
    );
  }

  const checkPromotionCode = async (productId, code) => {
    try {
      const product = orderData.products.find((item) => item.id === productId);
      if (!product) return { error: "Sản phẩm không tồn tại" };

      const response = await axios.post(
        "http://localhost:3002/api/product/check-coupon",
        {
          code,
          items: [
            {
              productId: product.product._id,
              price: product.product.price,
              quantity: product.quantity,
              type: product.product.type, // Giả sử product có trường type
            },
          ],
          totalAmount: product.product.price * product.quantity,
          userId: user._id, // Giả sử user có _id
        }
      );

      return response.data;
    } catch (error) {
      return {
        error:
          error.response?.data?.message || "Lỗi khi kiểm tra mã khuyến mãi",
      };
    }
  };

  const applyGlobalPromotion = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3002/api/product/check-coupon",
        {
          code: globalPromoCode,
          items: orderData.products.map((item) => ({
            productId: item.product._id,
            price: item.product.price,
            quantity: item.quantity,
            type: item.product.type,
          })),
          totalAmount: orderData.subtotal,
          userId: user._id,
        }
      );

      setGlobalPromo({
        code: globalPromoCode,
        discount: response.data.discount,
        couponId: response.data.couponId,
      });

      setOrderData((prev) => ({
        ...prev,
        discount: prev.discount + response.data.discount,
        total: prev.total - response.data.discount,
      }));

      message.success(response.data.message);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi áp dụng mã");
    }
  };

  const removeGlobalPromotion = () => {
    if (!globalPromo) return;

    setOrderData((prev) => ({
      ...prev,
      discount: prev.discount - globalPromo.discount,
      total: prev.total + globalPromo.discount,
    }));

    setGlobalPromo(null);
    setGlobalPromoCode("");
  };

  const renderProductPromotion = (productId) => {
    const currentPromo = productPromotions[productId];
    const product = orderData.products.find((item) => item.id === productId);

    return (
      <div style={{ marginTop: "10px" }}>
        {currentPromo ? (
          <div>
            <Tag color="green">
              {currentPromo.code}: Giảm {currentPromo.discount.toLocaleString()}
              ₫
            </Tag>
            <Button
              size="small"
              onClick={() => removeProductPromotion(productId)}
              style={{ marginLeft: "5px" }}
            >
              Xóa
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <ArrowLink>
                <span>
                  <TagOutlined /> Thêm mã khuyến mãi
                </span>
              </ArrowLink>
            </div>
            <div>
              <Input
                placeholder="Nhập mã khuyến mãi"
                size="small"
                style={{ width: "150px" }}
                id={`promo-input-${productId}`}
              />
              <Button
                type="primary"
                size="small"
                style={{ marginLeft: "5px" }}
                onClick={async () => {
                  const input = document.getElementById(
                    `promo-input-${productId}`
                  );
                  if (input?.value) {
                    await applyProductPromotion(productId, input.value);
                    input.value = ""; // Clear input after applying
                  }
                }}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <CheckoutContainer>
      <LeftColumn>
        {/* Product Section - Hiển thị tất cả sản phẩm đã chọn */}
        <Section>
          {orderData.products.map((item, index) => (
            <React.Fragment key={item.id}>
              <ProductItem>
                <ProductImage
                  src={item.product.image || "https://via.placeholder.com/60"}
                  alt={item.product.name}
                />
                <ProductInfo>
                  <ProductName>{item.product.name}</ProductName>
                  <div>SL: x{item.quantity}</div>
                  {item.color && <div>Màu: {item.color}</div>}
                  {item.size && <div>Size: {item.size}</div>}
                  <PriceText>
                    <Text delete>
                      {(item.product.price * item.quantity).toLocaleString()}₫
                    </Text>
                    <br />
                    <Text type="danger">
                      {(
                        item.product.price *
                        item.quantity *
                        (1 - (item.product.discount || 0) / 100)
                      ).toLocaleString()}
                      ₫
                    </Text>
                  </PriceText>

                  {/* Thêm phần mã khuyến mãi cho từng sản phẩm */}
                  {renderProductPromotion(item.id)}
                </ProductInfo>
              </ProductItem>
              {index < orderData.products.length - 1 && <Divider />}
            </React.Fragment>
          ))}

          {/* Có thể giữ lại phần mã khuyến mãi chung nếu cần */}
          <Divider style={{ margin: "12px 0" }} />
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span>
                <TagOutlined /> Thêm mã khuyến mãi chung
              </span>
              <ArrowLink style={{ marginTop: 3 }}>
                <RightOutlined />
              </ArrowLink>
            </div>
            <Input placeholder="Nhập mã khuyến mãi áp dụng cho toàn đơn" />
          </div>
        </Section>

        {/* Payment Method Section */}
        <Section>
          <SectionTitle>Chọn hình thức thanh toán</SectionTitle>
          <Radio.Group
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <PaymentOption
              value="cash"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={cash}
                  alt="Cash"
                  style={{ width: 20, height: 25, marginRight: 8 }}
                />
                Thanh toán tiền mặt
              </div>
            </PaymentOption>
            <PaymentOption
              value="viettel"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={zalopay}
                  alt="ZaloPay"
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                ZaloPay
              </div>
            </PaymentOption>
            <PaymentOption
              value="momo"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={momo}
                  alt="MoMo"
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                Ví MoMo
              </div>
            </PaymentOption>
          </Radio.Group>
        </Section>
      </LeftColumn>

      <RightColumn>
        {/* Shipping Section - Hiển thị địa chỉ giao hàng */}
        <Section>
          <SectionTitle>
            <EnvironmentOutlined />
            <span style={{ fontSize: 16 }}>Thông tin giao hàng</span>
          </SectionTitle>

          {selectedAddressOrder ? (
            <AddressInfo>
              <div>
                <strong>{selectedAddressOrder.name}</strong>
              </div>
              <div>
                {selectedAddressOrder.phoneDelivery ||
                  selectedAddressOrder.phone}
              </div>
              <div>{selectedAddressOrder.address}</div>
            </AddressInfo>
          ) : (
            <div style={{ color: "red" }}>Bạn chưa có địa chỉ giao hàng</div>
          )}

          <Divider style={{ margin: "12px 0" }} />
          <ArrowLink onClick={handleChangeAddress}>
            <span>Thay đổi địa chỉ giao hàng</span>
            <RightOutlined />
          </ArrowLink>
        </Section>

        {/* Price Summary - Tính toán động */}
        <div style={{ backgroundColor: "white" }}>
          <OrderInfo>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Đơn hàng</span>
              <span
                style={{ color: "#1AB2FF", cursor: "pointer" }}
                onClick={() => navigate(-1)}
              >
                Thay đổi
              </span>
            </div>
            <span>Chi tiết: {orderData.products.length} sản phẩm</span>
          </OrderInfo>

          <Section>
            <PriceRow>
              <span>Tạm tính</span>
              <span>{orderData.subtotal.toLocaleString()}₫</span>
            </PriceRow>
            <PriceRow>
              <span>Giảm giá</span>
              <span>-{orderData.discount.toLocaleString()}₫</span>
            </PriceRow>
            <PriceRow>
              <span>Phí giao hàng</span>
              <span>{orderData.shippingFee.toLocaleString()}₫</span>
            </PriceRow>

            <Divider style={{ margin: "16px 0" }} />

            <PriceRow>
              <TotalPrice>Tổng tiền thanh toán</TotalPrice>
              <TotalPrice>{orderData.total.toLocaleString()}₫</TotalPrice>
            </PriceRow>

            {orderData.savings > 0 && (
              <SavingsTag>
                Tiết kiệm {orderData.savings.toLocaleString()}₫
              </SavingsTag>
            )}

            <VATText>(Bao gồm VAT nếu có)</VATText>
          </Section>
        </div>

        <CheckoutButton
          type="primary"
          block
          onClick={handlePlaceOrder}
          disabled={!paymentMethod}
        >
          Đặt hàng
        </CheckoutButton>
      </RightColumn>

      {/*  Modal đổi địa chỉ giao hàng */}
      <AddressModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onSelect={handleSelectAddress}
        // currentAddress={selectedAddressOrder}
      />
    </CheckoutContainer>
  );
};

export default CheckoutComponent;

// Styled components (giữ nguyên như trước)

const CheckoutContainer = styled.div`
  display: flex;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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
  //border-radius: 8px;
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

const AddressInfo = styled.div`
  line-height: 1.6;
  font-size: 14px;
`;

const ArrowLink = styled.div`
  color: #1890ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  //justify-content: space-between;
  padding: 8px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const PaymentOption = styled(Radio)`
  display: block;
  height: 40px;
  line-height: 40px;
  margin-bottom: 8px;
  align-items: center;
  font-size: 18px;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
`;

const PriceText = styled.div`
  text-align: left;
  min-width: 100px;
`;

const PromotionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin: 12px 0;
`;

const PromotionButton = styled(Button)`
  flex: 1;
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
  width: 100%;
  text-align: center;
`;

const VATText = styled.div`
  color: #999;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
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

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-bottom: solid 1px #ccc;
  padding: 16px;
  font-size: 14px;
`;
