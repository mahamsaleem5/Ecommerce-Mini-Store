import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>MAISON</Link>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-links ${menuOpen ? "navbar-links-open" : ""}`}>
        <Link to="/" onClick={closeMenu}>Shop</Link>

        {user && <Link to="/orders" onClick={closeMenu}>Orders</Link>}
        {user?.role === "admin" && <Link to="/admin" onClick={closeMenu}>Admin</Link>}

        <Link to="/cart" onClick={closeMenu}>
          Cart
          {totalItems > 0 && <span className="navbar-cart-badge">{totalItems}</span>}
        </Link>

        {user ? (
          <>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
              Hi, {user.name}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;