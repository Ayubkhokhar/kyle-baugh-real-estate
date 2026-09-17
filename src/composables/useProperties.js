import { ref, computed } from "vue";
import { defaultProperties } from "../data/seedProperties";

const STORAGE_KEY = "kyle_baugh_properties_v1";

function loadProperties() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load properties from localStorage:", err);
  }
  return [...defaultProperties];
}

const properties = ref(loadProperties());

export function useProperties() {
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties.value));
    } catch (e) {
      console.error("Failed to persist to localStorage (quota exceeded?):", e);
    }
  }

  function getPropertyById(id) {
    return properties.value.find((p) => String(p.id) === String(id));
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
        priceFormatted: "$" + priceNum.toLocaleString(),
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
    const prop = getPropertyById(id);
    if (prop) {
      prop.status = newStatus;
      persist();
    }
  }

  function resetToDefaults() {
    properties.value = JSON.parse(JSON.stringify(defaultProperties));
    persist();
  }

  function exportJSON() {
    const dataStr = JSON.stringify(properties.value, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyle-baugh-properties-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
    getPropertyById,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleStatus,
    resetToDefaults,
    exportJSON,
    importJSON,
  };
}
