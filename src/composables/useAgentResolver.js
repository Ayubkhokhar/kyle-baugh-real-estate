import { ref, computed } from "vue";
import { agentProfile as kyleProfile } from "../data/agentProfile";
import { amyProfile } from "../data/agents/amyProfile";
import { carsonProfile } from "../data/agents/carsonProfile";
import { alexProfile } from "../data/agents/alexProfile";
import { summerProfile } from "../data/agents/summerProfile";
import { compassProperties as kyleProperties } from "../data/compassProperties";
import { compassProperties as amyProperties } from "../data/agents/amyProperties";
import { compassProperties as carsonProperties } from "../data/agents/carsonProperties";
import { compassProperties as alexProperties } from "../data/agents/alexProperties";
import { compassProperties as summerProperties } from "../data/agents/summerProperties";

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
  {
    id: "carson",
    name: "Carson Hill",
    title: "East Dallas & Lakewood Modern Real Estate Specialist",
    slug: "carson",
    profile: carsonProfile,
    properties: carsonProperties,
    previewColor: "#3B6E8C",
  },
  {
    id: "alex",
    name: "Alex Marler",
    title: "Lakewood & University Park Luxury Specialist",
    slug: "alex",
    profile: alexProfile,
    properties: alexProperties,
    previewColor: "#D97757",
  },
  {
    id: "summer",
    name: "Summer Graham",
    title: "Lakewood & East Dallas Luxury Real Estate Specialist",
    slug: "summer",
    profile: summerProfile,
    properties: summerProperties,
    previewColor: "#4A7C59",
  },
];

function getInitialAgentId() {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const params = new URLSearchParams(window.location.search);

    // 1. Subdomain Check (e.g. carson.workers.dev or amydetwiler.workers.dev)
    for (const agent of availableAgents) {
      if (agent.id !== "kyle" && (hostname.includes(agent.id) || hostname.includes(agent.name.toLowerCase().split(" ")[0]))) {
        return agent.id;
      }
    }

    // 2. Clean Path Check (e.g. /carson, /amy, /kyle, /agent/carson)
    for (const agent of availableAgents) {
      if (pathname.includes(`/${agent.id}`) || pathname.includes(`/${agent.slug}`)) {
        localStorage.setItem(AGENT_STORAGE_KEY, agent.id);
        return agent.id;
      }
    }

    // 3. URL Query Parameter (?agent=carson or ?client=carson)
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
      url.pathname = id === "kyle" ? "/kyle" : `/${id}`;
      url.searchParams.delete("agent");
      url.searchParams.delete("client");
      window.history.replaceState({}, "", url.toString());
      window.location.reload();
    }
  }

  function getAgentShareUrl(agentId, extraParams = {}) {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const targetPath = agentId === "kyle" ? "/kyle" : `/${agentId}`;
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
