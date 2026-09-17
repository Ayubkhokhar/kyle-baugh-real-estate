// Cloudflare Pages Function: /api/image-proxy
// Acts as a high-speed Edge CDN proxy for Compass images, bypassing hotlink restrictions.

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Security check: Only allow fetching from Compass domains
  try {
    const parsedTarget = new URL(targetUrl);
    if (!parsedTarget.hostname.endsWith('compass.com')) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Cloudflare Edge Cache check
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (response) {
      return response;
    }

    // Fetch from Compass with legitimate headers
    const compassRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.compass.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      cf: {
        cacheTtl: 2592000, // 30 days
        cacheEverything: true,
      },
    });

    if (!compassRes.ok) {
      return new Response('Failed to fetch upstream image', { status: compassRes.status });
    }

    const contentType = compassRes.headers.get('content-type') || 'image/webp';
    const imageBody = await compassRes.arrayBuffer();

    response = new Response(imageBody, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });

    // Save to Cloudflare cache
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
