const { Client, handle_file } = require("@gradio/client");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");

exports.generateTryOn = async (req, res) => {
  try {
    const { personImage } = req.body;
    const { productId } = req.params;

    if (!personImage) {
      return res.status(400).json({ message: "Person photo is required." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const garmentPath = product.overlayImage || product.image;
    const garmentFullPath = path.join(__dirname, "..", garmentPath);
    const garmentBuffer = fs.readFileSync(garmentFullPath);
    const garmentBlob = new Blob([garmentBuffer], { type: "image/png" });

    const base64Data = personImage.split(",")[1];
    const personBuffer = Buffer.from(base64Data, "base64");
    const personBlob = new Blob([personBuffer], { type: "image/jpeg" });

    const app = await Client.connect("Kwai-Kolors/Kolors-Virtual-Try-On");
     
    // TEMPORARY — prints the real available endpoints and their expected inputs
    const apiInfo = await app.view_api();
    console.log("Available API:", JSON.stringify(apiInfo, null, 2));

    const result = await app.predict("/tryon", {
      person_img: handle_file(personBlob),
      garment_img: handle_file(garmentBlob),
      seed: 0,
      randomize_seed: true,
    });

    console.log("Kolors raw result:", JSON.stringify(result.data));

    const resultImageUrl = result.data?.[0]?.url;

    if (!resultImageUrl) {
      return res.status(503).json({
        message: "The free try-on service didn't return an image — it may be busy. Please try again in a moment.",
      });
    }

    res.json({ resultUrl: resultImageUrl });
  } catch (error) {
    console.error("Try-on error:", error);
    res.status(503).json({
      message: "The free try-on service is busy or temporarily unavailable. Please try again shortly.",
    });
  }
};