import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import TryOnDialog from "../components/TryOnDialog";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showAITryOn, setShowAITryOn] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      if (data.sizes?.length) setSelectedSize(data.sizes[0]);
    } catch (err) {
      setError("Product not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    addToCart(product, quantity, selectedSize || null);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.sizes?.length && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    addToCart(product, quantity, selectedSize || null);
    navigate(user ? "/checkout" : "/login");
  };

  if (loading) return <p className="state-message">Loading...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!product) return null;

  return (
    <div>
      <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
        <Link to="/" style={{ color: "var(--color-text-muted)" }}>Shop</Link> / {product.name}
      </div>

      <div className="responsive-grid-2">
        <div style={{ maxWidth: "420px", margin: "0 auto" }}>
  <img
    src={product.image}
    alt={product.name}
    style={{ width: "100%", borderRadius: "var(--radius)", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
  />
</div>

        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {product.name}
          </h1>
          <p style={{ fontSize: "1.3rem", color: "var(--color-text-muted)", marginBottom: "1.2rem" }}>
            Rs. {product.price.toLocaleString()}
          </p>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            {product.description}
          </p>

          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Size
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="btn btn-sm"
                    style={{
                      border: selectedSize === size ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: "#fff", color: "var(--color-text)",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Quantity
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button className="btn btn-outline btn-sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button className="btn btn-outline btn-sm" onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <button className="btn btn-outline" style={{ flex: "1 1 140px" }} onClick={handleAddToCart}>
              {added ? "Added ✓" : "Add to Cart"}
            </button>
            <button className="btn btn-primary" style={{ flex: "1 1 140px" }} onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>

          {product.image && (
            <button
              className="btn btn-outline btn-block"
              style={{ marginBottom: "1rem" }}
              onClick={() => setShowAITryOn(true)}
            >
              Virtual Try-On
            </button>
          )}

          <p style={{ fontSize: "0.85rem", color: product.stock > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {showAITryOn && (
            <TryOnDialog
              product={{ name: product.name, image: product.image, garmentType: "upper_body" }}
              onClose={() => setShowAITryOn(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;