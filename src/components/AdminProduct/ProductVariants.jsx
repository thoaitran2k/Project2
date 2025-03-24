const ProductVariants = ({ productType, variants, onChange }) => {
  const config = productTypeConfig[productType] || {};

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);
  };

  const addVariant = () => {
    const newVariant = { quantity: 0 };
    if (config.hasColor) newVariant.color = "";
    if (config.hasSize) newVariant.size = "";
    if (config.hasDiameter) newVariant.diameter = "";
    onChange([...variants, newVariant]);
  };

  const removeVariant = (index) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const productTypeConfig = {
    // Áo
    "Áo nam": {
      hasColor: true,
      hasSize: true,
      sizeType: "letter",
      hasDiameter: false,
    },
    "Áo nữ": {
      hasColor: true,
      hasSize: true,
      sizeType: "letter",
      hasDiameter: false,
    },

    // Quần
    "Quần nam": {
      hasColor: true,
      hasSize: true,
      sizeType: "number",
      hasDiameter: false,
    },
    "Quần nữ": {
      hasColor: true,
      hasSize: true,
      sizeType: "number",
      hasDiameter: false,
    },

    // Đồng hồ
    "Đồng hồ": { hasColor: true, hasSize: false, hasDiameter: true },

    // Phụ kiện (chỉ có số lượng)
    "Túi xách": { hasColor: false, hasSize: false, hasDiameter: false },
    "Trang sức": { hasColor: false, hasSize: false, hasDiameter: false },
    Ví: { hasColor: false, hasSize: false, hasDiameter: false },
  };

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
                options={colorOptions}
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
          {config.hasDiameter && (
            <Form.Item
              name={["variants", index, "diameter"]}
              rules={[{ required: true, message: "Vui lòng chọn đường kính!" }]}
            >
              <Select
                placeholder="Chọn đường kính"
                options={[
                  { label: "38mm", value: 38 },
                  { label: "40mm", value: 40 },
                  { label: "42mm", value: 42 },
                  { label: "44mm", value: 44 },
                ]}
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
              value={variant.quantity}
              onChange={(e) => updateVariant(index, "quantity", e.target.value)}
            />
          </Form.Item>

          <MinusCircleOutlined onClick={() => removeVariant(index)} />
        </Space>
      ))}

      <Button type="dashed" onClick={addVariant} block icon={<PlusOutlined />}>
        Thêm biến thể
      </Button>
    </>
  );
};

export default ProductVariants;
