/**
 * Virtual try-on dialog — React component, no UI library required.
 * Paste into your React app, render it with a product that has
 * { id, name, tagline, image, garmentType } and an onClose callback.
 *
 * It calls POST http://localhost:3001/tryon (see tryon-server.js).
 */
import { useRef, useState } from "react";

const TRYON_API = "https://ecommerce-tryon-server.onrender.com/tryon";

// Downscale + compress in the browser so uploads stay fast on a free service.
async function prepareImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode_failed"));
    img.src = dataUrl;
  });

  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function TryOnDialog({ product, onClose }) {
  const fileInputRef = useRef(null);

  const [personPhoto, setPersonPhoto] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setResultUrl(null);
    try {
      setPersonPhoto(await prepareImage(file));
    } catch {
      setError("That image couldn't be read. Try a JPG or PNG photo.");
    }
  };

  const handleGenerate = async () => {
    if (!personPhoto) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(TRYON_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          personImage: personPhoto,
          garmentUrl: product.image,
          garmentType: product.garmentType || "upper_body",
          garmentName: "a long, knee-length traditional kurta, full sleeve, flowing fabric",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Try-on failed. Please try again in a moment.");
      setResultUrl(json.resultUrl);
    } catch (err) {
      setError(err.message || "Try-on failed. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>VIRTUAL FITTING ROOM</p>
            <h2 style={{ margin: 0 }}>{product.name}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={styles.closeBtn}>✕</button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          <div>
            <p style={styles.label}>Your photo</p>
            <div style={{ ...styles.panel, borderStyle: "dashed" }}>
              {personPhoto ? (
                <img src={personPhoto} alt="Your photo" style={styles.imgCover} />
              ) : (
                <div style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ color: "#666", fontSize: 14 }}>
                    Upload a clear, front-facing photo where your whole upper body is visible.
                  </p>
                  <button style={styles.btn} onClick={() => fileInputRef.current?.click()}>
                    Choose photo
                  </button>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
            {personPhoto && (
              <button
                style={{ ...styles.btnOutline, width: "100%", marginTop: 12 }}
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
              >
                Use a different photo
              </button>
            )}
          </div>

          <div>
            <p style={styles.label}>The result</p>
            <div style={styles.panel}>
              {resultUrl ? (
                <img src={resultUrl} alt="Try-on result" style={styles.imgContain} />
              ) : loading ? (
                <div style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ color: "#666", fontSize: 14 }}>
                    Fitting the garment to your photo — usually 15–40 seconds.
                  </p>
                </div>
              ) : (
                <img src={product.image} alt={product.name} style={{ ...styles.imgContain, opacity: 0.6, padding: 24 }} />
              )}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button
                style={{ ...styles.btn, flex: 1, opacity: !personPhoto || loading ? 0.5 : 1 }}
                disabled={!personPhoto || loading}
                onClick={handleGenerate}
              >
                {loading ? "Generating…" : resultUrl ? "Try again" : "Try it on"}
              </button>
              {resultUrl && (
                <a href={resultUrl} download="tryon-result.png" style={styles.btnOutline}>Download</a>
              )}
            </div>
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "#888" }}>
          Try-on runs on a free shared service, so it can be slow or busy at peak times.
          Your photo is used only to create this preview.
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", padding: 16 },
  card: { maxHeight: "92vh", width: "100%", maxWidth: 900, overflowY: "auto", borderRadius: 16, background: "#fff", padding: 28 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  eyebrow: { fontSize: 11, letterSpacing: "0.2em", color: "#888", margin: "0 0 4px" },
  closeBtn: { border: "none", background: "none", fontSize: 18, cursor: "pointer" },
  error: { marginBottom: 16, borderRadius: 8, border: "1px solid #f3c1c1", background: "#fdeeee", color: "#b3261e", padding: "10px 14px", fontSize: 14 },
  grid: { display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" },
  label: { fontSize: 14, fontWeight: 600, marginBottom: 10 },
  panel: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "3/4", overflow: "hidden", borderRadius: 12, border: "1px solid #ddd", background: "#f5f3f0" },
  imgCover: { width: "100%", height: "100%", objectFit: "cover" },
  imgContain: { width: "100%", height: "100%", objectFit: "contain" },
  btn: { background: "#3d3a34", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 14 },
  btnOutline: { background: "#fff", color: "#3d3a34", border: "1px solid #ccc", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 14, textDecoration: "none", textAlign: "center" },
};
