import { Button } from "antd";
import React from "react";

const ButtonComponent = ({ className, textButton, type, size, ...rests }) => {
  console.log("ClassName:", className); // Kiểm tra className
  return (
    <Button className={className} type={type} size={size} {...rests}>
      {textButton}
    </Button>
  );
};

export default ButtonComponent;
