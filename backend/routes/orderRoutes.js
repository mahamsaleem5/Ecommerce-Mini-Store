const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const {
  createOrder, getMyOrders, getAllOrders, updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, isAdmin, getAllOrders);
router.put("/:id/status", protect, isAdmin, updateOrderStatus);

module.exports = router;