import {
  Row,
  Col,
  Button,
  message,
  Modal,
  Radio,
  Space,
  Rate,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import imageProduct from "../../assets/aonam.jpg";
import imageSmallProduct from "../../assets/vi.jpg";
import { toggleLikeProduct } from "../../redux/slices/likeSlice";
import {
  CheckCircleOutlined,
  HeartFilled,
  HeartOutlined,
  InfoCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
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
import styled from "styled-components";

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
  const currentUser = useSelector((state) => state.user);
  const likedProductIds =
    useSelector((state) => state.like.likedProductIds) || [];

  const productInStore = useSelector((state) => {
    const products = state.product.products?.data || state.product.products;
    return Array.isArray(products)
      ? products.find((p) => p._id === product._id) || product
      : product;
  });

  const defaultAddress = address?.find((addr) => addr.isDefault) || null;
  const availablePantsSizes = product.variants.map((v) => Number(v.size));
  const availableShirtSizes = Array.isArray(product?.sizes)
    ? product.sizes
    : [];

  const [isLiked, setIsLiked] = useState(
    likedProductIds.includes(product?._id)
  );

  const [isSizeGuideVisible, setIsSizeGuideVisible] = useState(false);

  const handleLike = async (e, productId) => {
    e.stopPropagation();

    if (!currentUser) {
      return message.warning("Vui lòng đăng nhập để thích sản phẩm");
    }

    try {
      await dispatch(toggleLikeProduct({ productId })).unwrap();

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Lỗi khi like sản phẩm:", error);
    }
  };

  const likeCount = productInStore?.likeCount || 0;

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

  useEffect(() => {
    setIsLiked(likedProductIds.includes(product?._id));
  }, [likedProductIds, product?._id]);

  const renderSizeGuide = () => {
    if (product.type == "Áo nam" || product.type == "Áo nữ") {
      return (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1890ff", color: "white" }}>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  CHIỀU CAO
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  CÂN NẶNG
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  SIZE
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  DÀI ÁO
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  VAI
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  NGỰC
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  BỤNG
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  DÀI TAY
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Size S */}
              <tr>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M60 - 1M65
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  55-60kg
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  S (38)
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  69cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  44cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  95cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  88cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  19.5cm
                </td>
              </tr>

              {/* Size M */}
              <tr style={{ backgroundColor: "#f9f9f9" }}>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M66 - 1M69
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  60-65kg
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  M (40)
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  70cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  45cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  99cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  92cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  20cm
                </td>
              </tr>

              {/* Size L */}
              <tr>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M70 - 1M74
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  66-70kg
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  L (42)
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  71cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  46cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  103cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  96cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  20.5cm
                </td>
              </tr>

              {/* Size XL */}
              <tr style={{ backgroundColor: "#f9f9f9" }}>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M75 - 1M76
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  70-76kg
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  XL (44)
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  72cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  47cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  107cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  100cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  21cm
                </td>
              </tr>

              {/* Size 2XL */}
              <tr>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M76 - 1M80
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  76-80kg
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  2XL (46)
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  73cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  48cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  111cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  104cm
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  21.5cm
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              backgroundColor: "#e6f7ff",
              padding: "16px",
              borderRadius: "8px",
              borderLeft: "4px solid #1890ff",
              marginBottom: "16px",
            }}
          >
            <h4 style={{ color: "#1890ff", marginTop: 0 }}>
              LƯU Ý QUAN TRỌNG:
            </h4>
            <p style={{ marginBottom: "8px" }}>
              <strong>
                Trường hợp số đo của bạn nằm trong khoảng giữa các size:
              </strong>{" "}
              Với áo sơ mi slimfit tay ngắn, hãy ưu tiên chọn theo{" "}
              <strong>CHIỀU CAO</strong>.
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>Ví dụ:</strong> Chiều cao của bạn theo size L (1M70-1M74)
              nhưng cân nặng theo size M (60-65kg) → Hãy chọn{" "}
              <strong>size L</strong>.
            </p>
          </div>

          <div
            style={{
              textAlign: "center",
              backgroundColor: "#f6ffed",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #b7eb8f",
            }}
          >
            <p style={{ margin: 0, fontWeight: 500, color: "#389e0d" }}>
              <CheckCircleOutlined
                style={{ marginRight: "8px", color: "#52c41a" }}
              />
              97% khách hàng đã chọn đúng size khi áp dụng hướng dẫn này
            </p>
          </div>
        </>
      );
    } else if (product.type == "Quần nam" || product.type == "Quần nữ") {
      return (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              fontSize: "15px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#1890ff",
                  color: "white",
                  fontWeight: 500,
                }}
              >
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  CHIỀU CAO
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  CÂN NẶNG (KG)
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  SIZE
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  DÀI QUẦN (CM)
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  BỤNG (CM)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Size 29 */}
              <tr>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M60 - 1M65
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  53-58
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  28
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  100
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  75
                </td>
              </tr>

              {/* Size 30 */}
              <tr style={{ backgroundColor: "#fafafa" }}>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M66 - 1M70
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  59-63
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  29
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  100.5
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  78
                </td>
              </tr>

              {/* Size 31 */}
              <tr>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M71 - 1M75
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  64-68
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  30
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  101
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  80
                </td>
              </tr>

              {/* Size 32 */}
              <tr style={{ backgroundColor: "#fafafa" }}>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M76 - 1M80
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  69-73
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  31
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  101.5
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  83
                </td>
              </tr>
              {/* Size 32 */}
              <tr>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  1M81 - 1M85
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  74-78
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: "bold",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  32
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  102
                </td>
                <td
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  85
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              backgroundColor: "#e6f7ff",
              padding: "16px",
              borderRadius: "8px",
              borderLeft: "4px solid #1890ff",
              marginBottom: "16px",
              fontSize: "15px",
            }}
          >
            <h4
              style={{ color: "#1890ff", marginTop: 0, marginBottom: "12px" }}
            >
              <InfoCircleOutlined style={{ marginRight: "8px" }} />
              HƯỚNG DẪN CHỌN SIZE
            </h4>
            <p style={{ marginBottom: "8px" }}>
              <strong>Trường hợp số đo của bạn nằm giữa các size:</strong> Với
              quần âu regular, hãy ưu tiên chọn theo <strong>CHIỀU CAO</strong>.
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>Ví dụ:</strong> Chiều cao 1M72 (size 30) nhưng cân nặng
              62kg (size 30) → Chọn <strong>size 30</strong>.
            </p>
          </div>

          <div
            style={{
              textAlign: "center",
              backgroundColor: "#f6ffed",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #b7eb8f",
              fontSize: "15px",
            }}
          >
            <p style={{ margin: 0, fontWeight: 500, color: "#389e0d" }}>
              <CheckCircleOutlined
                style={{ marginRight: "8px", color: "#52c41a" }}
              />
              97% khách hàng đã chọn đúng size khi áp dụng hướng dẫn này
            </p>
          </div>
        </>
      );
    } else if (product.type == "Đồng hồ") {
      return (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              fontSize: "14px",
              minWidth: "750px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#1890ff",
                  color: "white",
                  fontWeight: 500,
                }}
              >
                <th
                  rowSpan="2"
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    width: "120px",
                  }}
                >
                  CỔ TAY (mm)
                </th>
                <th
                  colSpan="6"
                  style={{
                    padding: "12px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  ĐƯỜNG KÍNH ĐỒNG HỒ (cm/mm)
                </th>
              </tr>
              <tr style={{ backgroundColor: "#1890ff", color: "white" }}>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  13cm
                  <br />
                  130mm
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  13.5cm
                  <br />
                  135mm
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  14cm
                  <br />
                  140mm
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  14.5cm
                  <br />
                  145mm
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  15cm
                  <br />
                  150mm
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  15.5cm
                  <br />
                  155mm
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Hàng chú thích */}
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  Chú thích:
                </td>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  Quá nhỏ
                </td>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  Hơi nhỏ
                </td>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  Tối ưu
                </td>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  Hơi lớn
                </td>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  Quá lớn
                </td>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #e8e8e8",
                    textAlign: "center",
                  }}
                >
                  Rất lớn
                </td>
              </tr>

              {/* Các dòng size */}
              {[
                20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50,
              ].map((size) => (
                <tr
                  key={size}
                  style={{
                    backgroundColor: size % 4 === 0 ? "#fafafa" : "white",
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #e8e8e8",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {size}mm
                  </td>
                  {[130, 135, 140, 145, 150, 155].map((diameter) => {
                    let icon = "";
                    let color = "";

                    // Logic xác định icon theo size cổ tay và đường kính
                    if (size === 26 && diameter <= 140) icon = "•";
                    else if (size === 28 && diameter <= 135) icon = "✓";
                    else if (size === 30 && diameter <= 140) icon = "✓";
                    else if (size === 32 && diameter >= 140 && diameter <= 150)
                      icon = "✓";
                    else if (size === 34 && diameter >= 145) icon = "✓";
                    else if (size === 36 && diameter >= 150) icon = "●";
                    else if (size >= 38) icon = "❌";

                    if (icon === "✓") color = "#52c41a"; // Xanh lá - Tối ưu
                    else if (icon === "•") color = "#faad14"; // Vàng - Vừa phải
                    else if (icon === "●") color = "#ffa940"; // Cam - Hơi lớn
                    else if (icon === "❌") color = "#ff4d4f"; // Đỏ - Quá lớn
                    else if (icon === "<") color = "#8c8c8c"; // Xám - Quá nhỏ

                    return (
                      <td
                        key={diameter}
                        style={{
                          padding: "12px",
                          border: "1px solid #e8e8e8",
                          textAlign: "center",
                          color: color,
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {icon || ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
  };

  return (
    <Row
      style={{
        padding: "15px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        maxWidth: "1280px",
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* Image Gallery Column */}
      <Col xs={24} sm={24} md={10} lg={10} xl={10}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            position: "sticky",
            top: "24px",
          }}
        >
          {/* Main Image Preview */}
          <div
            style={{
              width: "100%",
              aspectRatio: "1/1",
              backgroundColor: "#fafafa",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              border: "1px solid #f0f0f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <img
              src={imageList[selectedImageIndex]}
              alt="Product preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                maxHeight: "500px",
                transition: "opacity 0.3s ease",
              }}
            />
          </div>

          {/* Thumbnail Gallery */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px 0",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {imageList.slice(0, 5).map((image, index) => (
              <div
                key={index}
                style={{
                  width: "72px",
                  height: "72px",
                  minWidth: "72px",
                  borderRadius: "8px",
                  border:
                    selectedImageIndex === index
                      ? "2px solid #1890ff"
                      : "1px solid #e8e8e8",
                  cursor: "pointer",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  transition: "all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)",
                  boxShadow:
                    selectedImageIndex === index
                      ? "0 2px 8px rgba(24, 144, 255, 0.2)"
                      : "none",
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
        <div style={{ padding: "0 24px" }}>
          {/* Product Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 600,
                marginBottom: "12px",
                color: "#222",
                lineHeight: 1.3,
              }}
            >
              {product?.name}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#fff8e6",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                <Rate
                  disabled
                  value={rating}
                  allowHalf
                  style={{ fontSize: "16px", color: "#faad14" }}
                />
                <span
                  style={{
                    marginLeft: "8px",
                    color: "#666",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  ({rating.toFixed(1)})
                </span>
              </div>
              <Divider
                type="vertical"
                style={{ height: "20px", margin: "0" }}
              />
              <span style={{ color: "#666", fontSize: "14px" }}>
                <strong style={{ color: "#222" }}>{product.selled || 0}</strong>{" "}
                đã bán
              </span>
              <Divider
                type="vertical"
                style={{ height: "20px", margin: "0" }}
              />
              <Button
                type="text"
                icon={
                  isLiked ? (
                    <HeartFilled style={{ color: "#ff4d4f" }} />
                  ) : (
                    <HeartOutlined style={{ color: "#666" }} />
                  )
                }
                onClick={(e) => handleLike(e, product._id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 8px",
                }}
              >
                <span
                  style={{
                    color: isLiked ? "#ff4d4f" : "#666",
                    fontSize: "14px",
                    marginLeft: "4px",
                  }}
                >
                  {likeCount}{" "}
                </span>
              </Button>
            </div>
          </div>

          {/* Price Section */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#d32f2f",
                  lineHeight: 1,
                }}
              >
                {product?.price.toLocaleString("vi-VN")}₫
              </span>
              {product?.oldPrice && (
                <span
                  style={{
                    fontSize: "18px",
                    color: "#999",
                    textDecoration: "line-through",
                  }}
                >
                  {product.oldPrice.toLocaleString("vi-VN")}₫
                </span>
              )}
              {product?.discount && (
                <span
                  style={{
                    backgroundColor: "#ccc",
                    color: "black",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  -{product.discount}%
                </span>
              )}
            </div>
            {product?.prime && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "#e6f7ff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  marginTop: "8px",
                }}
              >
                <CheckCircleFilled
                  style={{ color: "#1890ff", marginRight: "4px" }}
                />
                <span style={{ color: "#1890ff", fontSize: "14px" }}>
                  Prime
                </span>
              </div>
            )}
          </div>

          {/* Shipping Info */}
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <TruckOutlined style={{ color: "#666", marginRight: "8px" }} />
              <span style={{ color: "#666", fontSize: "14px" }}>
                Giao đến{" "}
                <strong style={{ color: "#222" }}>{getDisplayAddress()}</strong>
              </span>
            </div>
            <Button
              type="link"
              onClick={
                defaultAddress
                  ? showAddressModal
                  : () => navigate("/profile/address")
              }
              style={{
                padding: 0,
                height: "auto",
                color: "#1890ff",
                fontSize: "14px",
              }}
            >
              {defaultAddress ? "Đổi địa chỉ" : "Thêm địa chỉ"}
            </Button>
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: "28px" }}>
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "16px",
                fontWeight: 500,
                color: "#222",
              }}
            >
              Màu sắc
            </h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {uniqueColors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
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
                    boxShadow:
                      selectedColor === color
                        ? "0 2px 8px rgba(24, 144, 255, 0.3)"
                        : "none",
                    transform: selectedColor === color ? "scale(1.05)" : "none",
                  }}
                  onClick={() => handleColorSelect(color)}
                >
                  {selectedColor === color && (
                    <CheckOutlined
                      style={{
                        color: "#fff",
                        fontSize: "16px",
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#222",
                  margin: 0,
                }}
              >
                {isWatch ? "Đường kính" : "Kích thước"}
              </h3>
              <Button
                type="link"
                style={{
                  padding: 0,
                  height: "auto",
                  fontSize: "14px",
                }}
                onClick={() => setIsSizeGuideVisible(true)}
              >
                Hướng dẫn chọn size
              </Button>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
                      minWidth: "60px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: isSelected ? "#1890ff" : "#d9d9d9",
                      backgroundColor: isSelected ? "#e6f7ff" : "#fff",
                      color: isSelected
                        ? "#1890ff"
                        : isAvailable
                        ? "#333"
                        : "#999",
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      opacity: isAvailable ? 1 : 0.7,
                      transition: "all 0.2s",
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: "14px",
                      outline: "none",
                      boxShadow: isSelected
                        ? "0 2px 8px rgba(24, 144, 255, 0.2)"
                        : "none",
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
                marginBottom: "16px",
                fontWeight: 500,
                color: "#222",
              }}
            >
              Số lượng
            </h3>
            <div
              style={{
                display: "inline-flex",
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                overflow: "hidden",
                height: "40px",
              }}
            >
              <button
                style={{
                  width: "40px",
                  height: "100%",
                  border: "none",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "background-color 0.2s",
                  ":hover": {
                    backgroundColor: "#e8e8e8",
                  },
                }}
                onClick={decreaseQuantity}
              >
                <MinusOutlined style={{ fontSize: "14px", color: "#666" }} />
              </button>
              <div
                style={{
                  width: "60px",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderLeft: "1px solid #d9d9d9",
                  borderRight: "1px solid #d9d9d9",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                {quantityPay}
              </div>
              <button
                style={{
                  width: "40px",
                  height: "100%",
                  border: "none",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "background-color 0.2s",
                  ":hover": {
                    backgroundColor: "#e8e8e8",
                  },
                }}
                onClick={increaseQuantity}
              >
                <PlusOutlined style={{ fontSize: "14px", color: "#666" }} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
            <Button
              type="primary"
              size="large"
              style={{
                flex: 1,
                height: "52px",
                fontSize: "16px",
                fontWeight: 500,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
              }}
              onClick={handleCheckout}
            >
              Mua ngay
            </Button>
            <Button
              size="large"
              style={{
                flex: 1,
                height: "52px",
                fontSize: "16px",
                fontWeight: 500,
                borderRadius: "8px",
                borderColor: "#1890ff",
                color: "#1890ff",
                background: "#fff",
              }}
              onClick={() => handleAddToCart(product)}
            >
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </Col>

      <StyledModal
        title="BẢNG HƯỚNG DẪN CHỌN SIZE"
        open={isSizeGuideVisible}
        onCancel={() => setIsSizeGuideVisible(false)}
        footer={null}
        width={800}
      >
        {renderSizeGuide()}
      </StyledModal>
    </Row>
  );
};

const StyledModal = styled(Modal)`
  .ant-modal-title {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  }

  table {
    margin: 16px 0;

    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    td,
    th {
      text-align: center;
    }
  }

  .ant-modal-body {
    max-height: 70vh;
    overflow-y: auto;
  }
`;

export default productsComponent;
