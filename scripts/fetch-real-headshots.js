import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'compass');

async function fetchAndSaveHeadshot(agentUrl, outputFileName) {
  console.log(`[Headshot Fetcher] Checking ${agentUrl}...`);
  const res = await fetch(agentUrl, {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  let imageUrl = '';
  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const data = JSON.parse($(elem).html());
      const graph = data['@graph'] || [data];
      const person = graph.find(item => {
        const t = item['@type'];
        return t === 'RealEstateAgent' || t === 'Person' || (Array.isArray(t) && t.includes('RealEstateAgent'));
      });
      if (person && person.image) {
        imageUrl = typeof person.image === 'string' ? person.image : person.image.url;
      }
    } catch (e) {}
  });

  if (!imageUrl) {
    // Search meta tags
    imageUrl = $('meta[property="og:image"]').attr('content') || '';
  }

  console.log(`  Found Image URL: ${imageUrl}`);

  if (imageUrl) {
    const imgRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://www.compass.com/'
      }
    });
    if (imgRes.ok) {
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const outPath = path.join(IMAGES_DIR, outputFileName);
      fs.writeFileSync(outPath, buffer);
      console.log(`  Saved ${buffer.length} bytes to ${outputFileName}`);
      return outPath;
    } else {
      console.error(`  Failed to download image: ${imgRes.status}`);
    }
  }
}

async function main() {
  await fetchAndSaveHeadshot('https://www.compass.com/agents/kyle-baugh-dallas/', 'kyle-headshot.webp');
  await fetchAndSaveHeadshot('https://www.compass.com/agents/amy-detwiler/', 'amy-headshot.webp');
}

main().catch(console.error);
