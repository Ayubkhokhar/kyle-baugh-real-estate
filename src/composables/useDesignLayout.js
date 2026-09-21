import { ref } from "vue";

const DESIGN_STORAGE_KEY = "kyle_design_layout_v1";

export const designOptions = [
  {
    id: "editorial",
    name: "Architectural Dossier",
    tagline: "Classic Editorial · Monograph Split · Formal Ledger",
    badge: "Design 1",
    description: "Refined architectural monograph layout with asymmetric split hero, classic 3-column card grid, and financial transaction ledger.",
    icon: "auto_stories",
  },
  {
    id: "cinematic",
    name: "Modern Cinematic Luxe",
    tagline: "100vh Full-Bleed · Frosted Glass HUD · Asymmetric Spreads",
    badge: "Design 2 (Ultra-Modern)",
    description: "High-impact Beverly Hills luxury layout with full-viewport cinematic hero, embedded glass search HUD, flagship property spotlight spread, and interactive blueprint forensics.",
    icon: "movie_filter",
  },
];

function getInitialDesign() {
  if (typeof window !== "undefined") {
    // 1. Check URL query parameters (?design=cinematic or ?design=editorial or ?layout=...)
    const params = new URLSearchParams(window.location.search);
    const urlDesign = params.get("design") || params.get("layout");
    if (urlDesign) {
      const normalized = urlDesign.toLowerCase();
      if (designOptions.some((d) => d.id === normalized)) {
        localStorage.setItem(DESIGN_STORAGE_KEY, normalized);
        return normalized;
      }
    }

    // 2. Check localStorage
    const saved = localStorage.getItem(DESIGN_STORAGE_KEY);
    if (saved && designOptions.some((d) => d.id === saved)) {
      return saved;
    }
  }
  // Default to the original current design (editorial)
  return "editorial";
}

const currentDesign = ref(getInitialDesign());

export function useDesignLayout() {
  function setDesign(id) {
    if (!designOptions.some((d) => d.id === id)) return;
    currentDesign.value = id;
    if (typeof window !== "undefined") {
      localStorage.setItem(DESIGN_STORAGE_KEY, id);
      const url = new URL(window.location.href);
      url.searchParams.set("design", id);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function getShareUrl(designId) {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}?design=${designId}`;
  }

  return {
    designOptions,
    currentDesign,
    setDesign,
    getShareUrl,
  };
}
