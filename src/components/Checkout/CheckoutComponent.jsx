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
import { useDispatch, useSelector } from "react-redux";
import AddressModal from "../Order/AddressModal";
import {
  removeMultipleFromCart,
  updateCartOnServer,
} from "../../redux/slices/cartSlice";
import { setLoading } from "../../redux/slices/loadingSlice";
import Loading from "../LoadingComponent/Loading";

const { Title, Text } = Typography;

const CheckoutComponent = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [globalPromoCode, setGlobalPromoCode] = useState("");
  const [statusOrder, setStatusOrder] = useState("pending");
  const [shippingMethod, setShippingMethod] = useState("express");
  const [globalPromo, setGlobalPromo] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [directCheckoutItems, setDirectCheckoutItems] = useState([]);
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

  const { customer } = location.state || {};

  const [orderData, setOrderData] = useState({
    products: [],
    subtotal: 0,
    discount: 0,
    shippingFee: 0,
    total: 0,
    savings: 0,
    address: null,
    paymentMethod: "", // Thêm phương thức thanh toán
    customer: {
      // Thêm thông tin khách hàng

      username: user?.username || "",
      phone: user?.phone || "",
      email: user?.email || "",
    },
  });

  const [productPromotions, setProductPromotions] = useState({});

  const updateOrderData = (updates, updatedPromotions = productPromotions) => {
    setOrderData((prev) => {
      const newData = {
        ...prev,
        ...updates,
        status: updates.status || prev.status,
        createdAt:
          updates.createdAt || prev.createdAt || new Date().toISOString(),
      };

      // Cập nhật sản phẩm chi tiết
      newData.products = newData.products.map((item) => {
        const { product } = item;
        const { price, discount: productDiscount = 0 } = product;

        const baseDiscountAmount =
          price * (productDiscount / 100) * item.quantity;

        const productPromo = updatedPromotions[item.id] || {};
        const promoDiscount = productPromo.discount || 0;

        const totalDiscount = baseDiscountAmount + promoDiscount;

        const productSubtotal = price * item.quantity - totalDiscount;
        const originalPrice = price * item.quantity;

        return {
          ...item,
          productName: product.name,
          productImage: product.image,
          quantity: item.quantity,
          originalPrice: price * item.quantity,
          productDiscount,
          baseDiscountAmount,
          promoDiscount,
          totalDiscount,
          productSubtotal,
          subtotal: originalPrice, // dùng đồng nhất
        };
      });

      const totalPromoDiscount = newData.products.reduce(
        (sum, item) => sum + item.promoDiscount,
        0
      );

      // Tổng giá gốc chưa giảm
      const originalTotal = newData.products.reduce(
        (sum, item) => sum + item.originalPrice,
        0
      );

      // Tổng đã giảm sau khuyến mãi sản phẩm
      const subtotal = newData.products.reduce(
        (sum, item) => sum + item.productSubtotal,
        0
      );

      const extraDiscount = updates.discount ?? 0;
      const discount = totalPromoDiscount + extraDiscount;
      const shippingFee = updates.shippingFee ?? prev.shippingFee ?? 0;

      const totalDiscountAmount = originalTotal - subtotal;

      const total = subtotal + shippingFee;

      newData.originalTotal = originalTotal;
      newData.subtotal = subtotal;
      newData.totalDiscountAmount = totalDiscountAmount;
      newData.discount = discount;
      newData.shippingFee = shippingFee;
      newData.total = total;
      newData.savings = extraDiscount;

      if (updates.discount !== undefined) {
        newData.savings = updates.discount;
      }

      // Lưu localStorage
      localStorage.setItem(
        "checkoutData",
        JSON.stringify({
          selectedItems: newData.products,
          selectedAddress: newData.address,
          subtotal,
          discount,
          shippingFee,
          total,
          status: newData.status,
          createdAt: newData.createdAt,
          paymentMethod: newData.paymentMethod,
          shippingMethod: newData.shippingMethod,
          customer: newData.customer,
          originalTotal,
          totalDiscountAmount,
        })
      );

      return newData;
    });
  };

  useEffect(() => {
    if (state?.directCheckout) {
      // Nếu là thanh toán trực tiếp từ trang sản phẩm
      setDirectCheckoutItems(state.selectedItems);
    }
  }, [state]);

  const itemsToCheckout = state?.directCheckout
    ? directCheckoutItems
    : state?.selectedItems || [];

  const applyProductPromotion = async (productId, promotionCode) => {
    const result = await checkPromotionCode(productId, promotionCode);

    if (result.error) {
      message.error(result.error);
      return;
    }

    const updatedPromotions = {
      ...productPromotions,
      [productId]: {
        code: promotionCode,
        discount: result.discount,
        couponId: result.couponId,
      },
    };

    // Cập nhật mã giảm giá
    setProductPromotions(updatedPromotions);

    // Kích hoạt tính toán lại và truyền promotions vào
    updateOrderData({}, updatedPromotions);

    message.success(result.message || "Áp dụng mã thành công");
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    updateOrderData({ paymentMethod: method });

    if (method === "cash") {
      setStatusOrder("pending"); // Trạng thái đơn hàng cho thanh toán tiền mặt
    } else if (method === "momo" || method === "viettel") {
      setStatusOrder("pending"); // Trạng thái đơn hàng cho thanh toán momo hoặc viettel
    }
    // handlePlaceOrder();
  };

  const handleShippingMethodChange = (method) => {
    setShippingMethod(method);
    updateOrderData({
      shippingMethod: method,
      shippingFee: method === "standard" ? 15000 : 30000,
    });
  };

  const removeProductPromotion = (productId) => {
    const promotion = productPromotions[productId];
    if (!promotion) return;

    const updatedPromotions = { ...productPromotions };
    delete updatedPromotions[productId];

    setProductPromotions(updatedPromotions);

    // Gọi updateOrderData với updatedPromotions mới
    updateOrderData({}, updatedPromotions);
  };

  useEffect(() => {
    const address = getInitialAddress();
    setSelectedAddressOrder(address);

    const savedData = JSON.parse(localStorage.getItem("checkoutData")) || {};
    const items = state?.selectedItems || savedData.selectedItems || [];

    if (items.length === 0) return;

    // Tính toán subtotal cho từng sản phẩm và thêm trường itemsSubtotal
    const updatedItems = items.map((item) => {
      const productSubtotal = item.product.price * item.quantity; // Giá gốc của từng sản phẩm
      return {
        ...item,
        itemsSubtotal: productSubtotal, // Thêm trường itemsSubtotal
        originalPrice: productSubtotal, // Giá gốc
        productSubtotal: productSubtotal, // Giá sau giảm (khởi tạo bằng giá gốc)
        appliedPromotions: [], // Danh sách mã giảm giá áp dụng
      };
    });

    // Tính tổng của tất cả các subtotal
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.productSubtotal,
      0
    );

    const discount = state?.discount || savedData.discount || 0;
    let shippingFee = 0;
    if (subtotal > 100000) shippingFee = 0;

    setOrderData({
      products: updatedItems, // Cập nhật sản phẩm đã tính toán subtotal
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
      updateOrderData({
        address: {
          name: selectedAddressOrder.name,
          phone:
            selectedAddressOrder.phoneDelivery || selectedAddressOrder.phone,
          address: selectedAddressOrder.address,
        },
      });
    }
  }, [selectedAddressOrder]);

  const handleChangeAddress = () => setIsOpenModal(true);
  const handleSelectAddress = (address) => {
    setSelectedAddressOrder(address);
    setIsOpenModal(false);
  };

  useEffect(() => {
    const initData = () => {
      const savedData = JSON.parse(localStorage.getItem("checkoutData")) || {};

      const items = savedData.selectedItems || state?.selectedItems || [];

      if (items.length === 0) return;

      const subtotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const discount = state?.discount || savedData.discount || 0;
      const shippingFee =
        savedData.shippingMethod === "standard" ? 15000 : 30000;

      const newOrderData = {
        products: items,
        subtotal,
        discount,
        shippingFee,
        total: savedData.total || subtotal - discount + shippingFee,
        savings: discount,
        status: savedData.status || "pending",
        createdAt: savedData.createdAt || new Date().toISOString(),
        address: selectedAddressOrder
          ? {
              name: selectedAddressOrder.name || "",
              phone:
                selectedAddressOrder.phoneDelivery ||
                selectedAddressOrder.phone ||
                "",
              address: selectedAddressOrder.address || "",
            }
          : null,
        paymentMethod: savedData.paymentMethod || "",
        shippingMethod: savedData.shippingMethod || "express",
        customer: {
          userId: user?._id || "",
          username: user?.username || savedData.customer?.username || "",
          phone: user?.phone || savedData.customer?.phone || "",
          email: user?.email || savedData.customer?.email || "",
        },
      };

      setOrderData(newOrderData);
      setPaymentMethod(savedData.paymentMethod || "");
      setShippingMethod(savedData.shippingMethod || "express");

      if (state?.selectedItems) {
        localStorage.setItem(
          "checkoutData",
          JSON.stringify({
            selectedItems: state.selectedItems,
            selectedAddress: state.selectedAddress,
            subtotal,
            discount: state.discount || 0,
            total: newOrderData.total,
            status: newOrderData.status,
            createdAt: newOrderData.createdAt,
            customer: newOrderData.customer,
          })
        );
      }
    };
    initData();
  }, [state, user]);

  const handlePlaceOrder = async () => {
    // Kiểm tra điều kiện ban đầu
    if (!paymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!orderData.address) {
      message.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const roundedTotal = Math.round(orderData.total);

    // Tạo payload đơn hàng
    const orderPayload = {
      customer: orderData.customer,
      selectedItems: orderData.products.map((item) => ({
        id: item.id,
        product: item.product._id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        diameter: item.diameter || "",
        productSubtotal: item.productSubtotal,
        discountAmount: item.totalDiscount || 0,
        type: item.product.type || "",
        promotion: productPromotions[item.id]?.couponId,
      })),
      selectedAddress: orderData.address,
      paymentMethod: paymentMethod,
      shippingMethod: orderData.shippingMethod.trim(),
      discount: orderData.totalDiscountAmount,
      subtotal: orderData.subtotal,
      total: roundedTotal,
      shippingFee: orderData.shippingFee,
      status: paymentMethod === "momo" ? "pending_payment" : "pending",
    };

    console.log("Order payload:", orderPayload);

    try {
      dispatch(setLoading(true));

      // 1. Tạo đơn hàng
      const response = await axios.post(
        "http://localhost:3002/api/order/create",
        orderPayload
      );

      if (!response.data.success) {
        throw new Error("Tạo đơn hàng thất bại");
      }

      // 2. Xử lý mã khuyến mãi nếu có
      const usedPromoCodes = Object.values(productPromotions).map(
        (promo) => promo.code
      );

      if (usedPromoCodes.length > 0) {
        await Promise.all(
          usedPromoCodes.map((code) =>
            axios.put("http://localhost:3002/api/product/promotions/use", {
              code,
            })
          )
        );
      }

      const createdOrder = response.data.order;
      const orderId = createdOrder._id;

      // 3. Xử lý thanh toán MoMo
      if (paymentMethod === "momo") {
        try {
          console.log("Initiating MoMo payment for order:", orderId);

          const momoResponse = await axios.post(
            "http://localhost:3002/api/checkout/momo",
            {
              amount: roundedTotal,
              orderId,
            }
          );

          if (!momoResponse.data.payUrl) {
            console.error("No payUrl received from MoMo");
            await cancelOrderAndNavigate(
              orderId,
              "Không nhận được liên kết thanh toán từ MoMo",
              "Không thể kết nối tới cổng thanh toán MoMo. Đơn hàng đã bị huỷ."
            );
            return;
          }

          // Lưu thông tin đơn hàng tạm thời
          localStorage.setItem(
            "momoPendingOrder",
            JSON.stringify({
              orderId,
              products: orderData.products,
              total: orderData.total,
              timestamp: Date.now(), // Thêm timestamp để xử lý timeout
              paymentMethod: "momo",
            })
          );

          // Bắt đầu kiểm tra timeout
          startPaymentTimeoutCheck(orderId);

          console.log("Redirecting to MoMo payment page");
          window.location.href = momoResponse.data.payUrl;
          return;
        } catch (err) {
          console.error("MoMo API error:", err);
          await cancelOrderAndNavigate(
            orderId,
            "Gọi đến MoMo thất bại",
            "Không thể kết nối tới cổng thanh toán MoMo. Đơn hàng đã bị huỷ."
          );
          return;
        }
      }

      // 4. Xử lý phương thức thanh toán khác (COD)
      console.log("Processing non-MoMo payment");
      await processNonMoMoPayment(orderId, orderData.products);

      message.success("Đặt hàng thành công!");
      localStorage.removeItem("checkoutData");

      dispatch(setLoading(false));
      navigateToSuccessPage(orderData.total, paymentMethod);
    } catch (error) {
      console.error("Order placement error:", error);
      dispatch(setLoading(false));
      message.error(error.response?.data?.message || "Đặt hàng thất bại");
    }
  };

  // Hủy đơn hàng và chuyển hướng đến trang thất bại
  const cancelOrderAndNavigate = async (orderId, cancelReason, userMessage) => {
    try {
      await axios.post("http://localhost:3002/api/order/cancel", {
        orderId,
        reason: cancelReason,
      });
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }

    dispatch(setLoading(false));
    navigate("/checkout/payment-failed", {
      replace: true,
      state: {
        reason: userMessage,
        orderId,
      },
    });
  };

  // Xử lý thanh toán không phải MoMo (COD)
  const processNonMoMoPayment = async (orderId, products) => {
    const orderedProductIds = products.map((item) => item.id);

    await axios.post("http://localhost:3002/api/product/update-selled", {
      products: products.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        color: item.color || "",
        size: item.size || "",
        diameter: item.diameter || "",
      })),
    });

    dispatch(removeMultipleFromCart(orderedProductIds));
    dispatch(updateCartOnServer({ forceUpdateEmptyCart: true }));
  };

  // Chuyển hướng đến trang thành công
  const navigateToSuccessPage = (total, paymentMethod) => {
    navigate("/checkout/success", {
      replace: true,
      state: {
        total,
        paymentMethod,
        createdAt: new Date().toLocaleString("vi-VN", {
          hour12: false,
          dateStyle: "short",
          timeStyle: "short",
        }),
      },
    });
  };

  // Kiểm tra timeout thanh toán
  const startPaymentTimeoutCheck = (orderId) => {
    const paymentTimeout = 1 * 60 * 1000; // 15 phút

    const timeoutId = setTimeout(async () => {
      const pendingOrder = JSON.parse(localStorage.getItem("momoPendingOrder"));

      if (pendingOrder && pendingOrder.orderId === orderId) {
        console.warn(`Payment timeout for order ${orderId}`);
        await cancelOrderAndNavigate(
          orderId,
          "Quá thời gian thanh toán",
          "Quá thời gian thanh toán. Đơn hàng đã bị huỷ."
        );
        localStorage.removeItem("momoPendingOrder");
      }
    }, paymentTimeout);

    // Lưu timeoutId để clear khi component unmount (nếu cần)
    return () => clearTimeout(timeoutId);
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

      setOrderData((prev) => {
        const newData = {
          ...prev,
          discount: prev.discount + response.data.discount,
          total: prev.total - response.data.discount,
        };

        // Cập nhật localStorage
        const currentData =
          JSON.parse(localStorage.getItem("checkoutData")) || {};
        localStorage.setItem(
          "checkoutData",
          JSON.stringify({
            ...currentData,
            discount: newData.discount,
          })
        );

        return newData;
      });

      message.success(response.data.message);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi áp dụng mã");
    }
  };

  const removeGlobalPromotion = () => {
    if (!globalPromo) return;

    setOrderData((prev) => {
      const newData = {
        ...prev,
        discount: prev.discount - globalPromo.discount,
        total: prev.total + globalPromo.discount,
      };

      // Cập nhật localStorage
      const currentData =
        JSON.parse(localStorage.getItem("checkoutData")) || {};
      localStorage.setItem(
        "checkoutData",
        JSON.stringify({
          ...currentData,
          discount: newData.discount,
        })
      );

      return newData;
    });

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
    <Loading>
      <CheckoutContainer>
        <LeftColumn>
          <Section>
            <SectionTitle>Phương thức vận chuyển</SectionTitle>
            <Radio.Group
              onChange={(e) => handleShippingMethodChange(e.target.value)}
              value={shippingMethod}
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Radio
                value="standard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "50%",
                  backgroundColor: "#F0F8FF",
                  borderRadius: "8px",
                  border: "solid 1px #0B74E5",
                  padding: "0 20px",
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    transition: "background-color 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    maxWidth: "100%",
                    width: "100%",
                  }}
                >
                  {/* Thêm khoảng cách giữa checkbox và văn bản */}
                  <div style={{ width: "100%" }}>
                    <strong
                      style={{
                        fontSize: "16px",
                        color: "#444",
                        fontWeight: 100,
                      }}
                    >
                      Giao tiết kiệm
                    </strong>
                    <div style={{ fontSize: "14px", color: "#777" }}>
                      4-5 ngày - 15,000₫
                    </div>
                  </div>
                </div>
              </Radio>
              <Radio
                value="express"
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "50%",
                  backgroundColor: "#F0F8FF",
                  borderRadius: "8px",
                  border: "solid 1px #0B74E5",
                  padding: "0 20px",
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    transition: "background-color 0.3s ease",
                    display: "flex",
                    alignItems: "center", // Căn chỉnh checkbox và văn bản ngang
                    width: "100%", // Đảm bảo phần này chiếm 100% chiều rộng
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: "16px",
                        color: "#444",
                        fontWeight: 100,
                      }}
                    >
                      Giao nhanh
                    </strong>
                    <div style={{ fontSize: "14px", color: "#777" }}>
                      1-2 ngày - 30,000₫
                    </div>
                  </div>
                </div>
              </Radio>
            </Radio.Group>
          </Section>

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
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
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
    </Loading>
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
