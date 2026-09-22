import { useState, useEffect } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [search, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (sort) params.sort = sort;

      const { data } = await api.get("/products", { params });
      setProducts(data.products);
    } catch (err) {
      setError("Could not load products. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Shop the Collection</h1>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "0.55rem 0.9rem", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)", fontSize: "0.9rem", width: "220px",
            }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "0.55rem 0.9rem", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)", fontSize: "0.9rem",
            }}
          >
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading && <p className="state-message">Loading products...</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <p className="state-message">No products found. Check back soon.</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default Store;