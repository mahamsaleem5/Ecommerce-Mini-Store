import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault(); // stop the Link navigation
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || null;
    addToCart(product, 1, defaultSize);
  };

  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={`https://ecommerce-mini-storebackend.onrender.com/${product.image}`}
          alt={product.name}
          loading="lazy"
        />

        {lowStock && (
          <span className="product-card-stock-badge">
            Only {product.stock} left
          </span>
        )}

        {product.stock > 0 && (
          <button className="product-card-quickadd" onClick={handleQuickAdd}>
            Add to cart
          </button>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">Rs. {product.price.toLocaleString()}</div>
      </div>
    </Link>
  );
}

export default ProductCard;