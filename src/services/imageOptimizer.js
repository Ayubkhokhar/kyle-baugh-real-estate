/**
 * Client-Side Canvas Image Optimizer
 * Resizes and compresses uploaded images to prevent exceeding localStorage quotas
 * Produces clean, web-optimized JPEG/WebP data URLs under ~100-200KB
 */

export function optimizeImage(file, maxWidth = 1400, maxHeight = 1050, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      return reject(new Error("Selected file is not an image"));
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          name: file.name,
          originalSize: file.size,
          compressedSize: approxBytes,
          compressedMB: (approxBytes / (1024 * 1024)).toFixed(3),
          width,
          height,
        });
      };
      img.onerror = (err) => reject(err);
      img.src = readerEvent.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate approximate byte size of a base64 string or URL
 */
export function estimateMediaBytes(url) {
  if (!url) return 0;
  if (url.startsWith("data:")) {
    const base64Part = url.split(",")[1] || "";
    return Math.round((base64Part.length * 3) / 4);
  }
  // For remote URLs (Cloudflare, Google CDN), estimate ~1.2MB average if unknown
  return 1.2 * 1024 * 1024;
}
