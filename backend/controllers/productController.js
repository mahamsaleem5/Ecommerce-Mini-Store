const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    const { search, sort, page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };

    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Invalid product id" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, sizes, stock } = req.body;

    const image = req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : null;
    const overlayImage = req.files?.overlayImage?.[0] ? `/uploads/${req.files.overlayImage[0].filename}` : null;

    if (!image) return res.status(400).json({ message: "Product image is required" });

    const product = await Product.create({
      name, description, price, stock, image, overlayImage,
      sizes: sizes ? sizes.split(",").map((s) => s.trim()) : [],
      createdBy: req.user.id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, description, price, sizes, stock } = req.body;
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    if (sizes) product.sizes = sizes.split(",").map((s) => s.trim());
    if (req.files?.image?.[0]) product.image = `/uploads/${req.files.image[0].filename}`;
    if (req.files?.overlayImage?.[0]) product.overlayImage = `/uploads/${req.files.overlayImage[0].filename}`;

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};