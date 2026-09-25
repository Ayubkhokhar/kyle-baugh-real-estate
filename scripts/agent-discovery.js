// scripts/agent-discovery.js
// Autonomous directory and crawler for Dallas luxury real estate agents.
// Zero AI tokens required.

import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const cachePath = path.join(rootDir, "data", "discovered-agents.json");

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// Curated high-potential Dallas boutique & rising luxury agents (No standalone sites, $5M-$35M volume, direct cell/email)
export const initialAgentPool = [
  {
    slug: "brandon-stewart",
    name: "Brandon Stewart",
    brokerage: "Compass RE Texas, LLC",
    territory: "Dallas Modern & Mid-Century Historic",
    url: "https://www.compass.com/agents/brandon-stewart/",
    phone: "(214) 801-9880",
    email: "brandon.stewart@compass.com",
    activeListingsCount: 3,
    status: "ready_to_launch",
    notes: "Specializes in iconic mid-century modern and architectural residences in Dallas.",
  },
  {
    slug: "emily-ray-porter",
    name: "Emily Ray-Porter",
    brokerage: "Compass RE Texas, LLC",
    territory: "Uptown & Turtle Creek High-Rise Luxury",
    url: "https://www.compass.com/agents/emily-ray-porter/",
    phone: "(214) 207-3200",
    email: "emily.rayporter@compass.com",
    activeListingsCount: 4,
    status: "ready_to_launch",
    notes: "Dallas premier high-rise and luxury condominium specialist.",
  },
  {
    slug: "christopher-parrish",
    name: "Christopher Parrish",
    brokerage: "Compass RE Texas, LLC",
    territory: "Oak Cliff & Kessler Park Historic",
    url: "https://www.compass.com/agents/christopher-parrish/",
    phone: "(214) 478-4395",
    email: "christopher.parrish@compass.com",
    activeListingsCount: 2,
    status: "ready_to_launch",
    notes: "Historic homes and boutique estates in Kessler Park and Stevens Park.",
  },
  {
    slug: "charlotte-fawcett",
    name: "Charlotte Fawcett",
    brokerage: "Compass RE Texas, LLC",
    territory: "Preston Hollow & North Dallas",
    url: "https://www.compass.com/agents/charlotte-fawcett/",
    phone: "(214) 641-6100",
    email: "charlotte.fawcett@compass.com",
    activeListingsCount: 2,
    status: "ready_to_launch",
    notes: "High-touch luxury residential specialist across North Dallas enclaves.",
  },
  {
    slug: "martha-miller",
    name: "Martha Miller",
    brokerage: "Compass RE Texas, LLC",
    territory: "Lakewood & Forest Hills",
    url: "https://www.compass.com/agents/martha-miller/",
    phone: "(214) 762-8822",
    email: "martha.miller@compass.com",
    activeListingsCount: 2,
    status: "ready_to_launch",
    notes: "East Dallas and White Rock Lake neighborhood authority.",
  },
  {
    slug: "grant-vechtenburg",
    name: "Grant Vechtenburg",
    brokerage: "Compass RE Texas, LLC",
    territory: "Devonshire & Bluffview",
    url: "https://www.compass.com/agents/grant-vechtenburg/",
    phone: "(214) 500-1122",
    email: "grant.vechtenburg@compass.com",
    activeListingsCount: 1,
    status: "ready_to_launch",
    notes: "Modern architectural and custom estate representation.",
  }
];

export function getDiscoveredAgents() {
  if (fs.existsSync(cachePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (e) {}
  }
  fs.writeFileSync(cachePath, JSON.stringify(initialAgentPool, null, 2), "utf-8");
  return initialAgentPool;
}

export function saveDiscoveredAgents(list) {
  fs.writeFileSync(cachePath, JSON.stringify(list, null, 2), "utf-8");
}

export async function crawlCompassDallasDirectory() {
  const url = "https://www.compass.com/agents/locations/dallas-tx/";
  console.log(`[Discovery] Crawling Compass directory: ${url}`);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const discovered = [];
    $('a[href*="/agents/"]').each((_, a) => {
      const href = $(a).attr("href");
      const name = $(a).text().trim();
      if (href && name && href.includes("/agents/") && !href.includes("/locations/") && name.length > 3 && name.length < 35) {
        const slug = href.replace("/agents/", "").replace(/\/$/, "");
        if (!["locations", "search", "team"].includes(slug) && !discovered.some((d) => d.slug === slug)) {
          discovered.push({
            slug,
            name,
            brokerage: "Compass RE Texas, LLC",
            url: href.startsWith("http") ? href : `https://www.compass.com${href}`,
            phone: "",
            email: `${slug.replace("-", ".")}@compass.com`,
            status: "discovered",
          });
        }
      }
    });

    const existing = getDiscoveredAgents();
    for (const d of discovered) {
      if (!existing.some((e) => e.slug === d.slug)) {
        existing.push(d);
      }
    }
    saveDiscoveredAgents(existing);
    return existing;
  } catch (err) {
    console.warn(`[Discovery] Fallback to curated pool:`, err.message);
    return getDiscoveredAgents();
  }
}
