const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { generateTryOn } = require("../controllers/tryonController");

router.post("/:productId", protect, generateTryOn);

module.exports = router;