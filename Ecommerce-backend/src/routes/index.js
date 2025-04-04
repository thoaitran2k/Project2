const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const CartRouter = require("./CartRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/cart", CartRouter);
};

module.exports = routes;
