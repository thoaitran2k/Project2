import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Spin,
  DatePicker,
  Empty,
  Button,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666"];

const ReportComponent = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState([]);
  const [filterTrigger, setFilterTrigger] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        let url = "http://localhost:3002/api/report/dashboard";
        if (selectedDate.length === 2) {
          const startDate = dayjs(selectedDate[0]).format("YYYY-MM-DD");
          const endDate = dayjs(selectedDate[1]).format("YYYY-MM-DD");
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await axios.get(url);
        setReportData(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu báo cáo", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [filterTrigger]);

  const handleFilter = () => {
    setFilterTrigger((prev) => prev + 1);
  };

  if (loading)
    return (
      <Spin
        size="large"
        style={{ display: "block", margin: "auto", marginTop: "20vh" }}
      />
    );

  if (!reportData) return <div>Không có dữ liệu báo cáo</div>;

  const { revenueByMonth, topProducts, paymentStats, totalRevenue } =
    reportData;

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
        BÁO CÁO THỐNG KÊ
      </Title>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <RangePicker
          value={selectedDate}
          onChange={(dates) => setSelectedDate(dates)}
        />
        <Button type="primary" onClick={handleFilter}>
          Lọc
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Tổng doanh thu */}
        <Col xs={24} md={12} lg={8}>
          <Card style={{ textAlign: "center" }}>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              formatter={(value) => `${value.toLocaleString()} VNĐ`}
            />
          </Card>
        </Col>

        {/* Thống kê phương thức thanh toán */}
        <Col xs={24} md={12} lg={16}>
          <Card title="Thống kê phương thức thanh toán">
            {paymentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStats}
                    dataKey="total"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) =>
                      `${Number(value).toLocaleString()} VNĐ`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>

        {/* Doanh thu theo tháng */}
        <Col xs={24}>
          <Card title="Doanh thu theo tháng">
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={(item) => `${item._id.month}/${item._id.year}`}
                  />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) =>
                      `${Number(value).toLocaleString()} VNĐ`
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="totalRevenue"
                    name="Doanh thu (VNĐ)"
                    fill="#1890ff"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>

        {/* Top sản phẩm bán chạy */}
        <Col xs={24}>
          <Card title="Top 5 sản phẩm bán chạy">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "16px",
                  }}
                >
                  <span>
                    {index + 1}. {product._id}
                  </span>
                  <span>{product.totalSold} sản phẩm</span>
                </div>
              ))
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportComponent;
