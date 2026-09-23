import { ref, computed } from "vue";
import { agentProfile as kyleProfile } from "../data/agentProfile";
import { amyProfile } from "../data/agents/amyProfile";
import { compassProperties as kyleProperties } from "../data/compassProperties";
import { compassProperties as amyProperties } from "../data/agents/amyProperties";

const AGENT_STORAGE_KEY = "kyle_active_agent_v1";

export const availableAgents = [
  {
    id: "kyle",
    name: "Kyle Baugh",
    title: "Dallas Luxury Advisory & Construction Science",
    slug: "kyle",
    profile: kyleProfile,
    properties: kyleProperties,
    previewColor: "#BFA181",
  },
  {
    id: "amy",
    name: "Amy Detwiler",
    title: "Highland Park & Preston Hollow #1 Producer",
    slug: "amy",
    profile: amyProfile,
    properties: amyProperties,
    previewColor: "#D4AF37",
  },
];

function getInitialAgentId() {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const params = new URLSearchParams(window.location.search);

    // 1. Subdomain Check (e.g. amydetwiler.workers.dev or amy.workers.dev)
    if (hostname.includes("amy") || hostname.includes("detwiler")) {
      return "amy";
    }
    if (hostname.includes("kyle") || hostname.includes("baugh")) {
      // Continue to path check in case /amy is accessed on kyle domain
    }

    // 2. Clean Path Check (e.g. /amy, /amy-detwiler, /agent/amy)
    if (pathname.includes("/amy") || pathname.includes("/detwiler")) {
      localStorage.setItem(AGENT_STORAGE_KEY, "amy");
      return "amy";
    }
    if (pathname.includes("/kyle") || pathname.includes("/baugh")) {
      localStorage.setItem(AGENT_STORAGE_KEY, "kyle");
      return "kyle";
    }

    // 3. URL Query Parameter (?agent=amy or ?client=amy)
    const queryAgent = (params.get("agent") || params.get("client") || "").toLowerCase().trim();
    if (queryAgent && availableAgents.some((a) => a.id === queryAgent)) {
      localStorage.setItem(AGENT_STORAGE_KEY, queryAgent);
      return queryAgent;
    }

    // 4. LocalStorage (only if previously explicitly selected)
    const saved = localStorage.getItem(AGENT_STORAGE_KEY);
    if (saved && availableAgents.some((a) => a.id === saved)) {
      return saved;
    }
  }
  // Default is ALWAYS Kyle Baugh to protect Kyle's direct link
  return "kyle";
}

const currentAgentId = ref(getInitialAgentId());

export function useAgentResolver() {
  const activeAgentData = computed(() => {
    return availableAgents.find((a) => a.id === currentAgentId.value) || availableAgents[0];
  });

  function setAgent(id) {
    if (!availableAgents.some((a) => a.id === id)) return;
    currentAgentId.value = id;
    if (typeof window !== "undefined") {
      localStorage.setItem(AGENT_STORAGE_KEY, id);
      const url = new URL(window.location.href);
      if (id === "kyle") {
        url.pathname = "/kyle";
        url.searchParams.delete("agent");
        url.searchParams.delete("client");
      } else {
        url.pathname = "/amy";
        url.searchParams.delete("agent");
        url.searchParams.delete("client");
      }
      window.history.replaceState({}, "", url.toString());
      window.location.reload();
    }
  }

  function getAgentShareUrl(agentId, extraParams = {}) {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const targetPath = agentId === "amy" ? "/amy" : "/kyle";
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `${origin}${targetPath}?${qs}` : `${origin}${targetPath}`;
  }

  function setAgentWithoutReload(id) {
    if (!availableAgents.some((a) => a.id === id)) return;
    currentAgentId.value = id;
    if (typeof window !== "undefined") {
      localStorage.setItem(AGENT_STORAGE_KEY, id);
    }
  }

  return {
    availableAgents,
    currentAgentId,
    activeAgentData,
    setAgent,
    setAgentWithoutReload,
    getAgentShareUrl,
  };
}
