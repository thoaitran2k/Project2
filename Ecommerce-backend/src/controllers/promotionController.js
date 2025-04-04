const PromotionCode = require("../models/PromotionCode");
const { sendPromotionCode } = require("../services/MailService"); // Đường dẫn theo dự án của bạn

const sendPromoCodeToUser = async (req, res) => {
  try {
    const { email, userName, userId, type = "welcome" } = req.body;

    // Tạo mã khuyến mãi mới
    const code = await PromotionCode.generateCode({
      prefix: type.toUpperCase(),
      length: 6,
    });

    const newPromo = new PromotionCode({
      code,
      discountType: "percent",
      discountValue: 5, // 10% hoặc số tiền cố định
      minOrderValue: 0,
      maxDiscount: 50000,
      maxUsage: 1,
      usedCount: 0,
      appliesTo: "user",
      targetIds: [userId], // Áp dụng riêng cho user
      startAt: new Date(),
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Hết hạn sau 7 ngày
      isActive: true,
      issuedFor: type,
      issuedTo: userId,
      isAutoGenerated: true,
      description: `Mã giảm giá dành riêng cho ${userName}`,
    });

    await newPromo.save();

    // Gửi email chứa mã
    const result = await sendPromotionCode(email, newPromo, userName);

    if (result.status === "SUCCESS") {
      return res.status(200).json({
        message: "Mã khuyến mãi đã được tạo và gửi thành công",
        code: newPromo.code,
      });
    } else {
      return res.status(500).json({
        message: "Gửi email thất bại",
        error: result.error,
      });
    }
  } catch (err) {
    console.error("Lỗi tạo mã và gửi mail:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

module.exports = {
  sendPromoCodeToUser,
};
