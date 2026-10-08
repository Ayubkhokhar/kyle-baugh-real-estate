import { ref, computed } from "vue";
import { agentProfile as kyleProfile } from "../data/agentProfile";
import { amyProfile } from "../data/agents/amyProfile";
import { katieAspenProfile } from "../data/agents/katieAspenProfile";
import { micheleBaladyBeachProfile } from "../data/agents/micheleBaladyBeachProfile";
import { katyAnnettProfile } from "../data/agents/katyAnnettProfile";
import { annaleeAstonProfile } from "../data/agents/annaleeAstonProfile";
import { brookeAltemoreProfile } from "../data/agents/brookeAltemoreProfile";
import { jamieAdamsProfile } from "../data/agents/jamieAdamsProfile";
import { erikaOrbinProfile } from "../data/agents/erikaOrbinProfile";
import { meganJohnsonProfile } from "../data/agents/meganJohnsonProfile";
import { christineLeiteProfile } from "../data/agents/christineLeiteProfile";
import { lizChalfantProfile } from "../data/agents/lizChalfantProfile";
import { carsonProfile } from "../data/agents/carsonProfile";
import { alexProfile } from "../data/agents/alexProfile";
import { summerProfile } from "../data/agents/summerProfile";
import { jdProfile } from "../data/agents/jdProfile";
import { compassProperties as kyleProperties } from "../data/compassProperties";
import { compassProperties as amyProperties } from "../data/agents/amyProperties";
import { compassProperties as katieAspenProperties } from "../data/agents/katieAspenProperties";
import { compassProperties as micheleBaladyBeachProperties } from "../data/agents/micheleBaladyBeachProperties";
import { compassProperties as katyAnnettProperties } from "../data/agents/katyAnnettProperties";
import { compassProperties as annaleeAstonProperties } from "../data/agents/annaleeAstonProperties";
import { compassProperties as brookeAltemoreProperties } from "../data/agents/brookeAltemoreProperties";
import { compassProperties as jamieAdamsProperties } from "../data/agents/jamieAdamsProperties";
import { compassProperties as erikaOrbinProperties } from "../data/agents/erikaOrbinProperties";
import { compassProperties as meganJohnsonProperties } from "../data/agents/meganJohnsonProperties";
import { compassProperties as christineLeiteProperties } from "../data/agents/christineLeiteProperties";
import { compassProperties as lizChalfantProperties } from "../data/agents/lizChalfantProperties";
import { compassProperties as carsonProperties } from "../data/agents/carsonProperties";
import { compassProperties as alexProperties } from "../data/agents/alexProperties";
import { compassProperties as summerProperties } from "../data/agents/summerProperties";
import { compassProperties as jdProperties } from "../data/agents/jdProperties";

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
  {
    id: "jd",
    name: "JD Gonzales",
    title: "Dallas Modern & Historic Architectural Specialist",
    slug: "jd",
    profile: jdProfile,
    properties: jdProperties,
    previewColor: "#7A6B58",
  },
  {
    id: "liz-chalfant",
    name: "Liz Chalfant",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "liz-chalfant",
    profile: lizChalfantProfile,
    properties: lizChalfantProperties,
    previewColor: "#BFA181",
  },
  {
    id: "christine-leite",
    name: "Christine Leite",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "christine-leite",
    profile: christineLeiteProfile,
    properties: christineLeiteProperties,
    previewColor: "#BFA181",
  },
  {
    id: "megan-johnson",
    name: "Megan Johnson",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "megan-johnson",
    profile: meganJohnsonProfile,
    properties: meganJohnsonProperties,
    previewColor: "#BFA181",
  },
  {
    id: "erika-orbin",
    name: "Erika Orbin",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "erika-orbin",
    profile: erikaOrbinProfile,
    properties: erikaOrbinProperties,
    previewColor: "#BFA181",
  },
  {
    id: "jamie-adams",
    name: "Jamie Adams",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "jamie-adams",
    profile: jamieAdamsProfile,
    properties: jamieAdamsProperties,
    previewColor: "#BFA181",
  },
  {
    id: "brooke-altemore",
    name: "Brooke Altemore",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "brooke-altemore",
    profile: brookeAltemoreProfile,
    properties: brookeAltemoreProperties,
    previewColor: "#BFA181",
  },
  {
    id: "annalee-aston",
    name: "Annalee Aston",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "annalee-aston",
    profile: annaleeAstonProfile,
    properties: annaleeAstonProperties,
    previewColor: "#BFA181",
  },
  {
    id: "katy-annett",
    name: "Katy Annett",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "katy-annett",
    profile: katyAnnettProfile,
    properties: katyAnnettProperties,
    previewColor: "#BFA181",
  },
  {
    id: "michele-balady-beach",
    name: "Michele Balady Beach",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "michele-balady-beach",
    profile: micheleBaladyBeachProfile,
    properties: micheleBaladyBeachProperties,
    previewColor: "#BFA181",
  },
  {
    id: "katie-aspen",
    name: "Katie Aspen",
    title: "Dallas Luxury & Architectural Specialist",
    slug: "katie-aspen",
    profile: katieAspenProfile,
    properties: katieAspenProperties,
    previewColor: "#BFA181",
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
