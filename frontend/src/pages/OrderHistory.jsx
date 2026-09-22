import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";

const statusClass = {
  pending: "badge-pending",
  processing: "badge-processing",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/my");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="state-message">Loading orders...</p>;

  return (
    <div>
      <h1 className="page-title">Order History</h1>

      {justPlaced && (
        <div className="alert alert-success">
          Your order was placed successfully! Order ID: {justPlaced}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="state-message">You haven't placed any orders yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </div>
                </div>
                <span className={`badge ${statusClass[order.status] || ""}`}>
                  {order.status}
                </span>
              </div>

              {order.orderItems.map((item, idx) => (
                <div key={idx} style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                  {item.name} {item.size && `(${item.size})`} × {item.quantity} — Rs. {(item.price * item.quantity).toLocaleString()}
                </div>
              ))}

              <div style={{
                display: "flex", justifyContent: "space-between", fontWeight: 700,
                marginTop: "0.8rem", paddingTop: "0.8rem", borderTop: "1px solid var(--color-border)",
              }}>
                <span>Total</span>
                <span>Rs. {order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;