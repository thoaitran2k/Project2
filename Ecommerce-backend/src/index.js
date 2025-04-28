const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const faqData = require("./services/faqData");
const askGPT = require("./services/gptService");

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // Đảm bảo đúng với frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Tin nhắn trống!" });
  }

  const lowerMessage = message.toLowerCase();

  // 1. Tìm trong FAQ
  const matchedFAQ = faqData.find((faq) =>
    faq.keywords.some((keyword) => lowerMessage.includes(keyword))
  );

  if (matchedFAQ) {
    return res.json({ reply: matchedFAQ.answer });
  }

  // 2. Không match → hỏi GPT
  try {
    const gptReply = await askGPT(message);
    return res.json({ reply: gptReply });
  } catch (error) {
    console.error("GPT Error:", error);
    return res.json({
      reply: "Xin lỗi, tôi hiện không thể trả lời câu hỏi này.",
    });
  }
});

app.get("/api/provinces", async (req, res) => {
  try {
    const response = await axios.get(
      "https://provinces.open-api.vn/api/?depth=1"
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu tỉnh/thành phố" });
  }
});

// Proxy endpoint để lấy danh sách quận/huyện
app.get("/api/districts/:provinceCode", async (req, res) => {
  try {
    const response = await axios.get(
      `https://provinces.open-api.vn/api/p/${req.params.provinceCode}?depth=2`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu quận/huyện" });
  }
});

// Proxy endpoint để lấy danh sách phường/xã
app.get("/api/wards/:districtCode", async (req, res) => {
  try {
    const response = await axios.get(
      `https://provinces.open-api.vn/api/d/${req.params.districtCode}?depth=2`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu phường/xã" });
  }
});

routes(app);

// console.log("process.env.MONGO_DB", process.env.MONGO_DB);

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log("Connect DB success");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("Sever is running in port: ", port);
});
