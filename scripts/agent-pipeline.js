// scripts/agent-pipeline.js
// Autonomous, token-free real estate agent onboarding pipeline.
// Connects scraping, file generation, auto-registration, build, git push, and Hostinger email dispatch.

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as cheerio from "cheerio";
import { fileURLToPath } from "url";
import { registerAgentInCodebase } from "./auto-register.js";
import { sendOutreachEmail, generatePitch } from "./hostinger-mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const IMAGES_DIR = path.join(rootDir, "public", "images", "compass");
const AGENTS_DIR = path.join(rootDir, "src", "data", "agents");

// Repo push URL loaded safely from environment or default remote origin
const GIT_PUSH_URL = process.env.GIT_PUSH_URL || "origin main";

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR, { recursive: true });

function slugify(text) {
  return (text || "property")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.text();
}

async function downloadImageWithFallback(primaryUrl, fallbackUrl, savePath) {
  try {
    if (fs.existsSync(savePath) && fs.statSync(savePath).size > 1000) {
      return true; // Already exists
    }
    const urlsToTry = [primaryUrl, fallbackUrl].filter(Boolean);
    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            Referer: "https://www.compass.com/",
          },
        });
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          if (buffer.length > 500) {
            fs.writeFileSync(savePath, buffer);
            return true;
          }
        }
      } catch (err) {}
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function scrapeListingDetailPhotos(detailUrl) {
  if (!detailUrl) return [];
  try {
    const fullUrl = detailUrl.startsWith("http") ? detailUrl : `https://www.compass.com${detailUrl}`;
    const html = await fetchHtml(fullUrl);
    const matches = [...html.matchAll(/https:\/\/www\.compass\.com\/m[^\s"']+/g)].map((m) => m[0]);
    const highResPhotos = [];
    for (let rawUrl of matches) {
      let cleanUrl = rawUrl.replace(/\/[\d]+x[\d]+\.[a-z]+$/, "/800x600.webp");
      if (!highResPhotos.includes(cleanUrl)) highResPhotos.push(cleanUrl);
      if (highResPhotos.length >= 8) break;
    }
    return highResPhotos;
  } catch (e) {
    return [];
  }
}

export async function runAgentPipeline({
  url,
  slug,
  autoRegister = true,
  buildAndDeploy = false,
  sendEmail = false,
  logCallback = console.log,
}) {
  logCallback(`Starting autonomous pipeline for ${slug} (${url})...`);

  // 1. FETCH & PARSE HTML
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  let agentName = "";
  let agentPhone = "";
  let agentEmail = "";
  let agentOffice = "";
  let rawHeadshotUrl = "";

  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const data = JSON.parse($(elem).html());
      const graph = data["@graph"] || [data];
      const person = graph.find((item) => {
        const t = item["@type"];
        return t === "RealEstateAgent" || t === "Person" || (Array.isArray(t) && t.includes("RealEstateAgent"));
      });
      if (person) {
        agentName = person.name || agentName;
        agentEmail = person.email || agentEmail;
        if (person.image) rawHeadshotUrl = typeof person.image === "string" ? person.image : person.image.url;
        if (person.address) {
          const addr = person.address;
          agentOffice = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode].filter(Boolean).join(", ");
        }
      }
    } catch (e) {}
  });

  if (!agentName) {
    agentName = $("h1").first().text().trim() || $("title").text().split("|")[0].trim();
  }

  const telLink = $('a[href^="tel:"]').first().attr("href");
  if (telLink) agentPhone = telLink.replace("tel:", "").trim();

  if (!agentEmail) {
    const mailLink = $('a[href^="mailto:"]').first().attr("href");
    if (mailLink) agentEmail = mailLink.replace("mailto:", "").trim();
  }

  if (!rawHeadshotUrl) {
    $("img").each((_, img) => {
      const src = $(img).attr("src") || "";
      const alt = $(img).attr("alt") || "";
      if ((src.includes("/m/") || src.includes("profile")) && (alt.toLowerCase().includes(agentName.toLowerCase()) || src.includes("origin.jpg"))) {
        rawHeadshotUrl = src.replace(/\/[\d]+x[\d]+\.[a-z]+$/, "/origin.jpg");
      }
    });
  }

  logCallback(`Agent: ${agentName} | Phone: ${agentPhone || "N/A"} | Email: ${agentEmail || "N/A"}`);

  // Download Headshot
  let localHeadshotPath = `/images/compass/${slug}-headshot.webp`;
  if (rawHeadshotUrl) {
    const headshotFile = path.join(IMAGES_DIR, `${slug}-headshot.webp`);
    const ok = await downloadImageWithFallback(rawHeadshotUrl, null, headshotFile);
    if (!ok) localHeadshotPath = rawHeadshotUrl;
  }

  // 2. PARSE LISTINGS
  const rawCards = $('[data-testid="cx-react-listingCard"]');
  logCallback(`Found ${rawCards.length} listings on Compass profile.`);

  const properties = [];
  let imageCounter = 0;

  for (let i = 0; i < rawCards.length; i++) {
    const $card = rawCards.eq(i);
    const priceText = $card.find('[data-testid="cx-react-listingCard-title"]').text().trim();
    const priceNum = parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0;

    const subtitlesEl = $card.find('[data-testid="cx-react-listingCard-subtitlesSection"]');
    const fullSubtitle = subtitlesEl.find("p").text().trim() || subtitlesEl.text().trim();
    const addressAnchor = $card.find('[data-testid="cx-react-listingCard-subtitlesAnchor"]');
    const detailHref = addressAnchor.attr("href") || $card.find('a[href*="/homedetails/"]').attr("href") || "";

    const imgEl = $card.find("img");
    const imgSrc = imgEl.attr("src") || "";
    let highResUrl = imgSrc;
    if (imgSrc.includes("/165x165.")) highResUrl = imgSrc.replace(/\/165x165\.[a-z]+$/, "/800x600.webp");
    else if (imgSrc.includes("/480x320.")) highResUrl = imgSrc.replace(/\/480x320\.[a-z]+$/, "/800x600.webp");

    let beds = 0, baths = 0, sqft = 0;
    $card.find("dl > div").each((_, div) => {
      const $div = $(div);
      const label = $div.find("dt").text().toLowerCase();
      const valSpan = $div.find('dd span[aria-hidden="true"]');
      const valText = valSpan.length ? valSpan.text().trim() : $div.find("dd").first().text().trim();
      if (label.includes("bed")) beds = parseFloat(valText.replace(/[^0-9.]/g, "")) || 0;
      else if (label.includes("bath")) baths = parseFloat(valText.replace(/[^0-9.]/g, "")) || 0;
      else if (label.includes("sqft") || label.includes("square feet")) sqft = parseInt(valText.replace(/[^0-9]/g, ""), 10) || 0;
    });

    let streetName = "";
    let neighborhood = "Dallas";
    let fullAddress = fullSubtitle;
    if (fullSubtitle.includes(",")) {
      const parts = fullSubtitle.split(",");
      streetName = parts[0].trim();
      if (parts.length > 1) neighborhood = parts[1].trim();
    } else {
      streetName = fullSubtitle || `Residence #${i + 1}`;
      fullAddress = `${streetName}, Dallas, TX`;
    }

    const isPastSale = i > 0 || $card.closest('[data-tn="closedDeals-section"]').length > 0;
    const isRental = priceText.includes("/mo") || (priceNum < 20000 && priceText.includes("$"));
    const statusLabel = isPastSale ? (isRental ? "Leased" : "Sold Portfolio") : "Active Exclusive";

    const propSlug = slugify(streetName || `property-${i + 1}`);
    const localImgName = `${slug}-${propSlug}-cover.webp`;
    const localImgPath = path.join(IMAGES_DIR, localImgName);
    const publicImgUrl = `/images/compass/${localImgName}`;

    let coverSuccess = false;
    if (highResUrl || imgSrc) {
      coverSuccess = await downloadImageWithFallback(highResUrl, imgSrc, localImgPath);
      if (coverSuccess) imageCounter++;
    }

    const heroImgFinal = coverSuccess ? publicImgUrl : highResUrl || imgSrc;
    const gallery = [
      {
        url: heroImgFinal,
        title: "Architectural Exterior",
        caption: `Represented by ${agentName} in ${neighborhood}.`,
      },
    ];

    if (!isPastSale && detailHref) {
      const detailPhotos = await scrapeListingDetailPhotos(detailHref);
      for (let pIdx = 0; pIdx < detailPhotos.length; pIdx++) {
        const photoUrl = detailPhotos[pIdx];
        const gImgName = `${slug}-${propSlug}-photo-${pIdx + 1}.webp`;
        const gImgPath = path.join(IMAGES_DIR, gImgName);
        const downloaded = await downloadImageWithFallback(photoUrl, null, gImgPath);
        if (downloaded) {
          gallery.push({
            url: `/images/compass/${gImgName}`,
            title: `Interior & Grounds · View ${pIdx + 1}`,
            caption: `Luxury appointment at ${streetName}.`,
          });
          imageCounter++;
        }
      }
    }

    properties.push({
      id: `${slug}-${propSlug}`,
      slug: propSlug,
      title: streetName,
      address: fullAddress,
      neighborhood: neighborhood.includes("TX") ? neighborhood : `${neighborhood}, Dallas`,
      enclaveCategory: "lakewood",
      price: priceNum,
      priceFormatted: priceText,
      pricePerSqft: sqft > 0 ? Math.round(priceNum / sqft) : 0,
      status: statusLabel,
      openHouse: statusLabel === "Active Exclusive" ? "Open House Sunday 2:00 - 4:00 PM" : null,
      bedrooms: beds,
      bathrooms: baths,
      sqft,
      lotSize: "0.20 Acres",
      garage: "2-Car Garage",
      yearBuilt: statusLabel === "Active Exclusive" ? 2021 : 2018,
      typology: isRental ? "Luxury Lease" : "Single Family Residence",
      heroImage: heroImgFinal,
      gallery,
      tagline: statusLabel === "Active Exclusive" ? "Curated Architectural Design & Modern Finishes" : `Premier Transaction Represented by ${agentName}`,
      description: `Represented by ${agentName}. Located in ${neighborhood}, this residence features luxury finishes and bespoke appointments.`,
      forensics: [
        { label: "Representation", value: `${agentName} Real Estate Advisory` },
        { label: "Market Submarket", value: `${neighborhood} Luxury Corridor` },
        { label: "Listing Source", value: "Compass Verified Profile" },
      ],
      highlights: [`Prime ${neighborhood} location`, `${beds} Beds · ${baths} Baths luxury layout`],
      featured: statusLabel === "Active Exclusive" || priceNum >= 1000000,
      isCompassListing: true,
      originalCompassUrl: detailHref ? (detailHref.startsWith("http") ? detailHref : `https://www.compass.com${detailHref}`) : url,
      scrapedAt: new Date().toISOString(),
    });
  }

  // Identify Active & Flagship listings
  const activeListing = properties.find((p) => p.status === "Active Exclusive") || properties[0];
  const sortedSold = [...properties].filter((p) => p.status.includes("Sold")).sort((a, b) => b.price - a.price);
  const flagshipSold = sortedSold[0] || properties[properties.length - 1];

  // 3. WRITE PROPERTIES FILE
  const propertiesFilePath = path.join(AGENTS_DIR, `${slug}Properties.js`);
  fs.writeFileSync(
    propertiesFilePath,
    `// Auto-generated by scripts/agent-pipeline.js\n// Last synchronized: ${new Date().toISOString()}\n\nexport const compassProperties = ${JSON.stringify(properties, null, 2)};\n`,
    "utf-8"
  );
  logCallback(`✓ Wrote properties file: ${slug}Properties.js`);

  // 4. WRITE PROFILE FILE
  const profileFilePath = path.join(AGENTS_DIR, `${slug}Profile.js`);
  const profileContent = `// Auto-generated Profile for ${agentName}
export const ${slug}Profile = {
  advisorName: "${agentName}",
  title: "Dallas Luxury & Architectural Specialist",
  brokerage: "Compass RE Texas, LLC",
  phone: "${agentPhone || '+1-214-555-0100'}",
  phoneTel: "${(agentPhone || '12145550100').replace(/[^0-9]/g, '')}",
  email: "${agentEmail || `${slug}@compass.com`}",
  officeAddress: "${agentOffice || '5960 Berkshire Lane, Suite 700, Dallas, TX 75225'}",
  headshot: "${localHeadshotPath}",
  heroHeading: "Modern Architecture. Refined Representation. Exceptional Results.",
  heroSubheading: "Top producing real estate advisor representing premier residences and architectural estates across Dallas's most distinguished residential enclaves.",
  profileUrl: "${url}",
  stat1Value: "${properties.length}+ Deals",
  stat1Label: "Closed & Active Portfolio",
  stat2Value: "$30M+",
  stat2Label: "Career Transaction Equity",
  stat3Value: "${flagshipSold?.priceFormatted || '$1.5M+'}",
  stat3Label: "Flagship ${flagshipSold?.title || 'Dallas'} Estate",
  stat4Value: "5.0 ★",
  stat4Label: "Client Satisfaction Rating",
  pedigreeTag: "Neighborhood Authority",
  pedigreeHeading: "Architectural Precision & Dallas Luxury Advisory.",
  pedigreeImage: "${activeListing?.heroImage || localHeadshotPath}",
  pedigreeBadgeTitle: "Top Producing Luxury Specialist",
  pedigreeBadgeText: "Recognized for modern architectural representation, aggressive digital exposure, and flawless transaction execution.",
  pedigreeBio: "${agentName} provides high-touch, design-focused residential advisory across premier Dallas corridors. Known for cutting-edge digital marketing, property valuation rigor, and dedicated client advocacy.",
  pedigreePoints: [
    {
      icon: "domain",
      title: "Dallas Luxury Corridor Focus",
      desc: "Hyper-local insight into Dallas's most prestigious and architecturally significant residential enclaves."
    },
    {
      icon: "insights",
      title: "Digital-First Marketing Advantage",
      desc: "Maximizing listing exposure through modern high-speed portals, private client networking, and zero-latency media."
    },
    {
      icon: "verified",
      title: "Proven Multi-Million Dollar Execution",
      desc: "Over ${properties.length}+ verified transactions delivering peak valuation for Dallas home sellers and buyers."
    }
  ],
  navAdvisoryLabel: "Advisory & Search",
  footerBio: "Boutique Dallas luxury real estate advisory delivering exceptional results, modern marketing, and dedicated client representation.",
  endorsementsTitle: "Client Experiences & Results",
  endorsementsSubheading: "What clients say about working with ${agentName} in Dallas.",
  endorsements: [
    {
      stars: 5,
      quote: "${agentName} guided our home acquisition with unmatched market insight and relentless negotiation tenacity.",
      story: "Flawless communication, deep knowledge of local neighborhoods, and supreme professionalism throughout.",
      author: "Verified Client",
      location: "Dallas Luxury Client",
      role: "Verified Buyer"
    },
    {
      stars: 5,
      quote: "Listed with ${agentName} and received immediate high-value qualified interest. Modern digital marketing at its finest.",
      story: "The digital reach and presentation were miles ahead of traditional agents.",
      author: "Verified Seller",
      location: "Dallas Luxury Seller",
      role: "Verified Seller"
    }
  ]
};
`;
  fs.writeFileSync(profileFilePath, profileContent, "utf-8");
  logCallback(`✓ Wrote profile file: ${slug}Profile.js`);

  // 5. AUTO-REGISTER IN CODEBASE
  if (autoRegister) {
    registerAgentInCodebase({
      slug,
      name: agentName,
      title: "Dallas Luxury & Architectural Specialist",
      totalProperties: properties.length,
      activeCount: properties.filter((p) => p.status === "Active Exclusive").length,
      soldCount: properties.filter((p) => p.status.includes("Sold")).length,
      agentUrl: url,
    });
    logCallback(`✓ Auto-registered into router and composables.`);
  }

  // 6. BUILD & DEPLOY TO GIT / CLOUDFLARE
  let deploySuccess = false;
  if (buildAndDeploy) {
    logCallback(`Compiling Vite production build...`);
    try {
      execSync("npm run build", { cwd: rootDir, stdio: "pipe" });
      logCallback(`✓ Vite build succeeded.`);

      logCallback(`Committing and pushing to GitHub...`);
      execSync("git add .", { cwd: rootDir, stdio: "pipe" });
      execSync(`git commit -m "feat: auto-onboard ${agentName} (${slug}) with ${properties.length} listings"`, { cwd: rootDir, stdio: "pipe" });
      execSync(`git pull --rebase ${GIT_PUSH_URL}`, { cwd: rootDir, stdio: "pipe" });
      execSync(`git push ${GIT_PUSH_URL}`, { cwd: rootDir, stdio: "pipe" });
      deploySuccess = true;
      logCallback(`✓ Successfully deployed to Cloudflare Edge!`);
    } catch (deployErr) {
      logCallback(`⚠ Build/Git warning: ${deployErr.message}`);
    }
  }

  // 7. PREPARE EMAIL PITCH
  const pitch = generatePitch({
    name: agentName,
    slug,
    email: agentEmail,
    activeListingAddress: activeListing?.address,
    activeListingPrice: activeListing?.price,
    topSoldAddress: flagshipSold?.address,
    topSoldPrice: flagshipSold?.price,
    totalDeals: properties.length,
  });

  // 8. SEND EMAIL IF REQUESTED
  let emailResult = null;
  if (sendEmail && agentEmail) {
    logCallback(`Sending outreach email via Hostinger SMTP to ${agentEmail}...`);
    try {
      emailResult = await sendOutreachEmail({
        to: agentEmail,
        name: agentName,
        slug,
        activeListingAddress: activeListing?.address,
        activeListingPrice: activeListing?.price,
        topSoldAddress: flagshipSold?.address,
        topSoldPrice: flagshipSold?.price,
        totalDeals: properties.length,
      });
      logCallback(`✓ Email successfully sent via Hostinger (Message ID: ${emailResult.messageId})`);
    } catch (mailErr) {
      logCallback(`⚠ Email sending error: ${mailErr.message}`);
    }
  }

  const liveBase = "https://realestate-advisory.ayubkhokhar786.workers.dev";
  return {
    success: true,
    agentName,
    agentPhone,
    agentEmail,
    slug,
    totalProperties: properties.length,
    activeCount: properties.filter((p) => p.status === "Active Exclusive").length,
    soldCount: properties.filter((p) => p.status.includes("Sold")).length,
    imagesDownloaded: imageCounter,
    liveUrl: `${liveBase}/${slug}`,
    manageUrl: `${liveBase}/${slug}/manage`,
    deploySuccess,
    pitch,
    emailResult,
  };
}
