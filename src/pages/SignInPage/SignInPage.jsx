import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { CustomDatePicker } from "./style";
import styled from "styled-components";
import axios from "axios";
import * as message from "../../components/Message/Message";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import { fetchCart } from "../../redux/slices/userSlice";
import { setCartFromServer } from "../../redux/slices/cartSlice";
import {
  loginUser,
  forgotPasswordUser,
  getUserDetails,
  sendVerificationCode,
  resetPasswordUser,
  signUpUser,
} from "../../Services/UserService";
import Loading from "../../components/LoadingComponent/Loading";

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

  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthDate: "",
    address: [],
    avatar: "",
    gender: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgot(false);
    setStep(1);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      birthDate: "",
      gender: "",
      address: [],
      avatar: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  const handleDateChange = (date, dateString) => {
    // Kiểm tra nếu ngày nhập vào không hợp lệ
    if (!dayjs(dateString, "DD/MM/YYYY", true).isValid()) {
      message.error(
        "❌ Ngày tháng không hợp lệ! Vui lòng nhập theo định dạng DD/MM/YYYY."
      );
      return;
    }

    // Lưu trữ giá trị `birthDate` dưới dạng DD-MM-YYYY
    const formattedDate = dayjs(dateString, "DD/MM/YYYY").format("DD-MM-YYYY");
    setFormData((prev) => ({
      ...prev,
      birthDate: formattedDate, // Sửa từ `dob` thành `birthDate`
    }));
  };

  const handleUpdatePassword = async () => {
    try {
      dispatch(setLoading(true)); // Bật trạng thái loading ngay từ đầu

      const response = await forgotPasswordUser(
        formData.email,
        resetPassword.newPassword,
        resetPassword.confirmNewPassword
      );

      message.success(
        response.message || "Mật khẩu đã được cập nhật thành công!"
      );

      setTimeout(() => {
        dispatch(setLoading(false)); // Tắt trạng thái loading
        setIsForgot(false);
        setIsLogin(true);
        setStep(1);
        setResetPassword({ newPassword: "", confirmNewPassword: "" });
      }, 1500);
    } catch (errorMsg) {
      message.error(errorMsg);
      dispatch(setLoading(false)); // Đảm bảo tắt loading nếu có lỗi
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      message.warning("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    dispatch(setLoading(true));

    try {
      const response = await loginUser(formData.email, formData.password);

      if (response.status === "OK") {
        const { accessToken, refreshToken } = response;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        const decodedToken = jwtDecode(accessToken);
        const userId = decodedToken.id;

        const userDetails = await getUserDetails(userId, accessToken);

        console.log("Thông tin người dùng:", userDetails);
        message.success("Đăng nhập thành công!");

        // Dispatch setUser với toàn bộ thông tin userDetails và orderHistory

        setIsLogin(true);
        setIsAuthenticated(true);

        if (userDetails._id) {
          try {
            const cartResponse = await dispatch(
              fetchCart(userDetails._id)
            ).unwrap();

            if (!cartResponse || !Array.isArray(cartResponse.cartItems)) {
              throw new Error("Dữ liệu giỏ hàng không hợp lệ");
            }

            console.log("cartResponse", cartResponse);

            cartResponse.cartItems.forEach((item) => {
              if (!item.product) {
                console.error("Lỗi: item.product bị undefined", item);
              }
            });

            dispatch(
              setCartFromServer({
                cartItems: cartResponse.cartItems,
                cartCount:
                  cartResponse.cartCount || cartResponse.cartItems.length,
              })
            );
          } catch (error) {
            console.error("Lỗi khi xử lý giỏ hàng:", error);
            dispatch(setCartFromServer({ cartItems: [], cartCount: 0 }));
          }
        }

        setTimeout(() => {
          dispatch(setLoading(false));
          const redirectPath = location.state?.from || "/home";
          navigate(redirectPath);
        }, 500);
      }
    } catch (errorMsg) {
      message.error(errorMsg);
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 1500);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (step === 1) {
      try {
        dispatch(setLoading(true)); // Bật trạng thái loading
        const type = isForgot ? "forgot-password" : "register";
        const response = await sendVerificationCode(formData.email, type);
        message.success("Mã xác nhận đã được gửi!");
        setCode(response.verificationCode);
        setStep(2);
      } catch (errorMsg) {
        message.error(errorMsg);
      } finally {
        setTimeout(() => {
          dispatch(setLoading(false)); // Tắt trạng thái loading
        }, 1000);
      }
    } else if (step === 2) {
      if (vertification?.trim() === String(code)) {
        dispatch(setLoading(true));
        message.success("Xác nhận email thành công!");
        setTimeout(() => {
          dispatch(setLoading(false)); // Tắt trạng thái loading

          // Nếu là quên mật khẩu, giữ isForgot = true để sang bước nhập mật khẩu mới
          // Nếu là đăng ký, đặt isForgot = false để sang form đăng ký
          setIsForgot(isForgot);

          setStep(3);
        }, 1500);
      } else {
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
        message.warning("Mật khẩu xác nhận không khớp!");
        return;
      }

      try {
        const response = await resetPasswordUser(
          formData.email,
          resetPassword.newPassword
        );
        message.success(response.message || "Cập nhật mật khẩu thành công!");
        setIsForgot(false);
        setIsLogin(true);
        setStep(1);
        setFormData({ email: "", newPassword: "", confirmNewPassword: "" });
      } catch (errorMsg) {
        message.error(errorMsg);
      }
    } else if (!isLogin) {
      // Xử lý đăng ký tài khoản
      if (formData.password !== formData.confirmPassword) {
        message.warning("Mật khẩu xác nhận không khớp!");
        return;
      }

      try {
        dispatch(setLoading(true));
        const response = await signUpUser(formData);

        message.success(response.message || "Đăng ký thành công!");

        setTimeout(() => {
          dispatch(setLoading(false));
          setIsLogin(true);
          setStep(1);
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            birthDate: "",
            gender: "",
          });
        }, 1500);
      } catch (error) {
        dispatch(setLoading(false));
        if (error) {
          console.log("ERROR", error);
          message.warning(error);
        } else {
          message.warning("Vui lòng kiểm tra lại thông tin!");
        }
      }
    }
  };

  return (
    <LoginContainer>
      <Loading>
        <FormWrapper>
          <Title>
            {isLogin ? (isForgot ? "Quên mật khẩu" : "Đăng Nhập") : "Đăng Ký"}
          </Title>
          <form onSubmit={handleSubmit}>
            {isLogin ? (
              !isForgot ? (
                <div>
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
                          e.preventDefault();
                        }
                      }}
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
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleNext();
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
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
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
                          value={resetPassword.newPassword}
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
                          value={resetPassword.confirmNewPassword}
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
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
                        autoComplete="off"
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
                        autoComplete="off"
                        required
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <CustomDatePicker
                        format="DD/MM/YYYY"
                        value={
                          formData.birthDate
                            ? dayjs(formData.birthDate, "MM-DD-YYYY")
                            : null
                        }
                        onChange={handleDateChange}
                        required
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <UserOutlined />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "none",
                          outline: "none",
                          boxShadow: "none",
                          background: "#fff",
                        }}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </InputWrapper>
                    <InputWrapper>
                      <LockOutlined />
                      <Input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
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
                        autoComplete="new-password"
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
                }}
              >
                Quên mật khẩu?
              </ToggleButton>
            ) : null}

            {isForgot ? (
              step === 3 ? (
                <SubmitButton type="button" onClick={handleUpdatePassword}>
                  Cập nhật mật khẩu
                </SubmitButton>
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
            <div style={{ textAlign: "center", marginTop: "45px" }}>
              Truy cập đến{" "}
              <span
                onClick={() => navigate("/home")}
                style={{ cursor: "pointer", color: "blue" }}
              >
                <u>
                  <i>Trang chủ</i>
                </u>
              </span>{" "}
              của chúng tôi!
            </div>
          </ToggleText>
        </FormWrapper>
      </Loading>
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

const ToggleText = styled.div`
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
