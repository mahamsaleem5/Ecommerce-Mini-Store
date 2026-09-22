import { useState } from "react";
import { Link } from "react-router-dom";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-newsletter">
          <div className="footer-newsletter-text">
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
              Stay in the loop
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              New arrivals and early access to sales — no spam.
            </p>
          </div>

          {subscribed ? (
            <p style={{ fontSize: "0.9rem" }}>You're on the list — thank you.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          )}
        </div>

        <div className="footer-columns">
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/">All Products</Link>
            <Link to="/">New Arrivals</Link>
            <Link to="/cart">Your Cart</Link>
          </div>

          <div className="footer-col">
            <h4>Help</h4>
            <a href="mailto:hello@maison.com">Contact Us</a>
            <a href="#shipping">Shipping &amp; Returns</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Careers</a>
          </div>
        </div>
      </div>

      <div className="footer-trust">
        <span>🔒 Secure Checkout</span>
        <span>↩ 7-Day Easy Returns</span>
        <span>💵 Cash on Delivery Available</span>
        <span>🚚 Free Shipping over Rs. 5,000</span>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MAISON. All rights reserved.</span>
        <div className="footer-social">
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">Instagram</a>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook">Facebook</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;