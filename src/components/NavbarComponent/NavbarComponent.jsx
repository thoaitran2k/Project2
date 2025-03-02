import React from "react";
import { Checkbox, Rate } from "antd";
import { WrapperLableText, WrapperContent, WrapperTextPrice } from "./style";

const NavbarComponent = () => {
  const onChange = () => {};

  const renderContent = (type, options) => {
    switch (type) {
      case "text":
        return options.map((option, index) => <h3 key={index}>{option}</h3>);
      case "checkbox":
        return (
          <Checkbox.Group
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "13px",
            }}
            onChange={onChange}
          >
            {options.map((option) => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );
      case "star":
        return options.map((option, index) => (
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <Rate
              style={{ fontSize: "15px" }}
              key={index}
              disabled
              defaultValue={option}
            />
            <span> {`từ ${option} sao`}</span>
          </div>
        ));
      case "price":
        return options.map((option, index) => (
          <WrapperTextPrice key={index}>{option}</WrapperTextPrice>
        ));
      default:
        return null;
    }
  };

  return (
    <div>
      <WrapperLableText />
      <WrapperContent>
        {renderContent("text", [
          "Đồ Nam",
          "Đồ Nữ",
          "Trang sức Nữ",
          "Đồng hồ",
          "Ví da",
          "Túi xách",
        ])}
      </WrapperContent>
      <br />
      <br />
      <WrapperContent>
        {renderContent("checkbox", [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
          { value: "c", label: "C" },
        ])}
      </WrapperContent>
      <br />
      <br />
      <WrapperContent>{renderContent("star", [3, 4, 5])}</WrapperContent>
      <br />
      <br />
      <WrapperContent>
        {renderContent("price", [
          "dưới 400.0000",
          "từ 400.000 đến dưới 1.000.000",
          "trên 1.000.0000",
        ])}
      </WrapperContent>
    </div>
  );
};

export default NavbarComponent;
