import { ref, computed } from "vue";
import { estimateMediaBytes } from "../services/imageOptimizer.js";

const THRESHOLD_KEY = "kyle_storage_threshold_gb";
const UPGRADED_KEY = "kyle_cf_upgraded";

// Default to 8.0 GB (guarding within Cloudflare 10 GB free tier)
const savedThreshold = typeof localStorage !== "undefined" ? parseFloat(localStorage.getItem(THRESHOLD_KEY) || "8.0") : 8.0;
const savedUpgraded = typeof localStorage !== "undefined" ? localStorage.getItem(UPGRADED_KEY) === "true" : false;

const storageThresholdGB = ref(savedThreshold);
const isUpgraded = ref(savedUpgraded);
const showLimitModal = ref(false);
const quotaEventDetails = ref(null);

export function useStorageQuota() {
  /**
   * Compute total media size from property list
   */
  function calculateTotalBytes(properties = []) {
    let total = 0;
    for (const prop of properties) {
      if (prop.approxSizeMB) {
        total += prop.approxSizeMB * 1024 * 1024;
      } else {
        if (prop.heroImage) total += estimateMediaBytes(prop.heroImage);
        if (Array.isArray(prop.gallery)) {
          for (const item of prop.gallery) {
            total += estimateMediaBytes(item.url || item);
          }
        }
      }
    }
    return total;
  }

  /**
   * Format bytes to readable string (MB or GB)
   */
  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return "0.00 MB";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  /**
   * Guard function: Check if incoming files exceed the 8 GB threshold
   * If limit reached, prevents further upload and triggers decision modal!
   */
  function checkUploadQuota(incomingBytes, currentProperties = []) {
    // If client already opted into paid/unlimited Cloudflare tier, allow upload
    if (isUpgraded.value && storageThresholdGB.value >= 100) {
      return { allowed: true };
    }

    const currentBytes = calculateTotalBytes(currentProperties);
    const limitBytes = storageThresholdGB.value * 1024 * 1024 * 1024;
    const projectedBytes = currentBytes + incomingBytes;

    if (projectedBytes >= limitBytes) {
      quotaEventDetails.value = {
        currentGB: (currentBytes / (1024 * 1024 * 1024)).toFixed(2),
        incomingGB: (incomingBytes / (1024 * 1024 * 1024)).toFixed(2),
        limitGB: storageThresholdGB.value.toFixed(1),
        excessGB: ((projectedBytes - limitBytes) / (1024 * 1024 * 1024)).toFixed(2),
      };
      showLimitModal.value = true;
      return {
        allowed: false,
        reason: "CLOUDFLARE_8GB_LIMIT_REACHED",
        details: quotaEventDetails.value,
      };
    }

    return { allowed: true };
  }

  /**
   * Update the threshold setting (e.g. 8GB -> 25GB or 50GB)
   */
  function setThreshold(newGB) {
    storageThresholdGB.value = Number(newGB);
    localStorage.setItem(THRESHOLD_KEY, String(newGB));
  }

  /**
   * Mark as upgraded to Cloudflare paid data tier
   */
  function setUpgraded(status = true, newGB = 50.0) {
    isUpgraded.value = status;
    localStorage.setItem(UPGRADED_KEY, String(status));
    if (status) {
      setThreshold(newGB);
    }
    showLimitModal.value = false;
  }

  function closeLimitModal() {
    showLimitModal.value = false;
  }

  return {
    storageThresholdGB,
    isUpgraded,
    showLimitModal,
    quotaEventDetails,
    calculateTotalBytes,
    formatBytes,
    checkUploadQuota,
    setThreshold,
    setUpgraded,
    closeLimitModal,
  };
}
