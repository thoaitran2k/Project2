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

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // Chỉ định origin frontend (không dùng "*")
    credentials: true, // Cho phép gửi cookies/token
  })
);

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
