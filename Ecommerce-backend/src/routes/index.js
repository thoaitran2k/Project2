const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const CartRouter = require("./CartRouter");
const OrderRouter = require("./OrderRouter");
const CheckoutRouter = require("./CheckoutRouter");
const ReviewRouter = require("./ReviewRouter");
const LikeRouter = require("./LikeRouter");
const ReportRouter = require("./ReportRouter");
const MomoWebhook = require("./MomoWebhook");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/cart", CartRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/checkout", CheckoutRouter);
  app.use("/api/review", ReviewRouter);
  app.use("/api/like", LikeRouter);
  app.use("/api/report", ReportRouter);
  app.use("/api/momo", MomoWebhook);
};

module.exports = routes;
