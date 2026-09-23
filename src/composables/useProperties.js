import { ref, computed, watch } from "vue";
import { defaultProperties } from "../data/seedProperties";
import { compassProperties as kyleProperties, compassSyncMeta as kyleCompassMeta } from "../data/compassProperties";
import { compassProperties as amyProperties } from "../data/agents/amyProperties";
import { useAgentResolver } from "./useAgentResolver";

const amyCompassMeta = {
  lastSynced: "2026-09-22T07:40:16.643Z",
  totalProperties: 45,
  activeCount: 1,
  soldCount: 44,
  leasedCount: 0,
  imagesDownloaded: 45,
  agentUrl: "https://www.compass.com/agents/amy-detwiler/",
  syncedAgent: "Amy Detwiler",
};

function getAgentStorageKey(agentId) {
  return "properties_" + (agentId || "kyle") + "_v2";
}

function getCompassMetaKey(agentId) {
  return "compass_meta_" + (agentId || "kyle") + "_v2";
}

function mergeProperties(existingList, incomingCompassList) {
  const merged = [...existingList];
  for (const cProp of incomingCompassList) {
    const existingIdx = merged.findIndex(
      (p) => String(p.id) === String(cProp.id) ||
             (p.title && cProp.title && p.title.toLowerCase().trim() === cProp.title.toLowerCase().trim())
    );
    if (existingIdx === -1) {
      merged.push(cProp);
    } else {
      // If the existing property is 2007 Euclid Avenue with placeholder image, upgrade to Compass real images
      if (merged[existingIdx].id === "2007-euclid-ave" && cProp.gallery && cProp.gallery.length > 1) {
        merged[existingIdx].heroImage = cProp.heroImage;
        merged[existingIdx].gallery = cProp.gallery;
        merged[existingIdx].isCompassListing = true;
        merged[existingIdx].originalCompassUrl = cProp.originalCompassUrl;
      }
    }
  }
  return merged;
}

function getInitialListForAgent(agentId) {
  if (agentId === "amy") {
    return amyProperties;
  }
  return kyleProperties.length > 0 ? kyleProperties : mergeProperties(defaultProperties, kyleProperties);
}

function getInitialMetaForAgent(agentId) {
  if (agentId === "amy") {
    return amyCompassMeta;
  }
  return kyleCompassMeta;
}

function loadProperties() {
  const { currentAgentId } = useAgentResolver();
  const agentId = currentAgentId.value || "kyle";
  const defaultList = getInitialListForAgent(agentId);
  const storageKey = getAgentStorageKey(agentId);

  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeProperties(defaultList, parsed);
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load properties from localStorage:", err);
  }
  return [...defaultList];
}

function loadCompassMeta() {
  const { currentAgentId } = useAgentResolver();
  const agentId = currentAgentId.value || "kyle";
  const defaultMeta = getInitialMetaForAgent(agentId);
  const metaKey = getCompassMetaKey(agentId);

  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(metaKey);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}
  return { ...defaultMeta };
}

const properties = ref(loadProperties());
const compassMeta = ref(loadCompassMeta());

// Watch for agent changes and reactively swap property catalogs
const { currentAgentId } = useAgentResolver();
watch(currentAgentId, () => {
  properties.value = loadProperties();
  compassMeta.value = loadCompassMeta();
});

export function useProperties() {
  function persist() {
    try {
      const agentId = currentAgentId.value || "kyle";
      localStorage.setItem(getAgentStorageKey(agentId), JSON.stringify(properties.value));
      localStorage.setItem(getCompassMetaKey(agentId), JSON.stringify(compassMeta.value));
    } catch (e) {
      console.error("Failed to persist to localStorage (quota exceeded?):", e);
    }
  }

  function getPropertyById(id) {
    const match = properties.value.find((p) => String(p.id) === String(id) || p.slug === String(id));
    if (match) return match;
    // Cross-agent fallback so direct links to any listing never fail
    const allKnown = [...amyProperties, ...kyleProperties, ...defaultProperties];
    return allKnown.find((p) => String(p.id) === String(id) || p.slug === String(id)) || null;
  }

  function addProperty(newProp) {
    const id = newProp.id || "prop-" + Date.now();
    const priceNum = Number(newProp.price) || 0;
    const sqftNum = Number(newProp.sqft) || 1;
    const pricePerSqft = Math.round(priceNum / sqftNum) || 0;

    const formatted = {
      id,
      title: newProp.title || newProp.address,
      address: newProp.address,
      neighborhood: newProp.neighborhood || "Dallas, TX",
      enclaveCategory: newProp.enclaveCategory || "lakewood",
      price: priceNum,
      priceFormatted: "$" + priceNum.toLocaleString(),
      pricePerSqft,
      status: newProp.status || "Active Exclusive",
      openHouse: newProp.openHouse || null,
      bedrooms: Number(newProp.bedrooms) || 3,
      bathrooms: Number(newProp.bathrooms) || 2,
      sqft: sqftNum,
      lotSize: newProp.lotSize || "0.25 Acres",
      garage: newProp.garage || "2-Car Garage",
      yearBuilt: Number(newProp.yearBuilt) || new Date().getFullYear(),
      typology: newProp.typology || "Single Family",
      heroImage: newProp.heroImage || "",
      gallery: Array.isArray(newProp.gallery) ? newProp.gallery : [],
      tagline: newProp.tagline || "",
      description: newProp.description || "",
      forensics: Array.isArray(newProp.forensics) ? newProp.forensics : [],
      highlights: Array.isArray(newProp.highlights) ? newProp.highlights : [],
      featured: Boolean(newProp.featured),
      createdAt: new Date().toISOString(),
      approxSizeMB: newProp.approxSizeMB || 1.0,
      isCompassListing: Boolean(newProp.isCompassListing),
    };

    properties.value.unshift(formatted);
    persist();
    return formatted;
  }

  function updateProperty(id, updated) {
    const idx = properties.value.findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      const existing = properties.value[idx];
      const priceNum = updated.price !== undefined ? Number(updated.price) : existing.price;
      const sqftNum = updated.sqft !== undefined ? Number(updated.sqft) : existing.sqft;
      const pricePerSqft = sqftNum > 0 ? Math.round(priceNum / sqftNum) : existing.pricePerSqft;

      properties.value[idx] = {
        ...existing,
        ...updated,
        price: priceNum,
        priceFormatted: updated.priceFormatted || ("$" + priceNum.toLocaleString()),
        pricePerSqft,
      };
      persist();
      return properties.value[idx];
    }
    return null;
  }

  function deleteProperty(id) {
    properties.value = properties.value.filter((p) => String(p.id) !== String(id));
    persist();
  }

  function toggleStatus(id, newStatus) {
    const prop = properties.value.find((p) => String(p.id) === String(id));
    if (prop) {
      prop.status = newStatus;
      persist();
    }
  }

  async function syncWithCompass() {
    const agentId = currentAgentId.value || "kyle";
    const defaultMeta = getInitialMetaForAgent(agentId);
    const beforeCount = properties.value.length;
    const defaultList = getInitialListForAgent(agentId);

    properties.value = mergeProperties(properties.value, defaultList);
    const newCount = properties.value.length - beforeCount;
    compassMeta.value = {
      ...defaultMeta,
      lastSynced: new Date().toISOString(),
      totalProperties: properties.value.filter(p => p.isCompassListing).length,
      activeCount: properties.value.filter(p => p.isCompassListing && p.status?.includes("Active")).length,
      soldCount: properties.value.filter(p => p.isCompassListing && (p.status?.includes("Sold") || p.status?.includes("Leased"))).length,
    };
    persist();
    return { success: true, newCount, total: properties.value.length };
  }

  function resetToDefaults() {
    const agentId = currentAgentId.value || "kyle";
    properties.value = [...getInitialListForAgent(agentId)];
    compassMeta.value = { ...getInitialMetaForAgent(agentId) };
    persist();
  }

  function exportJSON() {
    const agentId = currentAgentId.value || "kyle";
    const dataStr = JSON.stringify(properties.value, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentId}-properties-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) {
            properties.value = parsed;
            persist();
            resolve(parsed.length);
          } else {
            reject(new Error("Invalid backup file: expected non-empty array of properties"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }

  return {
    properties,
    compassMeta,
    getPropertyById,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleStatus,
    syncWithCompass,
    resetToDefaults,
    exportJSON,
    importJSON,
  };
}
