import { useState, useEffect } from "react";

import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import axios from "axios";

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [code, setCode] = useState();
  const [vertification, setVertification] = useState();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthDate: "",
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgot(false);
    setStep(1);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Kiểm tra thông tin đăng nhập (email và mật khẩu)
    if (!formData.email || !formData.password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    try {
      // Gửi yêu cầu đăng nhập
      const response = await axios.post(
        "http://localhost:3002/api/user/sign-in", // Địa chỉ API đăng nhập
        {
          email: formData.email,
          password: formData.password,
        }
      );
      console.log("Response from server:", response);

      // Kiểm tra kết quả trả về
      if (response.data.status === "OK") {
        localStorage.setItem("token", response.data.accessToken);
        console.log("localStorage", localStorage);
        alert("Đăng nhập thành công!");

        window.location.href = "/home";

        // Chuyển hướng người dùng hoặc lưu token ở đây
        // Ví dụ: localStorage.setItem("token", response.data.token);

        // Nếu cần chuyển hướng người dùng
        // window.location.href = "/dashboard"; // Hoặc sử dụng react-router-dom để điều hướng
      } else {
        alert(response.data.message || "Đăng nhập thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (step === 1 && !isLogin) {
      try {
        const response = await fetch(
          "http://localhost:3002/api/user/send-verification-code",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email }),
          }
        );

        const data = await response.json();
        // console.log("Mã xác nhận nhận được:", data.verificationCode);

        if (response.ok) {
          alert(`Mã xác nhận đã được gửi!`);
          setCode(data.verificationCode); // Lưu mã xác nhận
          setStep(2);
        } else {
          alert(data.message || "Gửi mã thất bại, vui lòng thử lại!");
        }
      } catch (error) {
        alert("Lỗi kết nối, vui lòng thử lại!");
        console.error(error);
      }
    } else if (step === 2) {
      // Kiểm tra mã xác nhận
      if (vertification === code.toString()) {
        setStep(3);
      } else {
        alert("Mã xác nhận không chính xác!");
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      // Gửi yêu cầu đăng ký đến server
      try {
        const response = await fetch("http://localhost:3002/api/user/sign-up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            dob: formData.birthDate,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Đăng ký thành công!");
          // Reset form sau khi đăng ký thành công
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            birthDate: "",
          });
          // Chuyển về form đăng nhập
          setIsLogin(true); // Chuyển sang trang đăng nhập
          setStep(1); // Reset lại bước trong quy trình
        } else {
          alert(data.message || "Đăng ký thất bại, vui lòng thử lại!");
        }
      } catch (error) {
        console.error(error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
      }
    }
  };

  useEffect(() => {
    if (step === 3 && !isLogin) {
      alert("Vui lòng kiểm tra các thông tin bạn đã nhập!");
    }
  }, [step]);

  return (
    <LoginContainer>
      <FormWrapper>
        <Title>
          {isLogin ? (isForgot ? "Quên mật khẩu" : "Đăng Nhập") : "Đăng Ký"}
        </Title>
        <form onSubmit={handleSubmit}>
          {isLogin ? (
            !isForgot ? (
              <div>
                {" "}
                <InputWrapper>
                  <MailOutlined />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
                <InputWrapper>
                  <LockOutlined />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <>
                    <InputWrapper>
                      <MailOutlined />
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </InputWrapper>
                    <StyledButton
                      onClick={handleNext}
                      type="button"
                      style={{ display: "flex", justifySelf: "flex-end" }}
                    >
                      Tiếp theo
                    </StyledButton>
                  </>
                )}

                {step === 2 && (
                  <>
                    <InputWrapper>
                      <Input
                        type="text"
                        name="verificationCode"
                        placeholder="Mã xác nhận"
                        onChange={(e) => setVertification(e.target.value)}
                        required
                      />
                    </InputWrapper>
                    <ButtonGroup>
                      <StyledButton type="button" onClick={handleBack}>
                        Quay lại
                      </StyledButton>
                      <StyledButton type="button" onClick={handleNext}>
                        Tiếp theo
                      </StyledButton>
                    </ButtonGroup>
                  </>
                )}

                {step === 3 && (
                  <>
                    <InputWrapper>
                      <LockOutlined />
                      <Input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu mới"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <LockOutlined />
                      <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Xác nhận mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </InputWrapper>
                  </>
                )}
              </>
            )
          ) : (
            <>
              {step === 1 && (
                <>
                  <InputWrapper>
                    <MailOutlined />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </InputWrapper>
                  <StyledButton
                    onClick={handleNext}
                    type="button"
                    style={{ display: "flex", justifySelf: "flex-end" }}
                  >
                    Tiếp theo
                  </StyledButton>
                </>
              )}

              {step === 2 && (
                <>
                  <InputWrapper>
                    <Input
                      type="text"
                      name="verificationCode"
                      placeholder="Mã xác nhận"
                      onChange={(e) => setVertification(e.target.value)}
                      required
                    />
                  </InputWrapper>
                  <ButtonGroup>
                    <StyledButton type="button" onClick={handleBack}>
                      Quay lại
                    </StyledButton>
                    <StyledButton type="button" onClick={handleNext}>
                      Tiếp theo
                    </StyledButton>
                  </ButtonGroup>
                </>
              )}

              {step === 3 && (
                <>
                  <InputWrapper>
                    <UserOutlined />
                    <Input
                      type="text"
                      name="username"
                      placeholder="Tên người dùng"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <PhoneOutlined />
                    <Input
                      type="text"
                      name="phone"
                      placeholder="Số điện thoại"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <CalendarOutlined />
                    <Input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <LockOutlined />
                    <Input
                      type="password"
                      name="password"
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <LockOutlined />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </InputWrapper>
                </>
              )}
            </>
          )}
          {isForgot ? (
            <ToggleButton
              type="button"
              onClick={() => {
                setIsForgot(false);
                setStep(1);
              }}
            >
              {" "}
              Quay lại đăng nhập
            </ToggleButton>
          ) : (
            <ToggleButton
              type="button"
              onClick={() => {
                setIsForgot(true);
                setStep(1);
              }}
            >
              {" "}
              Quên mật khẩu?
            </ToggleButton>
          )}

          {isForgot ? (
            step === 3 ? (
              <SubmitButton type="button">Cập nhập mật khẩu</SubmitButton>
            ) : (
              " "
            )
          ) : isLogin ? (
            <SubmitButton onClick={handleLogin} type="submit">
              Đăng nhập
            </SubmitButton>
          ) : step === 3 ? (
            <SubmitButton type="submit">Đăng ký</SubmitButton>
          ) : (
            ""
          )}
        </form>
        <ToggleText>
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <ToggleButton onClick={toggleMode}>
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </ToggleButton>
        </ToggleText>
      </FormWrapper>
    </LoginContainer>
  );
}

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const FormWrapper = styled.div`
  width: 30%;
  height: 60%;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 25px;
  font-size: 24px;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ced4da;
  padding: 12px;
  border-radius: 8px;
  font-size: 18px;
  margin-bottom: 15px;
`;

const Input = styled.input`
  border: none;
  outline: none;
  width: 100%;
  font-size: 16px;
`;

const SubmitButton = styled.button`
  margin: 10px;
  background-color: #007bff;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  width: 100%;
`;

const ToggleText = styled.p`
  text-align: center;
  margin-top: 15px;
  font-size: 16px;
`;

const ToggleButton = styled.button`
  border: none;
  background: none;
  color: #007bff;
  cursor: pointer;
  font-size: 16px;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const StyledButton = styled.button`
  padding: 12px 8px;
  border-radius: 5px;
  border: 1px solid #0b74e5;
  background: none;
  cursor: pointer;
  color: #0b74e5;
`;
