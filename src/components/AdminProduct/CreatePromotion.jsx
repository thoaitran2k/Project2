import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Tag,
} from "antd";
import { InputNumber } from "antd";
import styled from "styled-components";
import axios from "axios";
import dayjs from "dayjs";
import { setLoading } from "../../redux/slices/loadingSlice";
import { useDispatch } from "react-redux";

const { Option } = Select;

const CreatePromotion = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    console.log("Submitted values:", values);
    try {
      dispatch(setLoading(true));

      // Format data before sending
      const formattedValues = {
        ...values,
        expiredAt: values.expiredAt.format("YYYY-MM-DD HH:mm:ss"),
        targetIds:
          values.appliesTo === "product"
            ? values.targetIds.split(",").map((id) => id.trim())
            : values.targetIds,
      };

      const response = await axios.post(
        "http://localhost:3002/api/product/create-promotion",
        formattedValues
      );

      message.success(response.data.message);
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi tạo mã giảm giá. Vui lòng thử lại!"
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Wrapper>
      <FormContainer>
        <StyledForm
          form={form}
          onFinish={handleSubmit}
          onFinishFailed={(errorInfo) => {
            console.log("Validation Failed:", errorInfo);
          }}
          layout="vertical"
          initialValues={{
            discountType: "percent",
            appliesTo: "all",
            maxUsage: 1,
            minOrderValue: 0,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <FormItem
                label="Mã Giảm Giá"
                name="code"
                rules={[
                  { required: true, message: "Vui lòng nhập mã giảm giá" },
                  {
                    pattern: /^[A-Z0-9]+$/,
                    message: "Chỉ chấp nhận chữ hoa và số",
                  },
                ]}
              >
                <PromoInput
                  placeholder="VD: SALE20"
                  maxLength={20}
                  allowClear
                />
              </FormItem>
            </Col>

            <Col xs={24} sm={12}>
              <FormItem label="Loại Giảm Giá" name="discountType">
                <StyledSelect>
                  <Option value="percent">Giảm theo phần trăm (%)</Option>
                  <Option value="fixed">Giảm theo số tiền cố định (₫)</Option>
                </StyledSelect>
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <FormItem
                label={
                  form.getFieldValue("discountType") === "percent"
                    ? "Phần trăm giảm giá"
                    : "Số tiền giảm (₫)"
                }
                name="discountValue"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị giảm" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue("discountType") === "percent") {
                        if (value > 0 && value <= 100) return Promise.resolve();
                        return Promise.reject(
                          new Error("Phần trăm phải từ 1-100")
                        );
                      } else {
                        if (value > 0) return Promise.resolve();
                        return Promise.reject(
                          new Error("Số tiền phải lớn hơn 0")
                        );
                      }
                    },
                  }),
                ]}
              >
                <InputNumberStyled
                  min={1}
                  max={
                    form.getFieldValue("discountType") === "percent"
                      ? 100
                      : undefined
                  }
                  addonAfter={
                    form.getFieldValue("discountType") === "percent" ? "%" : "₫"
                  }
                />
              </FormItem>
            </Col>

            <Col xs={24} sm={12}>
              <FormItem
                label="Giá trị đơn hàng tối thiểu (₫)"
                name="minOrderValue"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 0,
                    message: "Không được nhỏ hơn 0",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <InputNumberStyled min={0} addonAfter="₫" />
              </FormItem>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate>
            {() =>
              form.getFieldValue("discountType") === "percent" && (
                <Row gutter={16}>
                  <Col span={12}>
                    <FormItem
                      label="Giảm tối đa (₫)"
                      name="maxDiscount"
                      rules={[
                        {
                          required: true,
                          type: "number",
                          min: 0,
                          message: "Không được nhỏ hơn 0",
                          transform: (value) => Number(value),
                        },
                      ]}
                    >
                      <InputNumberStyled min={1} addonAfter="₫" />
                    </FormItem>
                  </Col>
                </Row>
              )
            }
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <FormItem label="Áp dụng cho" name="appliesTo">
                <StyledSelect>
                  <Option value="all">Tất cả sản phẩm</Option>
                  <Option value="product">Sản phẩm cụ thể</Option>
                  <Option value="type">Loại sản phẩm</Option>
                  <Option value="user">Người dùng cụ thể</Option>
                </StyledSelect>
              </FormItem>
            </Col>

            <Col xs={24} sm={12}>
              <FormItem
                label="Số lần sử dụng tối đa"
                name="maxUsage"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 0,
                    message: "Không được nhỏ hơn 0",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <InputNumberStyled min={1} />
              </FormItem>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) =>
              (getFieldValue("appliesTo") === "product" ||
                getFieldValue("appliesTo") === "type") && (
                <Row gutter={16}>
                  <Col span={24}>
                    <FormItem
                      label={
                        getFieldValue("appliesTo") === "product"
                          ? "Danh sách ID sản phẩm"
                          : "Chọn loại sản phẩm"
                      }
                      name="targetIds"
                      rules={[
                        { required: true, message: "Vui lòng nhập thông tin" },
                      ]}
                    >
                      {getFieldValue("appliesTo") === "product" ? (
                        <StyledInput placeholder="Nhập ID sản phẩm, cách nhau bằng dấu phẩy. VD: 1, 2, 3" />
                      ) : (
                        <StyledSelect
                          mode="multiple"
                          placeholder="Chọn loại sản phẩm"
                          optionFilterProp="children"
                        >
                          <Option value="Áo nam">Áo nam</Option>
                          <Option value="Áo nữ">Áo nữ</Option>
                          <Option value="Quần nam">Quần nam</Option>
                          <Option value="Quần nữ">Quần nữ</Option>
                          <Option value="Đồng hồ">Đồng hồ</Option>
                          <Option value="Túi xách">Túi xách</Option>
                          <Option value="Trang sức">Trang sức</Option>
                          <Option value="Ví">Ví</Option>
                        </StyledSelect>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              )
            }
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <FormItem
                label="Ngày hết hạn"
                name="expiredAt"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày hết hạn" },
                  () => ({
                    validator(_, value) {
                      if (!value || value.isAfter(dayjs())) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Ngày hết hạn phải sau ngày hiện tại")
                      );
                    },
                  }),
                ]}
              >
                <StyledDatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm:ss"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </FormItem>
            </Col>
          </Row>

          <FormItem>
            <SubmitButton type="primary" htmlType="submit" size="large">
              Tạo Mã Giảm Giá
            </SubmitButton>
          </FormItem>
        </StyledForm>
      </FormContainer>
    </Wrapper>
  );
};

export default CreatePromotion;

// Styled Components
const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 28px;
  text-align: center;
  position: relative;

  &::after {
    content: "";
    display: block;
    width: 60px;
    height: 3px;
    background: #3498db;
    margin: 12px auto 0;
    border-radius: 3px;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 20px;
  }
`;

const FormItem = styled(Form.Item)`
  .ant-form-item-label {
    label {
      font-weight: 500;
      color: #34495e;
    }
  }
`;

const StyledInput = styled(Input)`
  border-radius: 6px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  transition: all 0.3s;

  &:hover {
    border-color: #3498db;
  }

  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const PromoInput = styled(StyledInput)`
  text-transform: uppercase;
`;

const StyledSelect = styled(Select)`
  width: 100%;
  border-radius: 6px;

  .ant-select-selector {
    border-radius: 6px !important;
    padding: 8px 12px !important;
    height: auto !important;
    border: 1px solid #ddd !important;
    transition: all 0.3s !important;
  }

  &:hover .ant-select-selector {
    border-color: #3498db !important;
  }

  &.ant-select-focused .ant-select-selector {
    border-color: #3498db !important;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2) !important;
  }
`;

const InputNumberStyled = styled(InputNumber)`
  width: 100%;

  .ant-input-number-input {
    height: 38px;
    padding: 0 11px;
  }

  .ant-input-number-handler-wrap {
    border-radius: 0 6px 6px 0;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  border-radius: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  transition: all 0.3s;

  &:hover {
    border-color: #3498db;
  }

  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  height: 44px;
  font-weight: 500;
  font-size: 16px;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  border: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  margin-top: 12px;

  &:hover {
    background: linear-gradient(135deg, #2980b9, #1a252f);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Wrapper = styled.div`
  overflow-x: auto;
`;
