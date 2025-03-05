const sgMail = require("@sendgrid/mail");

// Đặt API Key của SendGrid
sgMail.setApiKey(process.env.SENDGRID_SEND_MAIL_KEY);

/**
 * Gửi email chứa mã xác minh
 * @param {string} email - Địa chỉ email của người nhận
 * @param {number} code - Mã xác minh
 * @param {string} type - Loại xác minh ("register" hoặc "forgot-password")
 * @returns {Promise<{status: string, message: string, error?: any}>}
 */
const sendVerificationCode = async (email, code, type = "register") => {
  console.log("Sending email with type:", type); // Debug
  try {
    let subject, htmlContent;

    if (type === "register") {
      subject = "Xác nhận đăng ký";
      htmlContent = `
        <p>Chào bạn,</p>
        <p>Mã xác minh của bạn để đăng ký tài khoản là: <strong>${code}</strong></p>
        <p>Vui lòng nhập mã này để hoàn tất quá trình đăng ký.</p>
        <p>Kính chúc bạn sẽ có trải nghiệm thật tuyệt vời khi sử dụng dịch vụ của chúng tôi!</p>
      `;
    } else if (type === "forgot-password") {
      subject = "Yêu cầu thay đổi mật khẩu";
      htmlContent = `
        <p>Chào bạn,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã xác minh của bạn là: <strong>${code}</strong></p>
        <p>Vui lòng nhập mã này để tiếp tục.</p>
        <p>Nếu không phải là bạn, vui lòng bỏ qua mail này!.</p>
      `;
    } else {
      return { status: "ERROR", message: "Loại xác minh không hợp lệ" };
    }

    const msg = {
      to: email,
      from: "thoaitptp23@gmail.com", // Địa chỉ gửi (phải được xác minh trong SendGrid)
      replyTo: "support@example.com", // Địa chỉ hỗ trợ nếu người dùng muốn phản hồi
      subject,
      text: `Mã xác minh của bạn là: ${code}`,
      html: htmlContent,
    };

    await sgMail.send(msg);
    return { status: "SUCCESS", message: "Mã xác minh đã được gửi" };
  } catch (error) {
    console.error("Lỗi gửi email:", error.response?.body || error.message);

    return {
      status: "ERROR",
      message: "Gửi email thất bại",
      error: error.response?.body || error.message,
    };
  }
};

module.exports = { sendVerificationCode };
