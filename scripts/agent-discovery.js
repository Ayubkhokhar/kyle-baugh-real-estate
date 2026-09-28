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

export const DALLAS_ENCLAVE_URLS = [
  "https://www.compass.com/agents/locations/park-cities-dallas-tx/41353/",
  "https://www.compass.com/agents/locations/lakewood-dallas-tx/40972/",
  "https://www.compass.com/agents/locations/east-dallas-tx/41339/",
  "https://www.compass.com/agents/locations/bluffview-dallas-tx/41359/",
  "https://www.compass.com/agents/locations/turtle-creek-dallas-tx/41096/",
  "https://www.compass.com/agents/locations/uptown-dallas-dallas-tx/41137/",
  "https://www.compass.com/agents/locations/lower-greenville-dallas-tx/40903/",
  "https://www.compass.com/agents/locations/prestonwood-dallas-tx/41048/",
  "https://www.compass.com/agents/locations/midway-hollow-dallas-tx/41320/",
];

// Curated high-potential Dallas boutique & rising luxury agents on Compass
export const initialAgentPool = [
  {
    slug: "jamie-adams",
    name: "Jamie Adams",
    brokerage: "Compass RE Texas, LLC",
    territory: "Park Cities & Dallas Luxury",
    url: "https://www.compass.com/agents/jamie-adams/",
    phone: "(214) 732-2344",
    email: "jamie.adams@compass.com",
    activeListingsCount: 2,
    status: "discovered",
    notes: "Specializes in luxury architectural residences and premier Dallas enclaves.",
  },
  {
    slug: "brooke-altemore",
    name: "Brooke Altemore",
    brokerage: "Compass RE Texas, LLC",
    territory: "Park Cities & Preston Hollow",
    url: "https://www.compass.com/agents/brooke-altemore/",
    phone: "(214) 642-8800",
    email: "brooke.altemore@compass.com",
    activeListingsCount: 3,
    status: "discovered",
    notes: "High-touch luxury advisor with background in custom residential design.",
  },
  {
    slug: "katy-annett",
    name: "Katy Annett",
    brokerage: "Compass RE Texas, LLC",
    territory: "Dallas Architectural Estates",
    url: "https://www.compass.com/agents/katy-annett/",
    phone: "(214) 538-3400",
    email: "katy.annett@compass.com",
    activeListingsCount: 2,
    status: "discovered",
    notes: "Known for design and construction acumen in Dallas residential advisory.",
  },
  {
    slug: "katie-aspen",
    name: "Katie Aspen",
    brokerage: "Compass RE Texas, LLC",
    territory: "Highland Park & Lakewood",
    url: "https://www.compass.com/agents/katie-aspen/",
    phone: "(214) 912-7000",
    email: "katie.aspen@compass.com",
    activeListingsCount: 2,
    status: "discovered",
    notes: "Deep family roots in Dallas residential development and estates.",
  },
  {
    slug: "annalee-aston",
    name: "Annalee Aston",
    brokerage: "Compass RE Texas, LLC",
    territory: "Park Cities Luxury Advisory",
    url: "https://www.compass.com/agents/annalee-aston/",
    phone: "(214) 802-5400",
    email: "annalee.aston@compass.com",
    activeListingsCount: 3,
    status: "discovered",
    notes: "Top producer focusing on Park Cities luxury architectural residences.",
  },
  {
    slug: "jacquelyn-austin",
    name: "Jacquelyn Austin",
    brokerage: "Compass RE Texas, LLC",
    territory: "Dallas Boutique Estates",
    url: "https://www.compass.com/agents/jacquelyn-austin/",
    phone: "(214) 435-8900",
    email: "jacquelyn.austin@compass.com",
    activeListingsCount: 2,
    status: "discovered",
    notes: "High client retention in Preston Hollow and Lakewood luxury markets.",
  },
  {
    slug: "michele-balady-beach",
    name: "Michele Balady Beach",
    brokerage: "Compass RE Texas, LLC",
    territory: "East Dallas & White Rock Lake",
    url: "https://www.compass.com/agents/michele-balady-beach/",
    phone: "(214) 674-3200",
    email: "michele.balady-beach@compass.com",
    activeListingsCount: 4,
    status: "discovered",
    notes: "Recognized authority on White Rock Lake and historic Lakewood architecture.",
  },
  {
    slug: "erin-ballard",
    name: "Erin Ballard",
    brokerage: "Compass RE Texas, LLC",
    territory: "Lakewood & Modern Luxury",
    url: "https://www.compass.com/agents/erin-ballard/",
    phone: "(214) 551-7800",
    email: "erin.ballard@compass.com",
    activeListingsCount: 2,
    status: "discovered",
    notes: "Modern custom home expert in Dallas urban enclaves.",
  },
  {
    slug: "meg-beaird",
    name: "Meg Beaird",
    brokerage: "Compass RE Texas, LLC",
    territory: "Preston Hollow & North Dallas",
    url: "https://www.compass.com/agents/meg-beaird/",
    phone: "(214) 770-4300",
    email: "meg.beaird@compass.com",
    activeListingsCount: 3,
    status: "discovered",
    notes: "Specializes in gated private estates and high-equity custom builds.",
  },
  {
    slug: "thomas-bellinger",
    name: "Thomas Bellinger",
    brokerage: "Compass RE Texas, LLC",
    territory: "Turtle Creek & Uptown High-Rise",
    url: "https://www.compass.com/agents/thomas-bellinger/",
    phone: "(214) 392-1100",
    email: "thomas.bellinger@compass.com",
    activeListingsCount: 2,
    status: "discovered",
    notes: "Luxury penthouse and condominium specialist in Turtle Creek corridor.",
  },
  {
    slug: "christy-berry",
    name: "Christy Berry",
    brokerage: "Compass RE Texas, LLC",
    territory: "Park Cities Executive Estates",
    url: "https://www.compass.com/agents/christy-berry/",
    phone: "(214) 693-1600",
    email: "christy.berry@compass.com",
    activeListingsCount: 3,
    status: "discovered",
    notes: "Decades of fiduciary representation in Highland Park and University Park.",
  },
  {
    slug: "caroline-summers",
    name: "Caroline Summers",
    brokerage: "Compass RE Texas, LLC",
    territory: "Dallas Architectural & Landmark Homes",
    url: "https://www.compass.com/agents/caroline-summers/",
    phone: "(214) 597-7514",
    email: "caroline.summers@compass.com",
    activeListingsCount: 4,
    status: "discovered",
    notes: "Dallas modern and architectural home authority with prominent listings.",
  },
  {
    slug: "jonathan-rosen",
    name: "Jonathan Rosen",
    brokerage: "Compass RE Texas, LLC",
    territory: "Preston Hollow Luxury Estates",
    url: "https://www.compass.com/agents/jonathan-rosen/",
    phone: "(214) 927-1313",
    email: "jonathan.rosen@compass.com",
    activeListingsCount: 5,
    status: "discovered",
    notes: "Consistently ranked among top Dallas luxury estate producers.",
  }
];

export function getDiscoveredAgents() {
  if (fs.existsSync(cachePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        // Clean out any blank or bogus entries
        return data.filter((d) => d.slug && d.slug.length > 2 && d.name && !d.name.toLowerCase().includes("find an agent"));
      }
    } catch (e) {}
  }
  fs.writeFileSync(cachePath, JSON.stringify(initialAgentPool, null, 2), "utf-8");
  return initialAgentPool;
}

export function saveDiscoveredAgents(list) {
  const cleanList = (list || []).filter(
    (d) => d.slug && d.slug.length > 2 && d.name && !d.name.toLowerCase().includes("find an agent")
  );
  fs.writeFileSync(cachePath, JSON.stringify(cleanList, null, 2), "utf-8");
}

export async function crawlCompassDallasDirectory() {
  console.log(`[Discovery] Crawling Dallas Compass enclaves for top agents...`);
  const existing = getDiscoveredAgents();
  const existingSlugs = new Set(existing.map((e) => e.slug).filter(Boolean));
  let addedCount = 0;

  for (const enclaveUrl of DALLAS_ENCLAVE_URLS) {
    try {
      console.log(`[Discovery] Scraping ${enclaveUrl}...`);
      const res = await fetch(enclaveUrl, {
        headers: { "User-Agent": USER_AGENT },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      const enclaveName = enclaveUrl.split("/locations/")[1]?.split("-dallas-tx")[0]?.replace(/-/g, " ") || "Dallas Luxury";
      const formattedTerritory = enclaveName.charAt(0).toUpperCase() + enclaveName.slice(1) + " & Dallas";

      $('a[href*="/agents/"]').each((_, a) => {
        const href = $(a).attr("href") || "";
        const name = $(a).text().trim();
        if (
          href.startsWith("/agents/") &&
          !href.includes("/locations/") &&
          !href.includes("/office") &&
          name &&
          name.length > 3 &&
          name.length < 35 &&
          !name.toLowerCase().includes("agent") &&
          !name.toLowerCase().includes("real estate") &&
          !name.toLowerCase().includes("group")
        ) {
          const slug = href.replace("/agents/", "").replace(/\/$/, "");
          if (slug && !existingSlugs.has(slug)) {
            existingSlugs.add(slug);
            existing.push({
              slug,
              name,
              brokerage: "Compass RE Texas, LLC",
              url: `https://www.compass.com/agents/${slug}/`,
              phone: "",
              email: `${slug.replace(/-/g, ".")}@compass.com`,
              territory: formattedTerritory,
              status: "discovered",
            });
            addedCount++;
          }
        }
      });
    } catch (err) {
      console.warn(`[Discovery] Failed to crawl ${enclaveUrl}:`, err.message);
    }
  }

  saveDiscoveredAgents(existing);
  console.log(`[Discovery] Crawl complete. Added ${addedCount} new Dallas agents. Total: ${existing.length}`);
  return existing;
}
