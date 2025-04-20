const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const CartRouter = require("./CartRouter");
const OrderRouter = require("./OrderRouter");
const CheckoutRouter = require("./CheckoutRouter");
const ReviewRouter = require("./ReviewRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/cart", CartRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/checkout", CheckoutRouter);
  app.use("/api/review", ReviewRouter);
};

module.exports = routes;
