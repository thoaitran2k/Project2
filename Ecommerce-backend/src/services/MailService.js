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
  console.log("Sending email with type:", type);
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
        <p>Nếu không phải là bạn, vui lòng bỏ qua mail này!</p>
      `;
    } else if (type === "account-blocked") {
      subject = "Thông báo tài khoản bị khóa";
      htmlContent = `
        <p>Chào bạn,</p>
        <p>Chúng tôi phát hiện tài khoản của bạn đã vi phạm các điều khoản dịch vụ.</p>
        <p>Do đó, tài khoản của bạn đã bị khóa và bạn không thể tiếp tục sử dụng dịch vụ.</p>
        <p>Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ để được giúp đỡ.</p>
        <p>Trân trọng,</p>
        <p>Đội ngũ hỗ trợ</p>
        <p>Hotline:0794330648 - Liên hệ: Trần Phú Thoại</p>
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

const sendPromotionCode = async (email, promoData, userName) => {
  try {
    const { code, discountValue, discountType, expiredAt } = promoData;

    const discountText =
      discountType === "percent"
        ? `${discountValue}%`
        : `${discountValue.toLocaleString()}₫`;

    const msg = {
      to: email,
      from: "thoaitptp23@gmail.com",
      subject: "🎉 Mã khuyến mãi chào mừng từ chúng tôi",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Chào mừng ${userName} đến với cửa hàng của chúng tôi!</h1>
          <p style="font-size: 16px;">Cảm ơn bạn đã đăng ký tài khoản. Đây là món quà đặc biệt dành riêng cho bạn:</p>
          
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
            <h2 style="color: #d32f2f; margin: 0;">${code}</h2>
            <p style="font-size: 18px; margin: 10px 0;">Giảm giá ${discountText}</p>
            <p style="font-size: 14px;">Áp dụng đến: ${new Date(
              expiredAt
            ).toLocaleDateString()}</p>
          </div>
          
          <p style="font-size: 16px;">Hãy sử dụng mã khi thanh toán để nhận ưu đãi đặc biệt này!</p>
          <p style="font-size: 14px; color: #777;">Mã chỉ có hiệu lực 1 lần duy nhất cho tài khoản của bạn.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ</p>
            <p>Hotline: 0794330648 - Liên hệ: Trần Phú Thoại</p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    return { status: "SUCCESS", message: "Email mã khuyến mãi đã được gửi" };
  } catch (error) {
    console.error(
      "Lỗi gửi email mã khuyến mãi:",
      error.response?.body || error.message
    );
    return {
      status: "ERROR",
      message: "Gửi email mã khuyến mãi thất bại",
      error: error.response?.body || error.message,
    };
  }
};

/**
 * Gửi email khi thay đổi trạng thái đơn hàng
 * @param {string} email - Email khách hàng
 * @param {string} userName - Tên khách hàng
 * @param {string} orderId - Mã đơn hàng
 * @param {string} status - Trạng thái mới của đơn hàng
 * @returns {Promise<{status: string, message: string, error?: any}>}
 */
const sendOrderStatusEmail = async (
  email,
  userName,
  orderId,
  status,
  order
) => {
  try {
    const subject = `Cập nhật trạng thái đơn hàng #${orderId}`;
    let statusMessage = "";

    switch (status) {
      case "pending":
        statusMessage =
          "Chúng tôi đã nhận được đơn hàng của bạn và đang chờ xác nhận.";
        break;
      case "processing":
        statusMessage = "Đơn hàng của bạn đang được xử lý bởi hệ thống.";
        break;
      case "pending_payment":
        statusMessage =
          "Đơn hàng của bạn đang chờ thanh toán. Vui lòng hoàn tất thanh toán để tiếp tục.";
        break;
      case "shipping":
        statusMessage = "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển.";
        break;
      case "delivered":
        statusMessage =
          "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!";
        break;
      case "paid":
        statusMessage =
          "Chúng tôi đã nhận được thanh toán cho đơn hàng của bạn.";
        break;
      case "requestedCancel":
        statusMessage =
          "Yêu cầu hủy đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ xử lý sớm nhất có thể.";
        break;
      case "cancelled":
        statusMessage =
          "Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.";
        break;
      default:
        statusMessage = "Trạng thái đơn hàng của bạn đã được cập nhật.";
        break;
    }

    const productListHtml = order.selectedItems
      .map(
        (item) => `
      <tr>
        <td>${item.productName}</td>
        <td style="text-align:center;">${item.quantity}</td>
        <td style="text-align:right;">${item.price.toLocaleString()}₫</td>
      </tr>
    `
      )
      .join("");

    const msg = {
      to: email,
      from: "thoaitptp23@gmail.com",
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">
          <h2 style="color: #1976d2;">Xin chào ${userName},</h2>
          <p>${statusMessage}</p>

          <h3>Thông tin đơn hàng</h3>
          <p><strong>Mã đơn hàng:</strong> #${orderId}</p>
          <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Phí vận chuyển:</strong> ${order.shippingFee.toLocaleString()}₫</p>
          <p><strong>Tổng tiền:</strong> ${order.total.toLocaleString()}₫</p>

          <h3>Danh sách sản phẩm</h3>
          <table style="width:100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f2f2f2;">
                <th style="text-align:left; padding: 8px;">Sản phẩm</th>
                <th style="text-align:center;">SL</th>
                <th style="text-align:right;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${productListHtml}
            </tbody>
          </table>

          <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;">
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ</p>
            <p>Hotline: 0794330648 - Liên hệ: Trần Phú Thoại</p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log("✅ Email đã gửi thành công.");
    return {
      status: "SUCCESS",
      message: "Email cập nhật trạng thái đơn hàng đã được gửi",
    };
  } catch (error) {
    console.error(
      "Lỗi gửi email trạng thái đơn hàng:",
      error.response?.body || error.message
    );
    return {
      status: "ERROR",
      message: "Gửi email trạng thái đơn hàng thất bại",
      error: error.response?.body || error.message,
    };
  }
};

module.exports = {
  sendVerificationCode,
  sendPromotionCode,
  sendOrderStatusEmail,
};
