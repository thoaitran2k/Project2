const express = require("express");
const crypto = require("crypto");
const https = require("https");

const router = express.Router();

router.post("/momo", async (req, res) => {
  let { amount } = req.body;

  // Kiểm tra và chuyển đổi amount
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Số tiền không hợp lệ" });
  }

  const amountInVND = Math.round(amount);

  if (amountInVND < 1000) {
    return res
      .status(400)
      .json({ message: "Số tiền thanh toán tối thiểu là 1,000 VND" });
  }

  const accessKey = "F8BBA842ECF85";
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  const partnerCode = "MOMO";
  const orderInfo = "Thanh toán đơn hàng";
  const redirectUrl = "http://localhost:3000/checkout/momo-return";
  const ipnUrl = redirectUrl;
  const requestType = "payWithMethod";
  const extraData = "";
  const autoCapture = true;
  const lang = "vi";

  const orderId = partnerCode + new Date().getTime();
  const requestId = orderId;

  // Tạo chuỗi chữ ký
  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId,
    amount: amount, // Dữ liệu số đã được chuyển về chuỗi
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId: "",
    signature,
  });

  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  const momoRequest = https.request(options, (momoRes) => {
    let data = "";

    momoRes.on("data", (chunk) => {
      data += chunk;
    });

    momoRes.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.resultCode === 0) {
          return res.json({ payUrl: parsed.payUrl });
        } else {
          return res
            .status(400)
            .json({ message: "Tạo thanh toán thất bại", result: parsed });
        }
      } catch (err) {
        return res.status(500).json({ message: "Lỗi phản hồi từ MoMo", err });
      }
    });
  });

  momoRequest.on("error", (e) => {
    console.error(`Problem with MoMo request: ${e.message}`);
    res.status(500).json({ message: "Gọi MoMo thất bại", error: e.message });
  });

  momoRequest.write(requestBody);
  momoRequest.end();
});

module.exports = router;
