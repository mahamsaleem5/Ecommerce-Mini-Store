import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate(user ? "/checkout" : "/login");
  };

  if (cartItems.length === 0) {
    return (
      <div className="state-message">
        <p style={{ marginBottom: "1rem" }}>Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Your Cart</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "3rem" }}>
        <div>
          {cartItems.map((item) => (
            <div
              key={`${item._id}-${item.size}`}
              style={{
                display: "flex", gap: "1.2rem", padding: "1.2rem 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{ width: "90px", height: "110px", objectFit: "cover" }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", marginBottom: "0.2rem" }}>
                  {item.name}
                </div>
                {item.size && (
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                    Size: {item.size}
                  </div>
                )}
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "0.6rem" }}>
                  Rs. {item.price.toLocaleString()}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item._id, item.size)}
                    style={{
                      marginLeft: "1rem", background: "none", border: "none",
                      color: "var(--color-danger)", fontSize: "0.85rem", cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                Rs. {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "1.5rem", height: "fit-content" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "1rem" }}>
            Order Summary
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem", color: "var(--color-text-muted)" }}>
            <span>Subtotal</span>
            <span>Rs. {totalPrice.toLocaleString()}</span>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", fontWeight: 700,
            fontSize: "1.1rem", paddingTop: "0.8rem", borderTop: "1px solid var(--color-border)",
            marginBottom: "1.2rem",
          }}>
            <span>Total</span>
            <span>Rs. {totalPrice.toLocaleString()}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;