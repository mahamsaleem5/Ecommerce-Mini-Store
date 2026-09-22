/**
 * Virtual try-on backend — works with plain Node 18+ (built-in fetch, no extra packages).
 * Free, no API key required. Tries three free public services in order; if one is
 * busy or out of quota it automatically falls back to the next.
 *
 * OPTIONAL (recommended): create a free Hugging Face account, make a token at
 * https://huggingface.co/settings/tokens and run the server with:
 *   HF_TOKEN=hf_xxx node tryon-server.js
 * This gives you a much larger free GPU quota and far fewer "busy" responses.
 *
 * Endpoint:
 *   POST /tryon
 *   Body: { personImage: "<data URL of shopper photo>",
 *           garmentUrl:  "<absolute URL of garment photo>",
 *           garmentType: "upper_body" | "lower_body" | "dresses",
 *           garmentName: "optional product name" }
 *   Response: { resultUrl: "<data URL of the finished try-on image>" }
 */

import http from "node:http";

// ---------------------------------------------------------------------------
// Free providers (public Gradio spaces). Order = fallback order.
// ---------------------------------------------------------------------------
const providers = [
  {
    name: "idm-vton",
    base: "https://yisol-idm-vton.hf.space",
    prefix: "",
    endpoint: "tryon",
    payload: (person, garment, input) => [
      { background: person, layers: [], composite: null },
      garment,
      input.garmentName || "a clothing item",
      true,
      false,
      30,
      42,
    ],
  },
  {
    name: "leffa",
    base: "https://franciszzj-leffa.hf.space",
    prefix: "/gradio_api",
    endpoint: "leffa_predict_vt",
    payload: (person, garment, input) => [
      person,
      garment,
      false,
      30,
      2.5,
      42,
      "viton_hd",
      input.garmentType,
      false,
    ],
  },
  {
    name: "change-clothes-ai",
    base: "https://jallenjia-change-clothes-ai.hf.space",
    prefix: "",
    endpoint: "tryon",
    payload: (person, garment, input) => [
      { background: person, layers: [], composite: null },
      garment,
      input.garmentName || "a clothing item",
      true,
      false,
      30,
      42,
      "upper_body",
    ],
  },
];

function authHeaders() {
  const token = process.env.HF_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : {};
}

function dataUrlToBytes(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) throw new Error("INVALID_IMAGE");
  const mime = match[1] || "image/jpeg";
  return { bytes: Buffer.from(match[2], "base64"), mime };
}

function bytesToDataUrl(bytes, mime) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

// The free spaces serve results from temporary links browsers often cannot
// load (hotlink protection / short lifetime), so we fetch the finished image
// on the server and hand the page a self-contained data URL.
async function inlineResult(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return url;
  const mime = res.headers.get("content-type") || "image/png";
  return bytesToDataUrl(Buffer.from(await res.arrayBuffer()), mime);
}

async function upload(provider, bytes, mime, name) {
  const form = new FormData();
  form.append("files", new Blob([bytes], { type: mime }), name);
  const res = await fetch(`${provider.base}${provider.prefix}/upload`, {
    method: "POST",
    body: form,
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`UPLOAD_FAILED_${res.status}`);
  const paths = await res.json();
  if (!paths?.[0]) throw new Error("UPLOAD_FAILED");
  return { path: paths[0], meta: { _type: "gradio.FileData" } };
}

async function predict(provider, data) {
  const callUrl = `${provider.base}${provider.prefix}/call/${provider.endpoint}`;
  const startRes = await fetch(callUrl, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify({ data }),
  });
  if (!startRes.ok) throw new Error(`CALL_FAILED_${startRes.status}`);
  const { event_id: eventId } = await startRes.json();
  if (!eventId) throw new Error("NO_EVENT_ID");

  const streamRes = await fetch(`${callUrl}/${eventId}`, { headers: authHeaders() });
  if (!streamRes.body) throw new Error("NO_STREAM");

  const reader = streamRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("event:")) currentEvent = line.slice(6).trim();
      if (!line.startsWith("data:")) continue;
      if (currentEvent === "error") throw new Error("PROVIDER_ERROR");
      if (currentEvent !== "complete") continue;

      const payload = JSON.parse(line.slice(5).trim());
      const url = findImageUrl(payload);
      if (!url) throw new Error("NO_RESULT");
      return url;
    }
  }
  throw new Error("STREAM_ENDED");
}

function findImageUrl(payload) {
  if (!payload) return null;
  if (typeof payload === "string") return payload.startsWith("http") ? payload : null;
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const url = findImageUrl(item);
      if (url) return url;
    }
    return null;
  }
  if (typeof payload === "object") {
    if (typeof payload.url === "string") return payload.url;
    for (const value of Object.values(payload)) {
      const url = findImageUrl(value);
      if (url) return url;
    }
  }
  return null;
}

// Main try-on: try each provider, 2 attempts each.
async function generateTryOn(input) {
  const person = dataUrlToBytes(input.personImage);

  const garmentRes = await fetch(input.garmentUrl);
  if (!garmentRes.ok) throw new Error("GARMENT_LOAD_FAILED");
  const garmentBytes = Buffer.from(await garmentRes.arrayBuffer());
  const garmentMime = garmentRes.headers.get("content-type") || "image/jpeg";

  for (const provider of providers) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const personFile = await upload(provider, person.bytes, person.mime, "person.jpg");
        const garmentFile = await upload(provider, garmentBytes, garmentMime, "garment.jpg");
        const resultUrl = await predict(provider, provider.payload(personFile, garmentFile, input));
        return { resultUrl: await inlineResult(resultUrl), provider: provider.name };
      } catch (error) {
        console.error(`try-on provider ${provider.name} attempt ${attempt + 1} failed:`, error.message);
        if (attempt === 0) await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  throw new Error("All try-on services are busy right now. Please wait a minute and try again.");
}

// ---------------------------------------------------------------------------
// Minimal HTTP server (swap in Express if you already use it — just call
// generateTryOn(req.body) from your POST /tryon route).
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // CORS so your React dev server can call it.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "POST" && req.url === "/tryon") {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      if (!input.personImage || !input.garmentUrl) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "personImage and garmentUrl are required" }));
        return;
      }
      input.garmentType = input.garmentType || "upper_body";
      const result = await generateTryOn(input);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error("try-on failed:", error);
      res.writeHead(503, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: error.message || "Try-on failed" }));
    }
    return;
  }

  res.writeHead(404); res.end();
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Try-on server on port ${PORT}`));