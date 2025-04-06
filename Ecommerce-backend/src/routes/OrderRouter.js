const express = require("express");
const OrderController = require("../controllers/OrderController");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create", OrderController.createOrder);

module.exports = router;
