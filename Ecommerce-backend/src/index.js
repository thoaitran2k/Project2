const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(cors());

app.use(express.json());
app.use(bodyParser.json());

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
