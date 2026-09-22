import { useState, useEffect } from "react";
import api from "../../api/axios";

const statusClass = {
  pending: "badge-pending",
  processing: "badge-processing",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      setError("Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    } catch (err) {
      alert("Could not update order status.");
    }
  };

  if (loading) return <p className="state-message">Loading orders...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h1 className="page-title">Manage Orders</h1>

      {orders.length === 0 ? (
        <p className="state-message">No orders yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id.slice(-8).toUpperCase()}</td>
                <td>
                  {order.user?.name}
                  <br />
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                    {order.user?.email}
                  </span>
                </td>
                <td style={{ fontSize: "0.85rem" }}>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx}>{item.name} × {item.quantity}</div>
                  ))}
                </td>
                <td>Rs. {order.totalPrice.toLocaleString()}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{
                      padding: "0.4rem 0.6rem", border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)", fontSize: "0.85rem",
                    }}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminOrders;