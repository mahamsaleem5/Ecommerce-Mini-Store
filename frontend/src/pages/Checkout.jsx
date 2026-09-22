import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", address: "", city: "", postalCode: "", phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        size: item.size,
      }));

      const { data } = await api.post("/orders", {
        orderItems,
        shippingAddress: form,
      });

      clearCart();
      navigate("/orders", { state: { justPlaced: data._id } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <p className="state-message">Your cart is empty. Add something before checking out.</p>;
  }

  return (
    <div>
      <h1 className="page-title">Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "3rem" }}>
        <form onSubmit={handleSubmit} className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "1.2rem" }}>
            Shipping Details
          </h2>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label>Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Postal Code</label>
              <input name="postalCode" value={form.postalCode} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </div>

          <div className="alert" style={{ background: "#f0eee6", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            This is a test store — no real payment will be charged. Placing an order simulates a completed purchase.
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Placing order..." : `Place Order — Rs. ${totalPrice.toLocaleString()}`}
          </button>
        </form>

        <div className="card" style={{ padding: "1.5rem", height: "fit-content" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "1rem" }}>
            Order Summary
          </h2>
          {cartItems.map((item) => (
            <div key={`${item._id}-${item.size}`} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.6rem" }}>
              <span>{item.name} {item.size && `(${item.size})`} × {item.quantity}</span>
              <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between", fontWeight: 700,
            paddingTop: "0.8rem", borderTop: "1px solid var(--color-border)", marginTop: "0.8rem",
          }}>
            <span>Total</span>
            <span>Rs. {totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;