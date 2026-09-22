import { ref, watch } from "vue";
import { useAgentResolver } from "./useAgentResolver";

const SETTINGS_KEY = "kyle_site_settings_v1";

export function getAgentDefaultSettings() {
  const { activeAgentData } = useAgentResolver();
  const profile = activeAgentData.value?.profile || {};
  return {
    advisorName: profile.advisorName || "Kyle Baugh",
    title: profile.title || "Lead Real Estate Advisor & Luxury Specialist",
    brokerage: profile.brokerage || "Compass RE Texas, LLC",
    phone: profile.phone || "214.980.3933",
    phoneTel: profile.phoneTel || "2149803933",
    email: profile.email || "kyle.baugh@compass.com",
    officeAddress: profile.officeAddress || "6220 Gaston Avenue, Suite 100, Dallas, TX 75214",
    headshot: profile.headshot || "/images/compass/kyle-headshot.webp",
    licenseInfo: "Licensed Texas Real Estate Broker",
    heroHeading: profile.heroHeading || "Modern Strategy. Construction Expertise. Unmatched Dallas Results.",
    heroSubheading: profile.heroSubheading || "Multimillion-dollar producer representing Dallas's most coveted architecturally significant enclaves—Park Cities, Preston Hollow, Lakewood, East Dallas, and Bluffview.",
    stat1Value: profile.stat1Value || "#1 Office Peer",
    stat1Label: profile.stat1Label || "Ranked Volume Among 200+ Peers",
    stat2Value: profile.stat2Value || "13+ Years",
    stat2Label: profile.stat2Label || "Commercial & Residential Rigor",
    stat3Value: profile.stat3Value || "B.S. Science",
    stat3Label: profile.stat3Label || "OU Construction Science Degree",
    stat4Value: profile.stat4Value || "Multi-Year",
    stat4Label: profile.stat4Label || "D Magazine Best Real Estate Agent",
    adminPasscode: "admin123",
    fontFamily: "'Playfair Display', serif",
    cloudflareWorkerUrl: "",
    cloudflareCustomDomain: "",
  };
}

function applyFont(font) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--font-headline", font);
  }
}

function loadSettings() {
  const defaultSettings = getAgentDefaultSettings();
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.advisorName && parsed.advisorName !== defaultSettings.advisorName) {
          localStorage.removeItem(SETTINGS_KEY);
          applyFont(defaultSettings.fontFamily);
          return { ...defaultSettings };
        }
        const merged = { ...defaultSettings, ...parsed };
        applyFont(merged.fontFamily || defaultSettings.fontFamily);
        return merged;
      }
    }
  } catch (e) {
    console.warn("Failed to parse saved site settings:", e);
  }
  applyFont(defaultSettings.fontFamily);
  return { ...defaultSettings };
}

const siteSettings = ref(loadSettings());

export function useSiteSettings() {
  function saveSettings(updated) {
    siteSettings.value = { ...siteSettings.value, ...updated };
    if (updated.fontFamily) {
      applyFont(updated.fontFamily);
    }
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(siteSettings.value));
      }
    } catch (e) {
      console.warn("Failed to persist site settings:", e);
    }
  }

  function resetSettings() {
    const defaults = getAgentDefaultSettings();
    siteSettings.value = { ...defaults };
    applyFont(defaults.fontFamily);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(SETTINGS_KEY);
      }
    } catch (e) {}
  }

  function verifyPasscode(entered) {
    return entered === siteSettings.value.adminPasscode;
  }

  return {
    siteSettings,
    saveSettings,
    resetSettings,
    verifyPasscode,
  };
}
