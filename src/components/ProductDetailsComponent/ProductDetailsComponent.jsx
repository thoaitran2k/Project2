import { Row, Col, Image, Breadcrumb } from "antd";
import React, { useState } from "react";
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
import { addToCart } from "../../redux/slices/cartSlice";
import { useLocation, useNavigate } from "react-router";

const ProductDetailsComponent = ({ product }) => {
  const colorMap = {
    Hồng: "#FF69B4",
    Nâu: "#8B4513",
    Đen: "#000000",
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
  const allSizes = ["S", "M", "L", "XL", "XXL"];
  const watchDiameters = [38, 39, 40, 41, 42];

  const availableSizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const address = useSelector((state) => state.user.address);
  const productDetail = useSelector(
    (state) => state.product.productDetail.data
  );
  const defaultAddress = address?.find((addr) => addr.isDefault) || null;

  const navigate = useNavigate();
  const location = useLocation();

  // console.log("product", product);
  const uniqueColors = [
    ...new Set(product.variants?.map((variant) => variant.color)),
  ];

  console.log("ProductDetails", productDetail);
  const isWatch = productDetail?.type === "Đồng hồ";

  const handleAddToCart = () => {
    if (!user.isAuthenticated) {
      alert("Bạn phải đăng nhập để mua hàng");
      navigate("/sign-in", { state: { from: location.pathname } });
      return;
    }

    if (!productDetail || !productDetail._id) {
      console.error("❌ Lỗi: Không có sản phẩm hợp lệ", productDetail);
      return;
    }

    // Xác định loại sản phẩm
    const isClothing = ["Áo nam", "Áo nữ"].includes(productDetail.type);
    const isPants = ["Quần nam", "Quần nữ"].includes(productDetail.type);
    const isWatch = productDetail.type === "Đồng hồ";
    const isAccessory = ["Trang sức", "Ví", "Túi xách"].includes(
      productDetail.type
    );

    // Kiểm tra điều kiện bắt buộc theo loại sản phẩm
    if (isClothing || isPants) {
      if (productDetail.sizes?.length > 0 && !selectedSize) {
        alert("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!");
        return;
      }

      if (productDetail.colors?.length > 0 && !selectedColor) {
        alert("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng!");
        return;
      }
    }

    if (isWatch) {
      if (productDetail.variants?.length > 0 && !selectedColor) {
        alert("Vui lòng chọn màu sắc cho đồng hồ!");
        return;
      }
    }

    // Tạo item giỏ hàng với amount (mặc định = 1)
    const itemToAdd = {
      product: {
        _id: productDetail._id,
        name: productDetail.name,
        image: productDetail.image,
        price: productDetail.price,
        type: productDetail.type,
      },
      quantity: quantityPay,
      amount: 1, // Mặc định tính 1 vào cartCount

      // Xử lý theo từng loại sản phẩm
      ...(isClothing && {
        size: selectedSize,
        color: selectedColor,
        variant: productDetail.variants?.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        ),
      }),

      ...(isPants && {
        size: selectedSize, // Đây là số (ví dụ: 28, 30, 32)
        color: selectedColor,
        variant: productDetail.variants?.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        ),
      }),

      ...(isWatch && {
        diameter: productDetail.diameter,
        color: selectedColor, // Lấy từ variants
        variant: productDetail.variants?.find((v) => v.color === selectedColor),
      }),

      // Phụ kiện không cần thêm thông tin gì đặc biệt
    };

    // Kiểm tra tồn kho
    if (productDetail.countInStock < quantityPay) {
      alert(
        `Số lượng tồn kho không đủ! Chỉ còn ${productDetail.countInStock} sản phẩm`
      );
      return;
    }

    // Kiểm tra tồn kho variant nếu có
    if (itemToAdd.variant && itemToAdd.variant.quantity < quantityPay) {
      alert(
        `Số lượng tồn kho cho biến thể này không đủ! Chỉ còn ${itemToAdd.variant.quantity} sản phẩm`
      );
      return;
    }

    // Đặc biệt: Nếu là phụ kiện, có thể điều chỉnh amount theo quantity
    if (isAccessory) {
      itemToAdd.amount = quantityPay; // Tính mỗi sản phẩm là 1 vào cartCount
    }

    dispatch(addToCart(itemToAdd));
    // alert("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const increaseQuantity = () =>
    setQuantityPay((prev) => Math.min(prev + 1, 10));
  const decreaseQuantity = () =>
    setQuantityPay((prev) => Math.max(prev - 1, 1));

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
    product?.image || imagesPreview[0] || imageProduct, // Ảnh chính (fallback nếu không có)
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
          -<span className="change-address"> Đổi địa chỉ</span>
        </WrapperAdressProduct>

        <WrapperQualityProduct>
          {/* Chọn màu sắc */}
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
                  }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          {/* Chọn size */}
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
                {watchDiameters.map((diameter, index) => (
                  <WrapperSizeButton
                    key={index}
                    className={selectedSize === diameter ? "selected" : ""}
                    onClick={() => setSelectedSize(diameter)}
                  >
                    {diameter}mm
                  </WrapperSizeButton>
                ))}
              </WrapperSizeOptions>
            ) : (
              <WrapperSizeOptions>
                {allSizes.map((size, index) => {
                  const isAvailable = availableSizes.includes(size);
                  return (
                    <WrapperSizeButton
                      key={index}
                      className={selectedSize === size ? "selected" : ""}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
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
          <StyledButton primary textButton="Chọn mua" />
          <StyledButton
            textButton="Thêm vào giỏ hàng"
            onClick={() => handleAddToCart(productDetail)}
          />
        </div>
      </Col>
    </Row>
  );
};

export default ProductDetailsComponent;
