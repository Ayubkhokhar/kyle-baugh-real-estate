import { ref, watch } from "vue";
import { agentProfile } from "../data/agentProfile";

const SETTINGS_KEY = "kyle_site_settings_v1";

const defaultSettings = {
  advisorName: agentProfile?.advisorName || "Kyle Baugh",
  title: agentProfile?.title || "Lead Real Estate Advisor & Luxury Specialist",
  brokerage: agentProfile?.brokerage || "Compass RE Texas, LLC",
  phone: agentProfile?.phone || "214.980.3933",
  phoneTel: agentProfile?.phoneTel || "2149803933",
  email: agentProfile?.email || "kyle.baugh@compass.com",
  officeAddress: agentProfile?.officeAddress || "6220 Gaston Avenue, Suite 100, Dallas, TX 75214",
  headshot: agentProfile?.headshot || "/images/compass/agent-headshot.webp",
  licenseInfo: "Licensed Texas Real Estate Broker",
  heroHeading: agentProfile?.heroHeading || "Modern Strategy. Construction Expertise. Unmatched Dallas Results.",
  heroSubheading: agentProfile?.heroSubheading || "Multimillion-dollar producer representing Dallas's most coveted architecturally significant enclaves—Park Cities, Preston Hollow, Lakewood, East Dallas, and Bluffview.",
  stat1Value: "#1 Office Peer",
  stat1Label: "Ranked Volume Among 200+ Peers",
  stat2Value: "13+ Years",
  stat2Label: "Commercial & Residential Rigor",
  stat3Value: "B.S. Science",
  stat3Label: "OU Construction Science Degree",
  stat4Value: "Multi-Year",
  stat4Label: "D Magazine Best Real Estate Agent",
  adminPasscode: "admin123",
  fontFamily: "'Playfair Display', serif",
  cloudflareWorkerUrl: "",
  cloudflareCustomDomain: "",
};

function applyFont(font) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--font-headline", font);
  }
}

function loadSettings() {
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
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(siteSettings.value));
  }

  function resetSettings() {
    siteSettings.value = { ...defaultSettings };
    applyFont(defaultSettings.fontFamily);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(siteSettings.value));
  }

  function verifyPasscode(input) {
    return input.trim() === siteSettings.value.adminPasscode.trim();
  }

  return {
    siteSettings,
    saveSettings,
    resetSettings,
    verifyPasscode,
  };
}
