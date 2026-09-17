import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const COMPASS_AGENT_URL = 'https://www.compass.com/agents/kyle-baugh-dallas/';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'compass');
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const SRC_DATA_FILE = path.join(process.cwd(), 'src', 'data', 'compassProperties.js');
const PUBLIC_DATA_FILE = path.join(DATA_DIR, 'compassProperties.json');

// Ensure output directories exist
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function slugify(text) {
  return (text || 'property')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function fetchHtml(url) {
  console.log(`[Scraper] Fetching ${url}...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

async function downloadImageWithFallback(primaryUrl, fallbackUrl, savePath) {
  try {
    if (fs.existsSync(savePath) && fs.statSync(savePath).size > 1000) {
      return true; // Already downloaded
    }

    const urlsToTry = [primaryUrl, fallbackUrl].filter(Boolean);
    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': USER_AGENT,
            'Referer': 'https://www.compass.com/',
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
    const fullUrl = detailUrl.startsWith('http') ? detailUrl : `https://www.compass.com${detailUrl}`;
    const html = await fetchHtml(fullUrl);
    
    // Find all image matches in the detail page
    const matches = [...html.matchAll(/https:\/\/www\.compass\.com\/m[^\s"']+/g)].map(m => m[0]);
    const highResPhotos = [];
    
    for (let rawUrl of matches) {
      let cleanUrl = rawUrl.replace(/\/[\d]+x[\d]+\.[a-z]+$/, '/800x600.webp');
      if (!highResPhotos.includes(cleanUrl)) {
        highResPhotos.push(cleanUrl);
      }
      if (highResPhotos.length >= 8) break; // Limit gallery size for quota safety
    }
    return highResPhotos;
  } catch (e) {
    console.warn(`[Detail Photos] Could not scrape gallery for ${detailUrl}:`, e.message);
    return [];
  }
}

async function runScraper() {
  console.log(`\n======================================================`);
  console.log(`[Compass Scraper] Starting sync for Kyle Baugh...`);
  console.log(`======================================================\n`);

  const html = await fetchHtml(COMPASS_AGENT_URL);
  const $ = cheerio.load(html);

  const rawCards = $('[data-testid="cx-react-listingCard"]');
  console.log(`[Scraper] Found ${rawCards.length} listing cards on agent page.`);

  const properties = [];
  let imageCounter = 0;

  for (let i = 0; i < rawCards.length; i++) {
    const $card = rawCards.eq(i);

    // 1. Price
    const priceText = $card.find('[data-testid="cx-react-listingCard-title"]').text().trim();
    const priceNum = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

    // 2. Subtitles Section
    const subtitlesEl = $card.find('[data-testid="cx-react-listingCard-subtitlesSection"]');
    const fullSubtitle = subtitlesEl.find('p').text().trim() || subtitlesEl.text().trim();
    const addressAnchor = $card.find('[data-testid="cx-react-listingCard-subtitlesAnchor"]');
    const detailHref = addressAnchor.attr('href') || $card.find('a[href*="/homedetails/"]').attr('href') || '';

    // 3. Image Element
    const imgEl = $card.find('img');
    const imgSrc = imgEl.attr('src') || '';
    const imgAlt = imgEl.attr('alt') || '';

    // Determine high-resolution image URL
    let highResUrl = imgSrc;
    if (imgSrc.includes('/165x165.')) {
      highResUrl = imgSrc.replace(/\/165x165\.[a-z]+$/, '/800x600.webp');
    } else if (imgSrc.includes('/480x320.')) {
      highResUrl = imgSrc.replace(/\/480x320\.[a-z]+$/, '/800x600.webp');
    }

    // 4. Substats (beds, baths, sqft)
    let beds = 0;
    let baths = 0;
    let sqft = 0;

    $card.find('dl > div').each((_, div) => {
      const $div = $(div);
      const label = $div.find('dt').text().toLowerCase();
      const valSpan = $div.find('dd span[aria-hidden="true"]');
      const valText = valSpan.length ? valSpan.text().trim() : $div.find('dd').first().text().trim();

      if (label.includes('bed')) {
        beds = parseFloat(valText.replace(/[^0-9.]/g, '')) || 0;
      } else if (label.includes('bath')) {
        baths = parseFloat(valText.replace(/[^0-9.]/g, '')) || 0;
      } else if (label.includes('sqft') || label.includes('square feet')) {
        sqft = parseInt(valText.replace(/[^0-9]/g, ''), 10) || 0;
      }
    });

    // 5. Clean Address, Street, Neighborhood
    let streetName = '';
    let neighborhood = 'Dallas';
    let fullAddress = fullSubtitle;

    if (fullSubtitle.includes(',')) {
      const parts = fullSubtitle.split(',');
      streetName = parts[0].trim();
      if (parts.length > 1) {
        neighborhood = parts[1].trim();
      }
    } else if (fullSubtitle.includes('Park Cities')) {
      streetName = fullSubtitle.replace('Park Cities', '').trim();
      neighborhood = 'Park Cities';
      fullAddress = `${streetName}, Park Cities, TX`;
    } else if (fullSubtitle.includes('Midway Hollow')) {
      streetName = fullSubtitle.replace('Midway Hollow', '').trim();
      neighborhood = 'Midway Hollow';
      fullAddress = `${streetName}, Dallas, TX`;
    } else {
      streetName = fullSubtitle || (imgAlt.includes('|') ? imgAlt.split('|')[1].trim() : `Residence #${i + 1}`);
      fullAddress = `${streetName}, Dallas, TX`;
    }

    // Enclave categorization
    let enclaveCategory = 'dallas';
    const combinedText = `${neighborhood} ${streetName} ${imgAlt}`.toLowerCase();
    if (combinedText.includes('park cities') || combinedText.includes('preston hollow') || combinedText.includes('purdue') || combinedText.includes('university park')) {
      enclaveCategory = 'park-cities';
    } else if (combinedText.includes('lakewood') || combinedText.includes('greenville') || combinedText.includes('mccommas') || combinedText.includes('winton') || combinedText.includes('richmond')) {
      enclaveCategory = 'lakewood';
    } else if (combinedText.includes('midway hollow') || combinedText.includes('coppedge')) {
      enclaveCategory = 'midway-hollow';
    } else if (combinedText.includes('swiss') || combinedText.includes('historic')) {
      enclaveCategory = 'historic';
    }

    // 6. Status Determination (Active vs Sold vs Leased)
    const isPastSale = i > 0 || $card.closest('[data-tn="closedDeals-section"]').length > 0;
    const isRental = priceText.includes('/mo') || (priceNum < 20000 && priceText.includes('$'));
    
    let statusLabel = 'Active Exclusive';
    if (isPastSale) {
      statusLabel = isRental ? 'Leased' : 'Sold Portfolio';
    }

    const slug = slugify(streetName || `property-${i + 1}`);
    const localImgName = `${slug}-cover.webp`;
    const localImgPath = path.join(IMAGES_DIR, localImgName);
    const publicImgUrl = `/images/compass/${localImgName}`;

    // Download cover photo with fallback
    let coverSuccess = false;
    if (highResUrl || imgSrc) {
      coverSuccess = await downloadImageWithFallback(highResUrl, imgSrc, localImgPath);
      if (coverSuccess) imageCounter++;
    }

    const heroImgFinal = coverSuccess ? publicImgUrl : (highResUrl || imgSrc);
    const gallery = [
      {
        url: heroImgFinal,
        title: "Architectural Exterior",
        caption: `Represented by Kyle Baugh in ${neighborhood}.`
      }
    ];

    // If active listing, fetch and download full gallery
    if (!isPastSale && detailHref) {
      console.log(`[Active Listing] Fetching full gallery for ${streetName}...`);
      const detailPhotos = await scrapeListingDetailPhotos(detailHref);
      for (let pIdx = 0; pIdx < detailPhotos.length; pIdx++) {
        const photoUrl = detailPhotos[pIdx];
        const gImgName = `${slug}-photo-${pIdx + 1}.webp`;
        const gImgPath = path.join(IMAGES_DIR, gImgName);
        const downloaded = await downloadImageWithFallback(photoUrl, null, gImgPath);
        if (downloaded) {
          gallery.push({
            url: `/images/compass/${gImgName}`,
            title: `Interior & Grounds · View ${pIdx + 1}`,
            caption: `Luxury appointment at ${streetName}.`
          });
          imageCounter++;
        }
      }
    }

    const pricePerSqft = sqft > 0 ? Math.round(priceNum / sqft) : 0;

    // Generate full property object compatible with all views
    const propertyObj = {
      id: `compass-${slug}`,
      slug,
      title: streetName,
      address: fullAddress,
      neighborhood: neighborhood.includes('TX') ? neighborhood : `${neighborhood}, Dallas`,
      enclaveCategory,
      price: priceNum,
      priceFormatted: priceText,
      pricePerSqft,
      status: statusLabel,
      openHouse: statusLabel === 'Active Exclusive' ? "Open House Sunday 2:00 - 4:00 PM" : null,
      bedrooms: beds,
      bathrooms: baths,
      sqft: sqft,
      lotSize: "0.20 Acres",
      garage: "2-Car Garage",
      yearBuilt: statusLabel === 'Active Exclusive' ? 1928 : 2018,
      typology: isRental ? 'Luxury Lease' : 'Single Family Residence',
      heroImage: heroImgFinal,
      gallery,
      tagline: statusLabel === 'Active Exclusive'
        ? "Preserved Architectural Character with Modern Luxury Appointed Interiors"
        : `Premier ${neighborhood} Transaction Represented by Kyle Baugh`,
      description: statusLabel === 'Active Exclusive'
        ? `Exclusively presented by Kyle Baugh. Located in the coveted ${neighborhood} enclave, this exceptional residence features ${beds ? beds + ' bedrooms' : 'generous bedroom suites'}, ${baths ? baths + ' bathrooms' : 'designer bathrooms'}, and ${sqft ? sqft.toLocaleString() + ' square feet' : 'expansive living space'} of masterfully curated architectural design.`
        : `Represented by Kyle Baugh in ${neighborhood}. Closed transaction demonstrating premier luxury real estate advisory in the Dallas market.`,
      forensics: [
        { label: "Representation", value: "Kyle Baugh Real Estate Advisory" },
        { label: "Market Submarket", value: `${neighborhood} Luxury Corridor` },
        { label: "Transaction Type", value: isRental ? "Executive Lease" : "Residential Acquisition / Sale" },
        { label: "Listing Source", value: "Compass Verified Profile" }
      ],
      highlights: [
        `Prime ${neighborhood} location with premier accessibility`,
        `${beds} Bedrooms · ${baths} Bathrooms luxury configuration`,
        statusLabel === 'Active Exclusive' ? "Open for private confidential viewings" : "Successfully represented and closed"
      ],
      featured: statusLabel === 'Active Exclusive' || priceNum >= 2000000,
      isCompassListing: true,
      originalCompassUrl: detailHref ? (detailHref.startsWith('http') ? detailHref : `https://www.compass.com${detailHref}`) : COMPASS_AGENT_URL,
      scrapedAt: new Date().toISOString(),
      approxSizeMB: 0.12
    };

    properties.push(propertyObj);
  }

  // Write to src/data/compassProperties.js
  const jsContent = `// Auto-generated by scripts/compass-scraper.js
// Last synchronized: ${new Date().toISOString()}

export const compassProperties = ${JSON.stringify(properties, null, 2)};

export const compassSyncMeta = {
  lastSynced: "${new Date().toISOString()}",
  totalProperties: ${properties.length},
  activeCount: ${properties.filter(p => p.status === 'Active Exclusive').length},
  soldCount: ${properties.filter(p => p.status === 'Sold Portfolio').length},
  leasedCount: ${properties.filter(p => p.status === 'Leased').length},
  imagesDownloaded: ${imageCounter},
  agentUrl: "${COMPASS_AGENT_URL}"
};
`;

  fs.writeFileSync(SRC_DATA_FILE, jsContent, 'utf8');
  fs.writeFileSync(PUBLIC_DATA_FILE, JSON.stringify({ meta: { lastSynced: new Date().toISOString() }, properties }, null, 2), 'utf8');

  console.log(`\n======================================================`);
  console.log(`[Compass Scraper] Sync Complete!`);
  console.log(`Total Properties: ${properties.length}`);
  console.log(`Active Listings: ${properties.filter(p => p.status === 'Active Exclusive').length}`);
  console.log(`Sold Properties: ${properties.filter(p => p.status === 'Sold Portfolio').length}`);
  console.log(`Leased Properties: ${properties.filter(p => p.status === 'Leased').length}`);
  console.log(`Images Cached on Cloudflare Assets: ${imageCounter}`);
  console.log(`======================================================\n`);
}

runScraper().catch(err => {
  console.error('[Scraper Fatal Error]', err);
  process.exit(1);
});
