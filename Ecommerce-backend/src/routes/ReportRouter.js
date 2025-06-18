const express = require("express");
const router = express.Router();
const Order = require("../models/OrderProduct");

router.get("/dashboard", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Điều kiện mặc định
    let matchCondition = { status: { $in: ["delivered", "paid"] } };

    // Nếu có startDate và endDate thì thêm điều kiện lọc theo ngày
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Gọi song song các thống kê
    const [revenueByMonth, topProducts, paymentStats, totalRevenue] =
      await Promise.all([
        // Doanh thu theo tháng
        Order.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
              },
              totalRevenue: { $sum: "$total" },
              totalOrders: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),

        // Top sản phẩm bán chạy
        Order.aggregate([
          { $match: matchCondition },
          { $unwind: "$selectedItems" },
          {
            $group: {
              _id: "$selectedItems.productName",
              totalSold: { $sum: "$selectedItems.quantity" },
            },
          },
          { $sort: { totalSold: -1 } },
          { $limit: 5 },
        ]),

        // Thống kê phương thức thanh toán
        Order.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: "$paymentMethod",
              total: { $sum: "$total" },
              count: { $sum: 1 },
            },
          },
        ]),

        // Tổng doanh thu
        Order.aggregate([
          { $match: matchCondition },
          { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
        ]),
      ]);

    res.json({
      success: true,
      revenueByMonth,
      topProducts,
      paymentStats,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy thống kê" });
  }
});

module.exports = router;
