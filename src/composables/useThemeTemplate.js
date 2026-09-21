import { ref, watch, onMounted } from "vue";

const THEME_KEY = "kyle_luxury_template_v1";

export const templates = [
  {
    id: "prestige",
    name: "Architectural Prestige",
    tagline: "Warm Alabaster · Aged Brass · Editorial Serif",
    badge: "Classic Luxury",
    previewColor: "#BFA181",
    bgClass: "bg-[#FBFBF9]",
    cardClass: "bg-[#FFFFFF]",
    fontFamily: "'Playfair Display', serif",
  },
  {
    id: "noir",
    name: "Modern Minimalist Noir",
    tagline: "Obsidian Midnight · Chrome Gold · Ultra-Modern",
    badge: "Cinematic Dark",
    previewColor: "#D4AF37",
    bgClass: "bg-[#0B0D10]",
    cardClass: "bg-[#14171C]",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: "atelier",
    name: "Editorial Estate Atelier",
    tagline: "French Parchment · Antique Gold · Sotheby's Elegance",
    badge: "Heritage High-End",
    previewColor: "#9E7E50",
    bgClass: "bg-[#F5F2EB]",
    cardClass: "bg-[#FAF8F5]",
    fontFamily: "'Cormorant Garamond', serif",
  },
  {
    id: "penthouse",
    name: "Metropolitan Penthouse",
    tagline: "Glassmorphism · Navy Slate · Contemporary Azure",
    badge: "Metropolitan Glass",
    previewColor: "#0284C7",
    bgClass: "bg-[#F0F4F8]",
    cardClass: "bg-white/85 backdrop-blur-md",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
];

function applyThemeClasses(themeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Remove existing theme classes
  templates.forEach((t) => root.classList.remove(`theme-${t.id}`));
  // Add new theme class
  root.classList.add(`theme-${themeId}`);

  const active = templates.find((t) => t.id === themeId) || templates[0];
  root.style.setProperty("--font-headline", active.fontFamily);
}

function getInitialTheme() {
  if (typeof window !== "undefined") {
    // 1. Check URL query parameter (e.g. ?template=noir or ?theme=atelier)
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get("template") || params.get("theme");
    if (urlTheme && templates.some((t) => t.id === urlTheme.toLowerCase())) {
      const match = urlTheme.toLowerCase();
      localStorage.setItem(THEME_KEY, match);
      applyThemeClasses(match);
      return match;
    }

    // 2. Check localStorage
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && templates.some((t) => t.id === saved)) {
      applyThemeClasses(saved);
      return saved;
    }
  }
  applyThemeClasses("prestige");
  return "prestige";
}

const currentTemplate = ref(getInitialTheme());

export function useThemeTemplate() {
  function setTemplate(id) {
    if (!templates.some((t) => t.id === id)) return;
    currentTemplate.value = id;
    localStorage.setItem(THEME_KEY, id);
    applyThemeClasses(id);

    // Update URL without page reload so user can copy the link
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("template", id);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function getShareUrl(templateId) {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("template", templateId);
    return url.toString();
  }

  return {
    templates,
    currentTemplate,
    setTemplate,
    getShareUrl,
  };
}
