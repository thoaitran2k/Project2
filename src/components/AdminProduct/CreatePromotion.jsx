import React, { useState } from "react";
import {
  Input,
  Button,
  Select,
  Form,
  message,
  DatePicker,
  Row,
  Col,
} from "antd";
import styled from "styled-components";
import axios from "axios";
import dayjs from "dayjs";

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
`;

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 16px;
`;

const StyledButton = styled(Button)`
  width: 100%;
  background-color: #007bff;
  color: white;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
`;

const CreatePromotion = () => {
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent",
    discountValue: 0,
    minOrderValue: 0,
    appliesTo: "all",
    targetIds: [],
    maxUsage: 0,
    expiredAt: null,
  });

  const [apiMessage, setApiMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    //e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3002/api/product/create-promotion",
        formData
      );
      setApiMessage(response.data.message);
      message.success(response.data.message);
    } catch (error) {
      setApiMessage(
        error.response ? error.response.data.message : "Lỗi server"
      );
      message.error(
        error.response ? error.response.data.message : "Lỗi server"
      );
    }
  };

  return (
    <Container>
      <Title>Tạo Mã Giảm Giá</Title>

      <Form onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <StyledFormItem label="Mã Giảm Giá" required>
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </StyledFormItem>
          </Col>

          <Col xs={24} sm={12}>
            <StyledFormItem label="Loại Giảm Giá" required>
              <Select
                name="discountType"
                value={formData.discountType}
                onChange={(value) => handleSelectChange(value, "discountType")}
                required
              >
                <Select.Option value="percent">
                  Giảm theo phần trăm
                </Select.Option>
                <Select.Option value="fixed">
                  Giảm theo số tiền cố định
                </Select.Option>
              </Select>
            </StyledFormItem>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <StyledFormItem label="Giá trị giảm" required>
              <Input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                required
              />
            </StyledFormItem>
          </Col>

          <Col xs={24} sm={12}>
            <StyledFormItem label="Giá trị đơn hàng tối thiểu">
              <Input
                type="number"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleChange}
              />
            </StyledFormItem>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <StyledFormItem label="Áp dụng cho" required>
              <Select
                name="appliesTo"
                value={formData.appliesTo}
                onChange={(value) => handleSelectChange(value, "appliesTo")}
                required
              >
                <Select.Option value="all">Tất cả</Select.Option>
                <Select.Option value="product">Sản phẩm</Select.Option>
                <Select.Option value="type">Loại sản phẩm</Select.Option>
                <Select.Option value="user">Người dùng</Select.Option>
              </Select>
            </StyledFormItem>
          </Col>

          <Col xs={24} sm={12}>
            <StyledFormItem label="Số lần sử dụng tối đa" required>
              <Input
                type="number"
                name="maxUsage"
                value={formData.maxUsage}
                onChange={handleChange}
                required
              />
            </StyledFormItem>
          </Col>
        </Row>

        {(formData.appliesTo === "product" ||
          formData.appliesTo === "type") && (
          <Row gutter={16}>
            <Col span={24}>
              <StyledFormItem
                label={
                  formData.appliesTo === "product"
                    ? "Danh sách sản phẩm (ID)"
                    : "Danh sách loại sản phẩm"
                }
              >
                <Input
                  name="targetIds"
                  value={formData.targetIds.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetIds: e.target.value
                        .split(",")
                        .map((item) => item.trim()),
                    })
                  }
                  placeholder={
                    formData.appliesTo === "product"
                      ? "Nhập danh sách ID sản phẩm, cách nhau bằng dấu phẩy"
                      : "Nhập các loại sản phẩm, cách nhau bằng dấu phẩy"
                  }
                />
              </StyledFormItem>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <StyledFormItem label="Ngày hết hạn" required>
              <DatePicker
                style={{ width: "100%" }}
                name="expiredAt"
                value={formData.expiredAt ? dayjs(formData.expiredAt) : null}
                onChange={(date, dateString) => {
                  setFormData({
                    ...formData,
                    expiredAt: dateString,
                  });
                }}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                required
              />
            </StyledFormItem>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <StyledFormItem>
              <StyledButton type="primary" htmlType="submit">
                Tạo Mã Giảm Giá
              </StyledButton>
            </StyledFormItem>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CreatePromotion;
