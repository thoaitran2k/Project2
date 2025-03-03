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
import * as message from "../../components/Message/Message";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [code, setCode] = useState();
  const [vertification, setVertification] = useState();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [resetPassword, setResetPassword] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthDate: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {});

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgot(false);
    setStep(1);
  };

  const handleUpdatePassword = async (email, newPassword, confirmPassword) => {
    try {
      const response = await axios.post(
        "http://localhost:3002/api/user/forgot-password",
        {
          email,
          newPassword,
          confirmPassword,
        }
      );

      alert(response.data.message || "Mật khẩu đã được cập nhật thành công!");

      // Chuyển về màn hình đăng nhập
      setIsForgot(false);
      setIsLogin(true);
      setStep(1);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
        phone: "",
        birthDate: "",
      });
      setResetPassword({ newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật mật khẩu!"
      );
    }
  };

  const handleLogin = async (e, formData, setIsLogin, setIsAuthenticated) => {
    e.preventDefault();
    console.log("formData:", formData); // Kiểm tra giá trị formData

    if (!formData.email || !formData.password) {
      message.warning("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL_BACKEND}/user/sign-in`,
        { email: formData.email, password: formData.password }
      );

      if (response.data.status === "OK") {
        const { accessToken, refreshToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setIsLogin(true);
        setIsAuthenticated(true); // Cập nhật trạng thái đăng nhập

        message.success("Đăng nhập thành công!");
        setTimeout(() => navigate("/home"), 1500);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMsg);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (step === 1) {
      try {
        const endpoint = isForgot
          ? "http://localhost:3002/api/user/send-forgot-password-code"
          : "http://localhost:3002/api/user/send-register-code";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        //console.log("isForgot:", isForgot);
        // console.log("Sending request to:", endpoint);
        // //console.log(
        //   "Request body:",
        //   JSON.stringify({
        //     email: formData.email,
        //     type: isForgot ? "forgot" : "register",
        //   })
        // );

        const data = await response.json();

        if (response.ok) {
          // alert(`Mã xác nhận đã được gửi!`);
          message.success("Mã xác nhận đã được gửi!");
          setCode(data.verificationCode); // Lưu mã xác nhận
          setStep(2);
        }
        // else {
        //   alert(data.message || "Gửi mã thất bại, vui lòng thử lại!");
        // }
        else if (data.status === "WARNING") {
          message.warning(data.message);
        } else if (data.status === "ERROR") {
          alert(data.message);
        } else {
          alert("Có lỗi không xác định, vui lòng thử lại sau!");
        }
      } catch (error) {
        alert("Lỗi kết nối, vui lòng thử lại!");
        console.error(error);
      }
    } else if (step === 2) {
      if (vertification?.trim() === String(code)) {
        //alert("Xác nhận Email thành công!");
        message.success("Xác nhận email thành công!");
        setStep(3);
      } else {
        //alert("Mã xác nhận không chính xác!");
        message.error("Mã xác nhận không chính xác!");
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isForgot) {
      // Xử lý cập nhật mật khẩu khi quên mật khẩu
      if (resetPassword.newPassword !== resetPassword.confirmNewPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3002/api/user/reset-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              newPassword: formData.newPassword,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          alert("Cập nhật mật khẩu thành công!");
          setIsForgot(false);
          setIsLogin(true);
          setStep(1);
          setFormData({ email: "", newPassword: "", confirmNewPassword: "" });
        } else {
          alert(data.message || "Lỗi khi cập nhật mật khẩu!");
        }
      } catch (error) {
        console.error(error);
        alert("Đã có lỗi xảy ra, vui lòng thử lại!");
      }
    } else if (!isLogin) {
      // Xử lý đăng ký tài khoản
      if (formData.password !== formData.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      try {
        const response = await fetch("http://localhost:3002/api/user/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          setIsLogin(true);
          setStep(1);
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            birthDate: "",
          });
        } else {
          alert(data.message || "Đăng ký thất bại!");
        }
      } catch (error) {
        console.error(error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
      }
    }
  };

  // useEffect(() => {
  //   if (step === 3 && !isLogin) {
  //     alert("Xác nhận Email thành công!");
  //   }
  // }, [step]);

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
                        name="newPassword"
                        placeholder="Mật khẩu mới"
                        //value={resetPassword.newPassword}
                        onChange={(e) =>
                          setResetPassword({
                            ...resetPassword,
                            newPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <LockOutlined />
                      <Input
                        type="password"
                        name="confirmNewPassword"
                        placeholder="Xác nhận mật khẩu mới"
                        //value={resetPassword.confirmNewPassword}
                        onChange={(e) =>
                          setResetPassword({
                            ...resetPassword,
                            confirmNewPassword: e.target.value,
                          })
                        }
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Chặn form submit
                          handleNext(); // Chuyển bước
                        }
                      }}
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
              Quay lại đăng nhập
            </ToggleButton>
          ) : isLogin && step === 1 ? (
            <ToggleButton
              type="button"
              onClick={() => {
                setIsForgot(true);
                setStep(1);
                setFormData({ email: "" }); // Reset lại email
              }}
            >
              Quên mật khẩu?
            </ToggleButton>
          ) : null}

          {isForgot ? (
            step === 3 ? (
              <SubmitButton
                type="button"
                onClick={() =>
                  handleUpdatePassword(
                    formData.email,
                    resetPassword.newPassword,
                    resetPassword.confirmNewPassword
                  )
                }
              >
                Cập nhật mật khẩu
              </SubmitButton>
            ) : (
              " "
            )
          ) : isLogin ? (
            <SubmitButton
              onClick={(e) =>
                handleLogin(e, formData, setIsLogin, setIsAuthenticated)
              }
              type="submit"
            >
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
