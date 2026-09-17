/**
 * Cloudflare Integration Service
 * Supports direct uploads to a Cloudflare Worker / Direct Upload URL,
 * or falls back to optimized Base64 storage while tracking Cloudflare storage footprint.
 */

export async function uploadToCloudflare(fileOrDataUrl, workerEndpoint = null) {
  // If a custom Cloudflare Worker / R2 endpoint is configured:
  if (workerEndpoint && workerEndpoint.trim().startsWith("http")) {
    try {
      const formData = new FormData();
      if (typeof fileOrDataUrl === "string") {
        // Convert base64 to blob
        const res = await fetch(fileOrDataUrl);
        const blob = await res.blob();
        formData.append("file", blob, `property-${Date.now()}.jpg`);
      } else {
        formData.append("file", fileOrDataUrl);
      }

      const response = await fetch(workerEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Cloudflare worker upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        url: data.url || data.result?.url,
        provider: "cloudflare",
        bytes: data.bytes || fileOrDataUrl.size || 500000,
      };
    } catch (err) {
      console.warn("Cloudflare worker upload failed, using local storage fallback:", err);
    }
  }

  // Fallback: return as local media
  return {
    url: typeof fileOrDataUrl === "string" ? fileOrDataUrl : null,
    provider: "local",
    bytes: typeof fileOrDataUrl === "string" ? Math.round((fileOrDataUrl.length * 3) / 4) : fileOrDataUrl.size,
  };
}
