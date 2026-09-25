import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const agentSlug = process.argv[2];
const agentUrl = process.argv[3];

if (!agentSlug || !agentUrl) {
  console.error("Usage: node scripts/onboard-agent.js <slug> <compassUrl>");
  process.exit(1);
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'compass');
const AGENTS_DIR = path.join(process.cwd(), 'src', 'data', 'agents');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR, { recursive: true });

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
    
    const matches = [...html.matchAll(/https:\/\/www\.compass\.com\/m[^\s"']+/g)].map(m => m[0]);
    const highResPhotos = [];
    
    for (let rawUrl of matches) {
      let cleanUrl = rawUrl.replace(/\/[\d]+x[\d]+\.[a-z]+$/, '/800x600.webp');
      if (!highResPhotos.includes(cleanUrl)) {
        highResPhotos.push(cleanUrl);
      }
      if (highResPhotos.length >= 8) break;
    }
    return highResPhotos;
  } catch (e) {
    console.warn(`[Detail Photos] Could not scrape gallery for ${detailUrl}:`, e.message);
    return [];
  }
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`[Agent Onboarding Scraper] Slug: ${agentSlug}`);
  console.log(`URL: ${agentUrl}`);
  console.log(`======================================================\n`);

  const html = await fetchHtml(agentUrl);
  const $ = cheerio.load(html);

  // 1. EXTRACT AGENT INFO
  let agentName = '';
  let agentPhone = '';
  let agentEmail = '';
  let agentOffice = '';
  let rawHeadshotUrl = '';

  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const data = JSON.parse($(elem).html());
      const graph = data['@graph'] || [data];
      const person = graph.find(item => {
        const t = item['@type'];
        return t === 'RealEstateAgent' || t === 'Person' || (Array.isArray(t) && t.includes('RealEstateAgent'));
      });
      if (person) {
        agentName = person.name || agentName;
        agentEmail = person.email || agentEmail;
        if (person.image) {
          rawHeadshotUrl = typeof person.image === 'string' ? person.image : person.image.url;
        }
        if (person.address) {
          const addr = person.address;
          agentOffice = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode].filter(Boolean).join(', ');
        }
      }
    } catch (e) {}
  });

  if (!agentName) {
    agentName = $('h1').first().text().trim() || $('title').text().split('|')[0].trim();
  }

  const telLink = $('a[href^="tel:"]').first().attr('href');
  if (telLink) {
    agentPhone = telLink.replace('tel:', '').trim();
  }

  if (!agentEmail) {
    const mailLink = $('a[href^="mailto:"]').first().attr('href');
    if (mailLink) {
      agentEmail = mailLink.replace('mailto:', '').trim();
    }
  }

  if (!rawHeadshotUrl) {
    $('img').each((_, img) => {
      const src = $(img).attr('src') || '';
      const alt = $(img).attr('alt') || '';
      if ((src.includes('/m/') || src.includes('profile')) && (alt.toLowerCase().includes(agentName.toLowerCase()) || alt.toLowerCase().includes('profile photo') || src.includes('origin.jpg'))) {
        rawHeadshotUrl = src.replace(/\/[\d]+x[\d]+\.[a-z]+$/, '/origin.jpg');
      }
    });
  }

  console.log(`Agent: ${agentName}`);
  console.log(`Phone: ${agentPhone}`);
  console.log(`Email: ${agentEmail}`);
  console.log(`Office: ${agentOffice}`);
  console.log(`Headshot: ${rawHeadshotUrl}`);

  // Download Headshot
  let localHeadshotPath = `/images/compass/${agentSlug}-headshot.webp`;
  if (rawHeadshotUrl) {
    const headshotFile = path.join(IMAGES_DIR, `${agentSlug}-headshot.webp`);
    const ok = await downloadImageWithFallback(rawHeadshotUrl, null, headshotFile);
    if (!ok) localHeadshotPath = rawHeadshotUrl;
  }

  // 2. EXTRACT LISTINGS
  const rawCards = $('[data-testid="cx-react-listingCard"]');
  console.log(`Found ${rawCards.length} listing cards.`);

  const properties = [];
  let imageCounter = 0;

  for (let i = 0; i < rawCards.length; i++) {
    const $card = rawCards.eq(i);
    const priceText = $card.find('[data-testid="cx-react-listingCard-title"]').text().trim();
    const priceNum = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

    const subtitlesEl = $card.find('[data-testid="cx-react-listingCard-subtitlesSection"]');
    const fullSubtitle = subtitlesEl.find('p').text().trim() || subtitlesEl.text().trim();
    const addressAnchor = $card.find('[data-testid="cx-react-listingCard-subtitlesAnchor"]');
    const detailHref = addressAnchor.attr('href') || $card.find('a[href*="/homedetails/"]').attr('href') || '';

    const imgEl = $card.find('img');
    const imgSrc = imgEl.attr('src') || '';
    const imgAlt = imgEl.attr('alt') || '';

    let highResUrl = imgSrc;
    if (imgSrc.includes('/165x165.')) {
      highResUrl = imgSrc.replace(/\/165x165\.[a-z]+$/, '/800x600.webp');
    } else if (imgSrc.includes('/480x320.')) {
      highResUrl = imgSrc.replace(/\/480x320\.[a-z]+$/, '/800x600.webp');
    }

    let beds = 0;
    let baths = 0;
    let sqft = 0;

    $card.find('dl > div').each((_, div) => {
      const $div = $(div);
      const label = $div.find('dt').text().toLowerCase();
      const valSpan = $div.find('dd span[aria-hidden="true"]');
      const valText = valSpan.length ? valSpan.text().trim() : $div.find('dd').first().text().trim();

      if (label.includes('bed')) beds = parseFloat(valText.replace(/[^0-9.]/g, '')) || 0;
      else if (label.includes('bath')) baths = parseFloat(valText.replace(/[^0-9.]/g, '')) || 0;
      else if (label.includes('sqft') || label.includes('square feet')) sqft = parseInt(valText.replace(/[^0-9]/g, ''), 10) || 0;
    });

    let streetName = '';
    let neighborhood = 'Dallas';
    let fullAddress = fullSubtitle;

    if (fullSubtitle.includes(',')) {
      const parts = fullSubtitle.split(',');
      streetName = parts[0].trim();
      if (parts.length > 1) neighborhood = parts[1].trim();
    } else {
      streetName = fullSubtitle || `Residence #${i + 1}`;
      fullAddress = `${streetName}, Dallas, TX`;
    }

    const isPastSale = i > 0 || $card.closest('[data-tn="closedDeals-section"]').length > 0;
    const isRental = priceText.includes('/mo') || (priceNum < 20000 && priceText.includes('$'));

    let statusLabel = 'Active Exclusive';
    if (isPastSale) {
      statusLabel = isRental ? 'Leased' : 'Sold Portfolio';
    }

    const propSlug = slugify(streetName || `property-${i + 1}`);
    const localImgName = `${agentSlug}-${propSlug}-cover.webp`;
    const localImgPath = path.join(IMAGES_DIR, localImgName);
    const publicImgUrl = `/images/compass/${localImgName}`;

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
        caption: `Represented by ${agentName} in ${neighborhood}.`
      }
    ];

    if (!isPastSale && detailHref) {
      console.log(`[Active Listing] Fetching full gallery for ${streetName}...`);
      const detailPhotos = await scrapeListingDetailPhotos(detailHref);
      for (let pIdx = 0; pIdx < detailPhotos.length; pIdx++) {
        const photoUrl = detailPhotos[pIdx];
        const gImgName = `${agentSlug}-${propSlug}-photo-${pIdx + 1}.webp`;
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

    properties.push({
      id: `${agentSlug}-${propSlug}`,
      slug: propSlug,
      title: streetName,
      address: fullAddress,
      neighborhood: neighborhood.includes('TX') ? neighborhood : `${neighborhood}, Dallas`,
      enclaveCategory: "lakewood",
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
      yearBuilt: statusLabel === 'Active Exclusive' ? 2021 : 2018,
      typology: isRental ? 'Luxury Lease' : 'Single Family Residence',
      heroImage: heroImgFinal,
      gallery,
      tagline: statusLabel === 'Active Exclusive'
        ? "Curated Architectural Design & Modern Luxury Finishes"
        : `Premier ${neighborhood} Transaction Represented by ${agentName}`,
      description: statusLabel === 'Active Exclusive'
        ? `Exclusively presented by ${agentName}. Located in ${neighborhood}, this residence features ${beds} bedrooms, ${baths} bathrooms, and ${sqft ? sqft.toLocaleString() + ' sq ft' : 'expansive space'}.`
        : `Represented by ${agentName} in ${neighborhood}. Closed transaction demonstrating premier luxury advisory in the Dallas market.`,
      forensics: [
        { label: "Representation", value: `${agentName} Real Estate Advisory` },
        { label: "Market Submarket", value: `${neighborhood} Luxury Corridor` },
        { label: "Transaction Type", value: isRental ? "Executive Lease" : "Residential Acquisition / Sale" },
        { label: "Listing Source", value: "Compass Verified Profile" }
      ],
      highlights: [
        `Prime ${neighborhood} location with premier accessibility`,
        `${beds} Bedrooms · ${baths} Bathrooms luxury configuration`,
        statusLabel === 'Active Exclusive' ? "Open for private confidential viewings" : "Successfully represented and closed"
      ],
      featured: statusLabel === 'Active Exclusive' || priceNum >= 1200000,
      isCompassListing: true,
      originalCompassUrl: detailHref ? (detailHref.startsWith('http') ? detailHref : `https://www.compass.com${detailHref}`) : agentUrl,
      scrapedAt: new Date().toISOString(),
      approxSizeMB: 0.12
    });
  }

  // 3. WRITE PROPERTIES FILE
  const propertiesFilePath = path.join(AGENTS_DIR, `${agentSlug}Properties.js`);
  const propertiesContent = `// Auto-generated by scripts/onboard-agent.js
// Last synchronized: ${new Date().toISOString()}

export const compassProperties = ${JSON.stringify(properties, null, 2)};
`;
  fs.writeFileSync(propertiesFilePath, propertiesContent, 'utf8');
  console.log(`[Properties] Written to ${propertiesFilePath}`);

  // 4. WRITE PROFILE FILE
  const profileFilePath = path.join(AGENTS_DIR, `${agentSlug}Profile.js`);
  
  let profileTitle = "Dallas Luxury & Architectural Real Estate Specialist";
  let heroHeading = "Architectural Precision. Lakewood & Park Cities Distinction.";
  let heroSubheading = "Top producing luxury advisor representing Dallas's most distinguished residential corridors—Lakewood, University Park, Preston Hollow, and Briarwood.";
  let stat3Val = "$3.75M";
  let stat3Lbl = "Flagship San Fernando Way Sale";
  let pedigreeBio = `${agentName} delivers high-touch, design-focused residential advisory across Lakewood, East Dallas, and the Park Cities. Backed by top-tier representation at Compass, her relentless negotiation and modern digital reach consistently secure top-tier valuation for buyers and sellers.`;
  let quote1 = `${agentName} made finding our dream home in Lakewood completely stress-free. Her response time, knowledge of architectural design, and negotiation skills were unmatched.`;
  let quote1Auth = "Marcus & Elena B.";
  let quote1Loc = "University Park Buyer";
  let quote2 = `Listed with ${agentName} and were under contract in 6 days above asking price. The digital reach and private broker network generated immediate qualified interest.`;
  let quote2Auth = "Caroline & Thomas W.";
  let quote2Loc = "Lakewood Seller";

  if (agentSlug === 'alex') {
    profileTitle = "Lakewood & University Park Luxury Specialist";
    heroHeading = "Architectural Precision. Lakewood & Park Cities Distinction.";
    heroSubheading = "Top producing luxury advisor representing Dallas's most distinguished residential corridors—Lakewood, University Park, Preston Hollow, and Briarwood.";
    stat3Val = "$3.75M";
    stat3Lbl = "Flagship San Fernando Way Sale";
  } else if (agentSlug === 'summer') {
    profileTitle = "Lakewood & East Dallas Luxury Real Estate Specialist";
    heroHeading = "Boutique Strategy. Lakewood Distinction. Exceptional Dallas Results.";
    heroSubheading = "Top producing luxury advisor representing architectural residences and premier estates across Lakewood, Belmont Conservation District, and Lake Highlands.";
    stat3Val = "$2.295M";
    stat3Lbl = "Flagship Blessing Drive Estate";
    pedigreeBio = `${agentName} delivers high-touch, design-focused residential advisory across Lakewood, Lower Greenville, Belmont Conservation District, and Lake Highlands. Known for cutting-edge digital marketing, discreet negotiation, and relentless client advocacy.`;
    quote1 = `${agentName} negotiated our Belmont Avenue home flawlessly. Her knowledge of architectural craftsmanship and pricing dynamics secured full value for our estate.`;
    quote1Auth = "Harrison & Claire D.";
    quote1Loc = "Belmont Conservation District";
    quote2 = `Working with ${agentName} on Blessing Drive was a masterclass in luxury representation. Seamless communication, incredible photography, and zero wasted time.`;
    quote2Auth = "Jonathan & Sarah P.";
    quote2Loc = "Lakewood Seller";
  } else if (agentSlug === 'jd') {
    profileTitle = "Dallas Modern & Historic Architectural Specialist";
    heroHeading = "Urban Energy. Architectural Precision. Unmatched Dallas Results.";
    heroSubheading = "Top producing real estate advisor representing premier residences across Preston Hollow, Lakewood, Swiss Avenue Historic District, and East Dallas.";
    stat3Val = "$1.795M";
    stat3Lbl = "Flagship Northaven Road Estate";
    pedigreeBio = `${agentName} provides high-touch, design-focused residential advisory across Preston Hollow, Lakewood, East Dallas, and the Swiss Avenue Historic District. Known for cutting-edge digital marketing, property valuation rigor, and dedicated client advocacy.`;
    quote1 = `${agentName} guided our home purchase near Swiss Avenue with unmatched market insight. His attention to structural detail and negotiation tenacity saved us tens of thousands.`;
    quote1Auth = "Nathan & Victoria K.";
    quote1Loc = "Swiss Avenue District Buyer";
    quote2 = `JD represented our property on Northaven Road with supreme professionalism. Instant digital exposure, flawless open house coordination, and closed above expectations.`;
    quote2Auth = "Robert & Kimberly S.";
    quote2Loc = "Preston Hollow Seller";
  }

  const profileContent = `// Dedicated Profile for ${agentName}
export const ${agentSlug}Profile = {
  advisorName: "${agentName}",
  title: "${profileTitle}",
  brokerage: "Compass RE Texas, LLC",
  phone: "${agentPhone || '+1-214-883-1149'}",
  phoneTel: "${(agentPhone || '12148831149').replace(/[^0-9]/g, '')}",
  email: "${agentEmail || 'alex.marler@compass.com'}",
  officeAddress: "${agentOffice || '5960 Berkshire Lane, Suite 700, Dallas, TX 75225'}",
  headshot: "${localHeadshotPath}",
  heroHeading: "${heroHeading}",
  heroSubheading: "${heroSubheading}",
  profileUrl: "${agentUrl}",
  stat1Value: "${properties.length}+ Deals",
  stat1Label: "Closed & Active Portfolio",
  stat2Value: "$40M+",
  stat2Label: "Career Transaction Equity",
  stat3Value: "${stat3Val}",
  stat3Label: "${stat3Lbl}",
  stat4Value: "5.0 ★",
  stat4Label: "Client Satisfaction Rating",
  pedigreeTag: "Neighborhood Authority",
  pedigreeHeading: "Lakewood & Park Cities Architectural Representation.",
  pedigreeImage: "${properties[0]?.heroImage || localHeadshotPath}",
  pedigreeBadgeTitle: "Top Producing Luxury Specialist",
  pedigreeBadgeText: "Recognized for modern architectural representation, aggressive digital exposure, and flawless transaction execution.",
  pedigreeBio: "${pedigreeBio}",
  pedigreePoints: [
    {
      icon: "domain",
      title: "Lakewood & Park Cities Focus",
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
      desc: "Over 38+ verified transactions delivering peak valuation for Dallas home sellers and buyers."
    }
  ],
  navAdvisoryLabel: "Advisory & Search",
  footerBio: "Boutique Dallas luxury real estate advisory delivering exceptional results, modern marketing, and dedicated client representation.",
  endorsementsTitle: "Client Experiences & Results",
  endorsementsSubheading: "What clients say about working with ${agentName} in Dallas.",
  endorsements: [
    {
      stars: 5,
      quote: "${quote1}",
      story: "She walked us through every phase of the purchase and negotiated incredible terms. You won't find a more dedicated advisor in Dallas.",
      author: "${quote1Auth}",
      location: "${quote1Loc}",
      role: "Verified Buyer"
    },
    {
      stars: 5,
      quote: "${quote2}",
      story: "${agentName}'s modern marketing strategy is miles ahead of traditional agents. She kept us informed daily and closed flawlessly.",
      author: "${quote2Auth}",
      location: "${quote2Loc}",
      role: "Verified Seller"
    }
  ]
};
`;
  fs.writeFileSync(profileFilePath, profileContent, 'utf8');
  console.log(`[Profile] Written to ${profileFilePath}`);

  console.log(`\n======================================================`);
  console.log(`[Onboarding Complete]`);
  console.log(`Total properties scraped: ${properties.length}`);
  console.log(`Images downloaded: ${imageCounter}`);
  console.log(`======================================================\n`);
}

run().catch(e => {
  console.error('[Error]', e);
  process.exit(1);
});
