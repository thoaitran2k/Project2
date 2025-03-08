const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Proxy endpoint để lấy danh sách tỉnh/thành phố
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

// Khởi động server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy trên http://localhost:${PORT}`);
});
