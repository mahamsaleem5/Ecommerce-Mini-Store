import { useState, useEffect } from "react";
import api from "../../api/axios";

const emptyForm = {
  name: "", description: "", price: "", stock: "", sizes: "",
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [overlayFile, setOverlayFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      setProducts(data.products);
    } catch (err) {
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setOverlayFile(null);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sizes: product.sizes?.join(",") || "",
    });
    setEditingId(product._id);
    setImageFile(null);
    setOverlayFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setSuccess("Product deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!editingId && !imageFile) {
      setError("Please select a product image.");
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("stock", form.stock);
    fd.append("sizes", form.sizes);
    if (imageFile) fd.append("image", imageFile);
    if (overlayFile) fd.append("overlayImage", overlayFile);

    try {
      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProducts((prev) => prev.map((p) => (p._id === editingId ? data : p)));
        setSuccess("Product updated.");
      } else {
        const { data } = await api.post("/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProducts((prev) => [data, ...prev]);
        setSuccess("Product created.");
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Products</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "2.5rem" }}>
        {/* Form */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: "1.5rem", height: "fit-content" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "1rem" }}>
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <div className="input-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label>Price (Rs.)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" />
            </div>
            <div className="input-group">
              <label>Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" />
            </div>
          </div>

          <div className="input-group">
            <label>Sizes (comma-separated)</label>
            <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="S,M,L,XL" />
          </div>

          <div className="input-group">
            <label>Product Image {editingId && "(leave empty to keep current)"}</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>

          <div className="input-group">
            <label>Try-On Overlay Image (transparent PNG, optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setOverlayFile(e.target.files[0])} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Product list */}
        <div>
          {loading ? (
            <p className="state-message">Loading products...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sizes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={product.name}
                        style={{ width: "45px", height: "55px", objectFit: "cover" }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>Rs. {product.price.toLocaleString()}</td>
                    <td>{product.stock}</td>
                    <td>{product.sizes?.join(", ") || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(product)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;