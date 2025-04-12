const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

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
