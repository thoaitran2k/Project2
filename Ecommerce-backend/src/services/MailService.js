const sgMail = require("@sendgrid/mail");

// Đặt API Key của SendGrid
sgMail.setApiKey(process.env.SENDGRID_SEND_MAIL_KEY);

const sendVerificationCode = async (email, code) => {
  try {
    const msg = {
      to: email, // Địa chỉ nhận
      from: "thoaitptp23@gmail.com", // Địa chỉ gửi (phải được xác minh trong SendGrid)
      subject: "Mã xác minh đăng ký",
      text: `Mã xác minh của bạn là: ${code}`,
    };

    await sgMail.send(msg);
    return { status: "SUCCESS", message: "Mã xác minh đã được gửi" };
  } catch (error) {
    return { status: "ERROR", message: "Gửi email thất bại", error };
  }
};

module.exports = { sendVerificationCode };
