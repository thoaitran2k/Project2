import React from "react";
import { Input } from "antd";

const InputComponent = ({
  type = "text",
  size,
  placeholder,
  bordered,
  style,
  ...rests
}) => {
  if (type === "checkbox") {
    return (
      <input
        type="checkbox"
        style={{ width: "16px", height: "16px" }}
        {...rests}
      />
    );
  }

  return (
    <Input
      size={size}
      placeholder={placeholder}
      bordered={bordered}
      style={style}
      {...rests}
    />
  );
};

export default InputComponent;
