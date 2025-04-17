import { Row, Col, Image, Breadcrumb, message } from "antd";
import React, { useEffect, useState } from "react";
import imageProduct from "../../assets/aonam.jpg";
import imageSmallProduct from "../../assets/vi.jpg";
import { PlusOutlined, StarFilled, MinusOutlined } from "@ant-design/icons";
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

  const navigate = useNavigate();
  const location = useLocation();

  const isWatch = product?.type === "Đồng hồ";

  const uniqueColors = [
    ...new Set(product.variants?.map((variant) => variant.color)),
  ];

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
      navigate("/sign-in", { state: { from: "/checkout" } });
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
    const id = [product._id, selectedSize, selectedColor, selectedDiameter]
      .filter(Boolean)
      .join("-");

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

    navigate("/checkout", {
      state: {
        selectedItems: [checkoutItem],
        total: product.price * quantityPay,
        discount: (product.price * (product.discount || 0) * quantityPay) / 100,
        selectedAddress:
          user.address?.find((addr) => addr.isDefault) || user.address?.[0],
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
    if (partialStar >= 0.75) return 100; // >= 75% -> 100%
    if (partialStar >= 0.5) return 50; // >= 50% -> 50%
    if (partialStar >= 0.25) return 25; // >= 25% -> 25%
    return 0; // < 25% -> 0%
  };

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const defaultImages = [
    imageProduct,
    imageSmallProduct,
    "https://res-console.cloudinary.com/dxwqi77i8/thumbnails/v1/image/upload/v1742212680/YXZhdGFycy9tem9neWl2b2dtY2tnZXd1bmNneg==/drilldown",
    "https://res.cloudinary.com/dxwqi77i8/image/upload/v1742212842/avatars/clpwb1rpi1u5vptyyb2n.webp",
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
    <Row style={{ padding: "16px", background: "rgba(224, 221, 221, 0.27)" }}>
      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
        {/* Ảnh lớn hiển thị theo ảnh nhỏ được chọn */}
        <StyledImagePreview
          className="custom-image-preview"
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "400px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            objectFit: "contain",
            backgroundColor: "#f5f5f5",
          }}
          src={imageList[selectedImageIndex]}
          alt="image product"
          preview={true}
        />
        <Row
          style={{
            border: "3px solid #ccc",
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "row",
            justifyContent: imageList.length < 5 ? "flex-start" : "center", // Thay đổi căn chỉnh tùy số lượng ảnh
            background: "#fff",
            marginTop: "16px",
            gap: imageList.length < 5 ? "0px" : "18px", // Loại bỏ gap nếu có ít hơn 5 ảnh
            padding: "8px",
            overflow: "hidden", // Đảm bảo không có tràn khi không có gap
          }}
        >
          {imageList.slice(0, 5).map((image, index) => (
            <WrapperStyleImage
              key={index}
              style={{
                flex: imageList.length < 5 ? "none" : "1", // Không flex nếu ít hơn 5 ảnh
                textAlign: "center",
                marginRight: imageList.length < 5 ? "0px" : "0", // Loại bỏ margin nếu ít hơn 5 ảnh
              }}
            >
              <WrapperStyleImageSmall
                src={image}
                alt="image small product"
                preview={{ mask: false }}
                onMouseEnter={() => setSelectedImageIndex(index)}
                onClick={() => setSelectedImageIndex(index)}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "8px",
                  border:
                    selectedImageIndex === index ? "2px solid red" : "none",
                  cursor: "pointer",
                }}
              />
            </WrapperStyleImage>
          ))}
        </Row>
      </Col>

      <Col xs={24} sm={24} md={14} lg={14} xl={14} style={{ padding: "16px" }}>
        <WrapperStyleNameProduct>{product?.name}</WrapperStyleNameProduct>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              lineHeight: "16px",
            }}
          >
            {/* Hiển thị các sao đầy */}
            {[...Array(fullStars)].map((_, index) => (
              <StarFilled
                key={index}
                style={{
                  fontSize: "16px",
                  color: "rgb(253,216,54)",
                  verticalAlign: "middle",
                }}
              />
            ))}

            {/* Hiển thị phần sao chưa đầy */}
            {partialStar > 0 && (
              <div
                style={{
                  position: "relative",
                  width: "16px",
                  height: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  verticalAlign: "middle",
                }}
              >
                {/* Sao nền (màu xám) */}
                <StarFilled
                  style={{
                    fontSize: "16px",
                    color: "#ccc",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                {/* Sao vàng (phần được tô) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${partialStarWidth}%`,
                    overflow: "hidden",
                  }}
                >
                  <StarFilled
                    style={{
                      fontSize: "16px",
                      color: "rgb(253,216,54)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Hiển thị các sao trống */}
            {[...Array(5 - fullStars - (partialStar > 0 ? 1 : 0))].map(
              (_, index) => (
                <StarFilled
                  key={index}
                  style={{
                    fontSize: "16px",
                    color: "#ccc",
                    verticalAlign: "middle",
                  }}
                />
              )
            )}
          </div>
          <WrapperStyleTextSell>
            {" "}
            | Đã bán {product.selled}
          </WrapperStyleTextSell>
        </div>

        <WrapperStylePriceProduct>
          <WrapperStylePriceTextProduct>
            {product?.price.toLocaleString("vi-VN")} VNĐ
          </WrapperStylePriceTextProduct>
        </WrapperStylePriceProduct>

        <WrapperAdressProduct>
          <span>Giao đến </span>
          <span className="address">
            {defaultAddress
              ? defaultAddress.address
              : "Chưa có địa chỉ mặc định"}
          </span>{" "}
          -<span className="change-address"> Địa chỉ mặc định</span>
        </WrapperAdressProduct>

        <WrapperQualityProduct>
          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                fontWeight: "300",
                fontSize: "20px",
                marginBottom: "10px",
              }}
            >
              Chọn màu sắc:
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {uniqueColors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: colorMap[color],
                    borderRadius: "50%",
                    cursor: "pointer",
                    border:
                      selectedColor === color
                        ? "2px solid black"
                        : "1px solid #ccc",
                    opacity: selectedColor === color ? 1 : 0.8,
                    transition: "all 0.2s",
                  }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                fontWeight: "300",
                fontSize: "20px",
                marginBottom: "10px",
              }}
            >
              {isWatch ? "Chọn đường kính:" : "Chọn size:"}
            </div>

            {isWatch ? (
              <WrapperSizeOptions>
                {watchDiameters.map((d, index) => {
                  const isAvailable = product.diameter?.includes(d);
                  return (
                    <WrapperSizeButton
                      key={index}
                      className={selectedDiameter === d ? "selected" : ""}
                      onClick={() => isAvailable && handleDiameterSelect(d)}
                      disabled={!isAvailable}
                      style={{
                        opacity: isAvailable
                          ? selectedDiameter === d
                            ? 1
                            : 0.8
                          : 0.5,
                        backgroundColor:
                          selectedDiameter === d ? "white" : "white",
                        color: selectedDiameter === d ? "black" : "inherit",
                      }}
                    >
                      {d}mm
                    </WrapperSizeButton>
                  );
                })}
              </WrapperSizeOptions>
            ) : (
              <WrapperSizeOptions>
                {displaySizes.map((size, index) => {
                  const isAvailable = availableSizeSet.has(size);
                  return (
                    <WrapperSizeButton
                      key={index}
                      className={selectedSize === size ? "selected" : ""}
                      onClick={() => isAvailable && handleSizeSelect(size)}
                      disabled={!isAvailable}
                      style={{
                        opacity: isAvailable
                          ? selectedSize === size
                            ? 1
                            : 0.8
                          : 0.5,
                        backgroundColor:
                          selectedSize === size ? "white" : "white",
                        color: selectedSize === size ? "black " : "inherit",
                      }}
                    >
                      {size}
                    </WrapperSizeButton>
                  );
                })}
              </WrapperSizeOptions>
            )}
          </div>
          <div
            style={{
              fontWeight: "300",
              fontSize: "20px",
              marginBottom: "10px",
              marginTop: "25px",
            }}
          >
            Số lượng:
          </div>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              flexDirection: "row",
              border: "1px solid #ccc",
              alignItems: "center",
              padding: "5px",
              borderRadius: "7px",
            }}
          >
            <MinusOutlined
              onClick={decreaseQuantity}
              style={{
                fontSize: "16px",
                padding: "5px",
                cursor: "pointer",
                userSelect: "none",
              }}
            />
            <span
              style={{
                width: "40px",
                height: "20px",
                textAlign: "center",
                border: "none",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {quantityPay}
            </span>
            <PlusOutlined
              onClick={increaseQuantity}
              style={{
                fontSize: "16px",
                padding: "5px",
                cursor: "pointer",
                userSelect: "none",
              }}
            />
          </div>
        </WrapperQualityProduct>
        <div
          style={{
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
            margin: "30px 0",
          }}
        >
          <StyledButton textButton="Chọn mua" onClick={handleCheckout} />
          <StyledButton
            textButton="Thêm vào giỏ hàng"
            onClick={() => handleAddToCart(product)}
          />
        </div>
      </Col>
    </Row>
  );
};

export default productsComponent;
