import { productTypeConfig, defaultConfig } from "./configs/productConfig";
import { Button, Form, Input, Space, Select } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const ProductVariants = ({
  productType,
  variants,
  onChange,
  onUpdateDiameter,
}) => {
  const config = productTypeConfig[productType] || defaultConfig;

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);

    // Nếu đang cập nhật đường kính, cập nhật danh sách diameter chung
    if (field === "diameter") {
      const uniqueDiameters = [
        ...new Set(newVariants.map((v) => v.diameter).filter(Boolean)),
      ];
      onUpdateDiameter(uniqueDiameters);
    }
  };

  const addVariant = () => {
    const newVariant = { quantity: 0 };
    if (config.hasColor) newVariant.color = "";
    if (config.hasSize) newVariant.size = "";
    if (config.hasDiameter) newVariant.diameter = null;

    onChange([...variants, newVariant]);
  };

  const sizeOptions = [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ];

  return (
    <>
      {variants.map((variant, index) => (
        <Space key={index} style={{ marginBottom: 8 }}>
          {/* Color Selector */}
          {config.hasColor && (
            <Form.Item
              name={["variants", index, "color"]}
              rules={[{ required: true, message: "Vui lòng chọn màu!" }]}
            >
              <Select
                placeholder="Chọn màu"
                options={config.colorOptions.map((color) => ({
                  label: color,
                  value: color,
                }))}
                value={variant.color}
                onChange={(value) => updateVariant(index, "color", value)}
              />
            </Form.Item>
          )}

          {/* Size Selector */}
          {config.hasSize && (
            <Form.Item
              name={["variants", index, "size"]}
              rules={[{ required: true, message: "Vui lòng chọn size!" }]}
            >
              <Select
                placeholder="Chọn size"
                options={
                  config.sizeType === "letter"
                    ? sizeOptions
                    : [
                        { label: "28", value: 28 },
                        { label: "29", value: 29 },
                        { label: "30", value: 30 },
                        { label: "31", value: 31 },
                        { label: "32", value: 32 },
                      ]
                }
                value={variant.size}
                onChange={(value) => updateVariant(index, "size", value)}
              />
            </Form.Item>
          )}

          {/* Diameter Selector */}
          {config.hasDiameter && config.diameterOptions && (
            <Form.Item
              name={["variants", index, "diameter"]}
              rules={[{ required: true, message: "Vui lòng chọn đường kính!" }]}
            >
              <Select
                placeholder="Chọn mặt"
                options={config.diameterOptions.map((diameter) => ({
                  label: `${diameter}mm`,
                  value: diameter,
                }))} // 🔍 Kiểm tra config.diameterOptions
                value={variant.diameter}
                onChange={(value) => updateVariant(index, "diameter", value)}
              />
            </Form.Item>
          )}

          {/* Quantity Input */}
          <Form.Item
            name={["variants", index, "quantity"]}
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <Input
              placeholder="Số lượng"
              type="number"
              min={1}
              value={variant.quantity}
              onChange={(e) =>
                updateVariant(index, "quantity", Number(e.target.value))
              }
            />
          </Form.Item>

          <MinusCircleOutlined
            onClick={() => {
              const newVariants = variants.filter((_, i) => i !== index);
              onChange(newVariants);
              // Cập nhật danh sách đường kính chung
              const uniqueDiameters = [
                ...new Set(newVariants.map((v) => v.diameter).filter(Boolean)),
              ];
              onUpdateDiameter(uniqueDiameters);
            }}
          />
        </Space>
      ))}

      <Button type="dashed" onClick={addVariant} block icon={<PlusOutlined />}>
        Thêm biến thể
      </Button>
    </>
  );
};

export default ProductVariants;
