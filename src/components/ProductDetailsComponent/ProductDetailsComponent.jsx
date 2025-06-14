import { Row, Col, Button, message, Modal, Radio, Space } from "antd";
import React, { useEffect, useState } from "react";
import imageProduct from "../../assets/aonam.jpg";
import imageSmallProduct from "../../assets/vi.jpg";
import {
  PlusOutlined,
  StarFilled,
  MinusOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  WrapperStyleImageSmall,
  WrapperStyleImage,
  WrapperStyleNameProduct,
  WrapperStyleTextSell,
  WrapperStylePriceProduct,
  WrapperStylePriceTextProduct,
  WrapperAdressProduct,
  WrapperQualityProduct,
  StyledButton,
  StyledImagePreview,
  WrapperSizeOptions,
  WrapperSizeButton,
} from "./style";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateCartOnServer } from "../../redux/slices/cartSlice";
import { useLocation, useNavigate } from "react-router";

const productsComponent = ({ product }) => {
  const colorMap = {
    Hồng: "#FF69B4",
    Nâu: "#8B4513",
    Đen: "#000000",
    black: "#000000",
    white: "#FFFFFFF",
    Trắng: "#FFFFFF",
    "Xanh dương": "#D9E0E9",
    "Xanh lá": "#008000",
    Vàng: "#FFD700",
    Đồng: "#B87333",
  };

  const [tempSelectedAddressId, setTempSelectedAddressId] = useState(null);
  const [quantityPay, setQuantityPay] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedDiameter, setSelectedDiameter] = useState(null);
  const shirtSizes = ["S", "M", "L", "XL", "XXL"];
  const watchDiameters = [38, 39, 40, 41, 42];
  const pantsSizes = [28, 29, 30, 31, 32];

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const address = useSelector((state) => state.user.address);

  const defaultAddress = address?.find((addr) => addr.isDefault) || null;
  const availablePantsSizes = product.variants.map((v) => Number(v.size));
  const availableShirtSizes = Array.isArray(product?.sizes)
    ? product.sizes
    : [];

  const isClothing = ["Áo nam", "Áo nữ"].includes(product.type);
  const isPants = ["Quần nam", "Quần nữ"].includes(product.type);

  const displaySizes = isPants
    ? pantsSizes
    : isPants
    ? shirtSizes
    : availableShirtSizes;

  const availableSizeSet = new Set(
    isPants ? availablePantsSizes : availableShirtSizes
  );

  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?._id || null
  );

  const navigate = useNavigate();
  const location = useLocation();

  const isWatch = product?.type === "Đồng hồ";

  const uniqueColors = [
    ...new Set(product.variants?.map((variant) => variant.color)),
  ];

  const showAddressModal = () => {
    setIsAddressModalVisible(true);
  };

  const handleAddressOk = () => {
    setSelectedAddressId(tempSelectedAddressId);
    setIsAddressModalVisible(false);
  };

  const handleAddressCancel = () => {
    setIsAddressModalVisible(false);
  };

  useEffect(() => {
    if (isAddressModalVisible) {
      setTempSelectedAddressId(selectedAddressId);
    }
  }, [isAddressModalVisible]);

  const getDisplayAddress = () => {
    if (selectedAddressId) {
      const selected = user.address?.find(
        (addr) => addr._id === selectedAddressId
      );
      return selected?.address || defaultAddress?.address;
    }
    return defaultAddress?.address || "Chưa có địa chỉ mặc định";
  };

  const handleCheckout = async () => {
    if (!user.isAuthenticated) {
      localStorage.setItem(
        "tempCheckoutItem",
        JSON.stringify({
          product: product,
          quantity: quantityPay,
          selectedColor,
          selectedSize,
          selectedDiameter,
        })
      );

      message.warning("Vui lòng đăng nhập để thanh toán");

      navigate("/sign-in", { state: { from: location.pathname } });
      return;
    }

    const isClothing = ["Áo nam", "Áo nữ"].includes(product.type);
    const isPants = ["Quần nam", "Quần nữ"].includes(product.type);
    const isWatch = product.type === "Đồng hồ";

    if ((isClothing || isPants) && !selectedSize) {
      message.error("Vui lòng chọn kích thước trước khi thanh toán");
      return;
    }

    if ((isClothing || isPants || isWatch) && !selectedColor) {
      message.error("Vui lòng chọn màu sắc trước khi thanh toán");
      return;
    }

    if (isWatch && !selectedDiameter) {
      message.error("Vui lòng chọn đường kính trước khi thanh toán");
      return;
    }

    // Tạo id dựa trên biến thể
    const id = [
      product._id,
      selectedSize,
      selectedColor,
      selectedDiameter,
      "buyNow",
    ]
      .filter(Boolean)
      .join("-");

    const selectedAddress =
      user.address?.find((addr) => addr._id === selectedAddressId) ||
      defaultAddress ||
      user.address?.[0];
    // Giữ nguyên cấu trúc, chỉ thêm id
    const checkoutItem = {
      id,
      product: {
        _id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        type: product.type,
        discount: product.discount,
      },
      quantity: quantityPay,
      ...(selectedSize && { size: selectedSize }),
      ...(selectedColor && { color: selectedColor }),
      ...(selectedDiameter && { diameter: selectedDiameter }),
    };

    console.log("checkoutItem", checkoutItem);

    if (!selectedAddress) {
      message.error("Vui lòng chọn địa chỉ giao hàng trước khi thanh toán");
      return;
    }

    navigate("/checkout", {
      state: {
        selectedItems: [checkoutItem],
        total: product.price * quantityPay,
        discount: (product.price * (product.discount || 0) * quantityPay) / 100,
        selectedAddress: selectedAddress,
        directCheckout: true,
      },
    });
  };

  const handleAddToCart = async () => {
    const isClothing = ["Áo nam", "Áo nữ"].includes(product.type);
    const isPants = ["Quần nam", "Quần nữ"].includes(product.type);
    const isWatch = product.type === "Đồng hồ";
    const isAccessory = ["Trang sức", "Ví", "Túi xách"].includes(product.type);

    const getSelectedVariant = () => {
      if (!selectedColor) return null;

      if (isWatch) {
        return product.variants?.find(
          (v) => v.color === selectedColor && v.diameter === selectedDiameter
        );
      }
      if (isPants) {
        // Với Quần nam và Quần nữ, xét size và color trong variants
        return product.variants?.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        );
      }
      return product.variants?.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
    };

    let selectedVariant = getSelectedVariant();

    if (!user.isAuthenticated) {
      // Lưu thông tin giỏ hàng tạm thời vào localStorage
      if (!product || !product._id) {
        console.error("❌ Lỗi: Không có sản phẩm hợp lệ", product);
        return;
      }

      // Kiểm tra điều kiện bắt buộc theo loại sản phẩm
      if (
        (isClothing || isPants) &&
        product.sizes?.length > 0 &&
        !selectedSize
      ) {
        alert("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!");
        return;
      }

      if (
        (isClothing || isPants || isWatch) &&
        product.colors?.length > 0 &&
        !selectedColor
      ) {
        alert("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng!");
        return;
      }

      if (isWatch && product.variants?.length > 0 && !selectedDiameter) {
        alert("Vui lòng chọn đường kính trước khi thêm vào giỏ hàng!");
        return;
      }

      // Tìm đúng biến thể của sản phẩm (đối với quần áo & đồng hồ)
      if (isWatch) {
        selectedVariant = product.variants?.find(
          (v) => v.color === selectedColor && v.diameter === selectedDiameter
        );
      } else if (isPants) {
        // Kiểm tra biến thể cho Quần nam hoặc Quần nữ
        selectedVariant = product.variants?.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        );
      } else {
        selectedVariant = product.variants?.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        );
      }

      if (isWatch && !selectedVariant) {
        alert("Vui lòng chọn màu sắc và mặt đồng hồ!");
        return;
      }

      // Lưu giỏ hàng tạm vào localStorage
      localStorage.setItem(
        "tempCartItem",
        JSON.stringify({
          product: {
            _id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            type: product.type,
          },
          quantity: quantityPay,
          amount: isAccessory ? quantityPay : 1,
          size: selectedSize,
          color: selectedColor,
          diameter: isWatch ? selectedDiameter : undefined, // Lưu diameter cho đồng hồ
          variant: selectedVariant, // Lưu biến thể đã chọn
        })
      );

      alert("Bạn phải đăng nhập để mua hàng");
      navigate("/sign-in", { state: { from: location.pathname } });
      return;
    }

    if (!product || !product._id) {
      console.error("❌ Lỗi: Không có sản phẩm hợp lệ", product);
      return;
    }

    // Xác định loại sản phẩm
    if (
      (isClothing || isPants) &&
      product.sizes?.length > 0 &&
      !selectedSize &&
      !isPants // Không cần kiểm tra với Quần nữ vì kích thước nằm trong biến thể
    ) {
      alert("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!");
      return;
    }

    if (
      (isClothing || isPants || isWatch) &&
      product.colors?.length > 0 &&
      !selectedColor
    ) {
      alert("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng!");
      return;
    }

    if (isWatch && product.variants?.length > 0 && !selectedDiameter) {
      alert("Vui lòng chọn đường kính trước khi thêm vào giỏ hàng!");
      return;
    }

    // Tìm đúng biến thể của sản phẩm (đối với quần áo, quần nữ & đồng hồ)
    if (isWatch) {
      selectedVariant = product.variants?.find(
        (v) => v.color === selectedColor && v.diameter === selectedDiameter
      );
    } else if (isPants) {
      // Kiểm tra biến thể cho Quần nữ
      selectedVariant = product.variants?.find(
        (v) => v.color === selectedColor && v.size === selectedSize // Kiểm tra từ các biến thể của Quần nữ
      );
    } else {
      selectedVariant = product.variants?.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
    }

    if (isWatch && !selectedVariant) {
      alert("Không tìm thấy biến thể phù hợp!");
      return;
    }

    // Tạo item giỏ hàng với số lượng mặc định là 1
    const itemToAdd = {
      product: {
        _id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        type: product.type,
        discount: product.discount,
      },
      quantity: quantityPay,
      amount: isAccessory ? quantityPay : 1, // Phụ kiện tính toàn bộ vào cartCount, còn lại mặc định 1

      // Xử lý biến thể theo từng loại sản phẩm
      ...(isClothing || isPants
        ? {
            size: selectedSize,
            color: selectedColor,
            variant: selectedVariant,
          }
        : {}),

      ...(isWatch
        ? {
            diameter: selectedDiameter, // Lấy đúng đường kính từ biến thể đã chọn
            color: selectedColor, // Lấy đúng màu từ biến thể đã chọn
            variant: selectedVariant,
          }
        : {}),
    };

    // Kiểm tra tồn kho tổng thể sản phẩm
    if (product.countInStock < quantityPay) {
      alert(
        `Số lượng tồn kho không đủ! Chỉ còn ${product.countInStock} sản phẩm`
      );
      return;
    }

    // Kiểm tra tồn kho của biến thể nếu có
    if (selectedVariant && selectedVariant.countInStock < quantityPay) {
      alert(
        `Số lượng tồn kho cho biến thể này không đủ! Chỉ còn ${selectedVariant.countInStock} sản phẩm`
      );
      return;
    }
    try {
      dispatch(addToCart(itemToAdd));
      dispatch(updateCartOnServer());
      message.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      console.error("Lỗi khi đồng bộ giỏ hàng:", error);
      alert("Thêm vào giỏ hàng thành công nhưng chưa đồng bộ lên server");
    }
  };

  const increaseQuantity = () =>
    setQuantityPay((prev) => Math.min(prev + 1, 10));
  const decreaseQuantity = () =>
    setQuantityPay((prev) => Math.max(prev - 1, 1));

  const handleColorSelect = (color) => {
    setSelectedColor(color); // Cập nhật màu sắc khi chọn
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    console.log("setSelectedSize", selectedSize); // Cập nhật size khi chọn
  };

  const handleDiameterSelect = (diameter) => {
    setSelectedDiameter(diameter); // Cập nhật đường kính khi chọn
  };

  const rating = Math.min(product.rating, 5);
  const fullStars = Math.floor(rating);
  const partialStar = rating - fullStars;

  const getPartialStarWidth = (partialStar) => {
    return Math.round(partialStar * 100);
  };

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const defaultImages = [
    product?.image,
    product?.image,
    product?.image,
    product?.image,
  ];

  const imagesPreview = product?.imagesPreview?.length
    ? [...product.imagesPreview.slice(0, 4)]
    : [...defaultImages.slice(0, 4)];

  const imageList = [
    product?.image || imagesPreview[0] || imageProduct, // Ảnh chính
    ...imagesPreview, // Các ảnh còn lại
  ];

  const partialStarWidth = getPartialStarWidth(partialStar);

  return (
    <Row
      style={{
        padding: "24px",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        maxWidth: "1250px",
        width: "1250px",
        margin: "0 auto",
      }}
    >
      {/* Image Gallery Column */}
      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "sticky",
            top: "20px",
          }}
        >
          {/* Main Image Preview */}
          <div
            style={{
              width: "100%",
              aspectRatio: "1/1",
              backgroundColor: "#f8f8f8",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              border: "1px solid #eee",
            }}
          >
            <img
              src={imageList[selectedImageIndex]}
              alt="Product preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                maxHeight: "400px",
              }}
            />
          </div>

          {/* Thumbnail Gallery */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "8px 0",
              overflowX: "auto",
              scrollbarWidth: "none", // Hide scrollbar for Firefox
              "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar for Chrome
            }}
          >
            {imageList.slice(0, 5).map((image, index) => (
              <div
                key={index}
                style={{
                  width: "60px",
                  height: "60px",
                  minWidth: "60px", // Prevent shrinking
                  borderRadius: "4px",
                  border:
                    selectedImageIndex === index
                      ? "2px solid #1890ff"
                      : "1px solid #e8e8e8",
                  cursor: "pointer",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  transition: "all 0.2s",
                  ":hover": {
                    borderColor: "#1890ff",
                    opacity: 0.9,
                  },
                }}
                onClick={() => setSelectedImageIndex(index)}
                onMouseEnter={() => setSelectedImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Col>

      {/* Product Info Column */}
      <Col xs={24} sm={24} md={14} lg={14} xl={14}>
        <div style={{ padding: "0 16px" }}>
          {/* Product Name */}
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "8px",
              color: "#333",
            }}
          >
            {product?.name}
          </h1>

          {/* Rating and Sales */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {[...Array(5)].map((_, i) => {
                if (i < fullStars) {
                  // Hiển thị sao đầy đủ
                  return (
                    <StarFilled
                      key={i}
                      style={{
                        fontSize: "16px",
                        color: "#faad14",
                      }}
                    />
                  );
                } else if (i === fullStars && partialStar > 0) {
                  // Hiển thị sao lẻ
                  const partialStarWidth = getPartialStarWidth(partialStar);
                  return (
                    <div
                      key={i}
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      {/* Sao nền (màu xám) */}
                      <StarFilled
                        style={{
                          fontSize: "16px",
                          color: "#e8e8e8",
                        }}
                      />
                      {/* Sao vàng che phủ một phần */}
                      <div
                        style={{
                          width: `${partialStarWidth}%`,
                          overflow: "hidden",
                          position: "absolute",
                          left: 0,
                          top: 0,
                        }}
                      >
                        <StarFilled
                          style={{
                            fontSize: "16px",
                            color: "#faad14",
                          }}
                        />
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <StarFilled
                      key={i}
                      style={{
                        fontSize: "16px",
                        color: "#e8e8e8",
                      }}
                    />
                  );
                }
              })}

              <span
                style={{ marginLeft: "8px", color: "#666", fontSize: "14px" }}
              >
                ({rating.toFixed(1)})
              </span>
            </div>
            <span style={{ color: "#666", fontSize: "14px" }}>
              | Đã bán {product.selled || 0}
            </span>
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#d32f2f",
              marginBottom: "24px",
            }}
          >
            {product?.price.toLocaleString("vi-VN")}₫
          </div>

          {/* Shipping Info */}
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "24px",
            }}
          >
            <span style={{ color: "#666" }}>Giao đến </span>
            <span style={{ fontWeight: 500 }}>{getDisplayAddress()}</span>
            <span
              style={{
                color: "#1890ff",
                marginLeft: "8px",
                cursor: "pointer",
              }}
              onClick={
                defaultAddress
                  ? showAddressModal
                  : () => navigate("/profile/address")
              }
            >
              {defaultAddress ? "Đổi địa chỉ" : "Thêm địa chỉ"}
            </span>

            {/* Modal chọn địa chỉ */}
            <Modal
              title="Chọn địa chỉ giao hàng"
              open={isAddressModalVisible}
              onOk={handleAddressOk}
              onCancel={handleAddressCancel}
              footer={[
                <Button key="add" onClick={() => navigate("/profile/address")}>
                  Thêm địa chỉ mới
                </Button>,
                <Button key="submit" type="primary" onClick={handleAddressOk}>
                  Xác nhận
                </Button>,
              ]}
            >
              <Radio.Group
                onChange={(e) => setTempSelectedAddressId(e.target.value)}
                value={tempSelectedAddressId}
              >
                <Space direction="vertical">
                  {user.address?.map((addr) => (
                    <Radio key={addr._id} value={addr._id}>
                      <div>
                        <strong>{addr.name}</strong> - {addr.phoneDelivery}
                        <br />
                        {addr.address}
                        {addr.isDefault && (
                          <span style={{ color: "#1890ff", marginLeft: "8px" }}>
                            (Mặc định)
                          </span>
                        )}
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Modal>
          </div>
          {/* Color Selection */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "12px",
                fontWeight: 500,
              }}
            >
              Màu sắc
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {uniqueColors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "4px",
                    backgroundColor: colorMap[color],
                    cursor: "pointer",
                    border:
                      selectedColor === color
                        ? "2px solid #1890ff"
                        : "1px solid #e8e8e8",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.2s",
                    ":hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={() => handleColorSelect(color)}
                >
                  {selectedColor === color && (
                    <CheckOutlined
                      style={{ color: "#fff", fontSize: "16px" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "12px",
                fontWeight: 500,
              }}
            >
              {isWatch ? "Đường kính" : "Kích thước"}
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(isWatch ? watchDiameters : displaySizes).map((item, index) => {
                const isAvailable = isWatch
                  ? product.diameter?.includes(item)
                  : availableSizeSet.has(item);
                const isSelected = isWatch
                  ? selectedDiameter === item
                  : selectedSize === item;

                return (
                  <button
                    key={index}
                    style={{
                      minWidth: "50px",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      border: "1px solid",
                      borderColor: isSelected ? "#1890ff" : "#d9d9d9",
                      backgroundColor: isSelected ? "#e6f7ff" : "#fff",
                      color: isSelected ? "#1890ff" : "#333",
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      opacity: isAvailable ? 1 : 0.5,
                      transition: "all 0.2s",
                      ":hover": {
                        borderColor: isAvailable ? "#1890ff" : "#d9d9d9",
                      },
                    }}
                    onClick={() =>
                      isAvailable &&
                      (isWatch
                        ? handleDiameterSelect(item)
                        : handleSizeSelect(item))
                    }
                    disabled={!isAvailable}
                  >
                    {isWatch ? `${item}mm` : item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "12px",
                fontWeight: 500,
              }}
            >
              Số lượng
            </h3>
            <div
              style={{
                display: "inline-flex",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <button
                style={{
                  width: "32px",
                  height: "32px",
                  border: "none",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  ":hover": {
                    backgroundColor: "#e8e8e8",
                  },
                }}
                onClick={decreaseQuantity}
              >
                <MinusOutlined />
              </button>
              <div
                style={{
                  width: "40px",
                  height: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderLeft: "1px solid #d9d9d9",
                  borderRight: "1px solid #d9d9d9",
                }}
              >
                {quantityPay}
              </div>
              <button
                style={{
                  width: "32px",
                  height: "32px",
                  border: "none",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  ":hover": {
                    backgroundColor: "#e8e8e8",
                  },
                }}
                onClick={increaseQuantity}
              >
                <PlusOutlined />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
            <button
              style={{
                flex: 1,
                height: "48px",
                backgroundColor: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                ":hover": {
                  backgroundColor: "#40a9ff",
                },
              }}
              onClick={handleCheckout}
            >
              Mua ngay
            </button>
            <button
              style={{
                flex: 1,
                height: "48px",
                backgroundColor: "#fff",
                color: "#1890ff",
                border: "1px solid #1890ff",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                ":hover": {
                  backgroundColor: "#e6f7ff",
                },
              }}
              onClick={() => handleAddToCart(product)}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default productsComponent;
