import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: "700px" }}>
        <Link to="/admin/products" className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.5rem" }}>
            Manage Products
          </div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Add, edit, or remove items from the store
          </div>
        </Link>

        <Link to="/admin/orders" className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.5rem" }}>
            Manage Orders
          </div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            View all customer orders and update status
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;