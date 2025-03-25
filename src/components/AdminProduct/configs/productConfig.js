export const productTypeConfig = {
  "Áo nam": {
    hasColor: true,
    hasSize: true,
    sizeType: "letter",
    hasDiameter: false,
    colorOptions: ["Hồng", "Nâu", "Đen", "Trắng", "Xanh dương"],
  },
  "Áo nữ": {
    hasColor: true,
    hasSize: true,
    sizeType: "letter",
    hasDiameter: false,
    colorOptions: ["Hồng", "Nâu", "Đen", "Trắng", "Xanh dương"],
  },
  "Quần nam": {
    hasColor: true,
    hasSize: true,
    sizeType: "number",
    hasDiameter: false,
    colorOptions: ["Xanh lá", "Trắng", "Nâu", "Đen", "Xanh dương", "Vàng"],
  },
  "Quần nữ": {
    hasColor: true,
    hasSize: true,
    sizeType: "number",
    hasDiameter: false,
    colorOptions: ["Xanh lá", "Trắng", "Nâu", "Đen", "Xanh dương", "Vàng"],
  },
  "Đồng hồ": {
    hasColor: true,
    hasSize: false,
    hasDiameter: true,
    colorOptions: ["Đen", "Trắng"],
  },
  "Túi xách": { hasColor: false, hasSize: false, hasDiameter: false },
  "Trang sức": { hasColor: false, hasSize: false, hasDiameter: false },
  Ví: { hasColor: false, hasSize: false, hasDiameter: false },
};

// Nếu sản phẩm mới không có trong danh sách, dùng cấu hình mặc định
export const defaultConfig = {
  hasColor: false,
  hasSize: false,
  hasDiameter: false,
  colorOptions: [],
};

export const getAllColorOptions = () => {
  const colors = new Set();
  Object.values(productTypeConfig).forEach((config) => {
    if (config.colorOptions) {
      config.colorOptions.forEach((color) => colors.add(color));
    }
  });
  return Array.from(colors).map((color) => ({
    value: color.toLowerCase(),
    label: color,
  }));
};

export const colorOptions = getAllColorOptions();
