const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");
const {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
} = require("../controllers/productController");

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "overlayImage", maxCount: 1 },
]);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, isAdmin, uploadFields, createProduct);
router.put("/:id", protect, isAdmin, uploadFields, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

module.exports = router;