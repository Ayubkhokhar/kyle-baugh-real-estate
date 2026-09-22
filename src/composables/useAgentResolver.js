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
    // 1. URL Query Parameter (?agent=amy or ?agent=kyle or ?client=amy)
    const params = new URLSearchParams(window.location.search);
    const queryAgent = (params.get("agent") || params.get("client") || "").toLowerCase().trim();
    if (queryAgent && availableAgents.some((a) => a.id === queryAgent)) {
      localStorage.setItem(AGENT_STORAGE_KEY, queryAgent);
      return queryAgent;
    }

    // 2. LocalStorage (if previously explicitly selected)
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
        url.searchParams.delete("agent");
        url.searchParams.delete("client");
      } else {
        url.searchParams.set("agent", id);
      }
      window.history.replaceState({}, "", url.toString());
      // Refresh window to reinitialize cleanly if switching between different agents
      window.location.reload();
    }
  }

  function getAgentShareUrl(agentId, extraParams = {}) {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const path = window.location.pathname;
    const params = new URLSearchParams();
    if (agentId && agentId !== "kyle") {
      params.set("agent", agentId);
    }
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `${origin}${path}?${qs}` : `${origin}${path}`;
  }

  return {
    availableAgents,
    currentAgentId,
    activeAgentData,
    setAgent,
    getAgentShareUrl,
  };
}
