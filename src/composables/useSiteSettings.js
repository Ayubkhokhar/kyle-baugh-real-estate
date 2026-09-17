import { ref, watch } from "vue";

const SETTINGS_KEY = "kyle_site_settings_v1";

const defaultSettings = {
  advisorName: "Kyle Baugh",
  title: "Lead Real Estate Advisor & Construction Specialist",
  brokerage: "Kyle Baugh Real Estate Advisory",
  phone: "214.980.3933",
  phoneTel: "2149803933",
  email: "kyle@kylebaughrealty.com",
  officeAddress: "Preston Center, Dallas TX 75225",
  licenseInfo: "Licensed Texas Real Estate Broker",
  heroHeading: "Modern Strategy. Construction Expertise. Unmatched Dallas Results.",
  heroSubheading: "Multimillion-dollar producer representing Dallas\'s most coveted architecturally significant enclaves—Park Cities, Preston Hollow, Lakewood, East Dallas, and Bluffview. Powered by 13+ years of commercial construction rigor and data-driven market intelligence.",
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
        const parsed = { ...defaultSettings, ...JSON.parse(saved) };
        applyFont(parsed.fontFamily || defaultSettings.fontFamily);
        return parsed;
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
