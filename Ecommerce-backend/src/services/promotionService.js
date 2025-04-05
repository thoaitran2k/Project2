const Product = require("../models/ProductModel");
const PromotionCode = require("../models/PromotionCode");
const { sendPromotionCode } = require("./MailService");
const logger = require("../utils/logger");

class PromotionService {
  static async validatePromotion(promo, userId, cartItems, totalAmount) {
    try {
      // 1. Kiểm tra trạng thái cơ bản
      const now = new Date();
      if (!promo.isActive) {
        return { isValid: false, message: "Mã khuyến mãi không khả dụng" };
      }

      if (promo.startAt && new Date(promo.startAt) > now) {
        return { isValid: false, message: "Mã khuyến mãi chưa có hiệu lực" };
      }

      if (new Date(promo.expiredAt) < now) {
        return { isValid: false, message: "Mã đã hết hạn" };
      }

      // 2. Kiểm tra giới hạn sử dụng
      if (promo.maxUsage && promo.usedCount >= promo.maxUsage) {
        return { isValid: false, message: "Mã đã đạt giới hạn sử dụng" };
      }

      // 3. Kiểm tra user-specific
      if (promo.issuedTo && !promo.issuedTo.equals(userId)) {
        return {
          isValid: false,
          message: "Mã không áp dụng cho tài khoản này",
        };
      }

      // 4. Kiểm tra giá trị đơn hàng tối thiểu
      if (totalAmount < promo.minOrderValue) {
        return {
          isValid: false,
          message: `Đơn hàng cần tối thiểu ${promo.minOrderValue.toLocaleString()}₫ để áp dụng mã`,
        };
      }

      // 5. Kiểm tra điều kiện áp dụng
      const { isValid, applicableItems, message } =
        await this.checkApplicability(promo, cartItems, userId);

      if (!isValid) {
        return { isValid, message };
      }

      return { isValid: true, applicableItems };
    } catch (error) {
      logger.error(`Lỗi validate promotion: ${error.message}`, error);
      return {
        isValid: false,
        message: "Lỗi hệ thống khi kiểm tra mã khuyến mãi",
      };
    }
  }

  static async checkApplicability(promo, cartItems, userId) {
    let applicableItems = [];

    switch (promo.appliesTo) {
      case "all":
        return { isValid: true, applicableItems: cartItems };

      case "product":
        const productApplicable = cartItems.filter((item) =>
          promo.targetIds.includes(item.productId.toString())
        );
        return {
          isValid: productApplicable.length > 0,
          applicableItems: productApplicable,
          message: "Mã không áp dụng cho sản phẩm trong giỏ hàng",
        };

      case "type":
        const productIds = cartItems.map((item) => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        const typeApplicable = cartItems.filter((item) => {
          const product = products.find((p) => p._id.equals(item.productId));
          return product && promo.targetIds.includes(product.type);
        });
        return {
          isValid: typeApplicable.length > 0,
          applicableItems: typeApplicable,
          message: "Mã không áp dụng cho loại sản phẩm này",
        };

      case "user":
        return {
          isValid: promo.targetIds.includes(userId),
          applicableItems: cartItems,
          message: "Mã không áp dụng cho tài khoản của bạn",
        };

      default:
        return { isValid: false, message: "Loại khuyến mãi không hợp lệ" };
    }
  }

  static async calculateDiscount(promo, applicableItems, totalAmount) {
    try {
      const applicableTotal = applicableItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      let discount =
        promo.discountType === "percent"
          ? Math.floor((applicableTotal * promo.discountValue) / 100)
          : promo.discountValue;

      // Áp dụng giới hạn tối đa cho discount %
      if (promo.discountType === "percent" && promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount);
      }

      // Đảm bảo discount không vượt quá tổng đơn hàng
      return Math.min(discount, totalAmount);
    } catch (error) {
      logger.error(`Lỗi tính discount: ${error.message}`, error);
      return 0;
    }
  }

  static async generatePromoCode({
    prefix = "VIP",
    length = 8,
    attempts = 0,
  } = {}) {
    try {
      if (attempts >= 5) {
        throw new Error(
          "Không thể tạo mã khuyến mãi duy nhất sau nhiều lần thử"
        );
      }

      const code =
        prefix +
        crypto
          .randomBytes(Math.ceil(length / 2))
          .toString("hex")
          .slice(0, length)
          .toUpperCase();

      const exists = await PromotionCode.findOne({ code });
      if (exists) {
        return this.generatePromoCode({
          prefix,
          length,
          attempts: attempts + 1,
        });
      }

      return code;
    } catch (error) {
      logger.error(`Lỗi generate promo code: ${error.message}`, error);
      throw error;
    }
  }

  static async createWelcomePromoCode(user, discountConfig = {}) {
    const defaultConfig = {
      discountValue: 10,
      discountType: "percent",
      validDays: 30,
      prefix: "WELCOME",
    };

    const config = { ...defaultConfig, ...discountConfig };

    try {
      const code = await this.generatePromoCode({ prefix: config.prefix });

      const promoData = {
        code,
        discountType: config.discountType,
        discountValue: config.discountValue,
        maxUsage: 1,
        issuedFor: "welcome",
        issuedTo: user._id,
        description: `Mã chào mừng ${config.discountValue}${
          config.discountType === "percent" ? "%" : "₫"
        } cho khách hàng mới`,
        startAt: new Date(),
        expiredAt: new Date(
          Date.now() + config.validDays * 24 * 60 * 60 * 1000
        ),
        minOrderValue: 0,
        isActive: true,
        emailStatus: { sent: false },
      };

      const promoCode = await PromotionCode.create(promoData);

      try {
        await sendPromotionCode(user.email, promoData, user.name);
        promoCode.emailStatus = { sent: true, sentAt: new Date() };
        await promoCode.save();
      } catch (emailError) {
        logger.error(`Gửi email thất bại: ${emailError.message}`, emailError);
        promoCode.emailStatus = {
          sent: false,
          error: emailError.message,
          lastAttempt: new Date(),
        };
        await promoCode.save();
      }

      return promoCode;
    } catch (error) {
      logger.error(`Lỗi tạo welcome promo: ${error.message}`, error);
      throw error;
    }
  }

  static async recordPromoUsage(promoCodeId, userId, orderId) {
    try {
      const updated = await PromotionCode.findByIdAndUpdate(
        promoCodeId,
        {
          $inc: { usedCount: 1 },
          $push: {
            usageHistory: {
              user: userId,
              order: orderId,
              usedAt: new Date(),
            },
          },
        },
        { new: true }
      );

      if (!updated) {
        throw new Error("Không tìm thấy mã khuyến mãi");
      }

      return updated;
    } catch (error) {
      logger.error(`Lỗi ghi nhận sử dụng mã: ${error.message}`, error);
      throw error;
    }
  }

  static async getValidUserPromoCodes(userId) {
    try {
      return await PromotionCode.find({
        $or: [
          { issuedTo: userId },
          { appliesTo: "user", targetIds: userId },
          { appliesTo: "all" },
        ],
        isActive: true,
        startAt: { $lte: new Date() },
        expiredAt: { $gte: new Date() },
        $expr: { $lt: ["$usedCount", "$maxUsage"] },
      }).sort({ expiredAt: 1 });
    } catch (error) {
      logger.error(`Lỗi lấy danh sách mã: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = PromotionService;
