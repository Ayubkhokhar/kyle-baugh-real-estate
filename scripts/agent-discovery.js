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

// Curated high-potential Dallas boutique & rising luxury agents on Compass
export const initialAgentPool = [
  {
    slug: "liz-chalfant",
    name: "Liz Chalfant",
    brokerage: "Compass RE Texas, LLC",
    territory: "Lakewood, Highland Park & Preston Hollow",
    url: "https://www.compass.com/agents/liz-chalfant/",
    phone: "(214) 732-2344",
    email: "liz.chalfant@compass.com",
    activeListingsCount: 2,
    status: "ready_to_launch",
    notes: "Specializes in luxury architectural residences and premier Dallas enclaves.",
  },
  {
    slug: "christine-leite",
    name: "Christine Leite",
    brokerage: "Compass RE Texas, LLC",
    territory: "Dallas Luxury & Custom Estates",
    url: "https://www.compass.com/agents/christine-leite/",
    phone: "(214) 642-8800",
    email: "christine.leite@compass.com",
    activeListingsCount: 3,
    status: "ready_to_launch",
    notes: "High-touch luxury advisor with background in custom residential design.",
  },
  {
    slug: "megan-johnson",
    name: "Megan Johnson",
    brokerage: "Compass RE Texas, LLC",
    territory: "Preston Hollow & North Dallas",
    url: "https://www.compass.com/agents/megan-johnson/",
    phone: "(214) 538-3400",
    email: "megan.johnson@compass.com",
    activeListingsCount: 2,
    status: "ready_to_launch",
    notes: "Known for design and construction acumen in Dallas residential advisory.",
  },
  {
    slug: "erika-orbin",
    name: "Erika Orbin",
    brokerage: "Compass RE Texas, LLC",
    territory: "Park Cities & Historic Dallas",
    url: "https://www.compass.com/agents/erika-orbin/",
    phone: "(214) 912-7000",
    email: "erika.orbin@compass.com",
    activeListingsCount: 2,
    status: "ready_to_launch",
    notes: "Deep family roots in Dallas residential development and estates.",
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
