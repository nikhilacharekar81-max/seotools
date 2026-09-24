import axios from 'axios';
import * as cheerio from 'cheerio';
import dns from 'dns';
import http from 'http';
import https from 'https';
import { promisify } from 'util';

const lookupPromise = promisify(dns.lookup);

// Simple Cache Interface
interface WebCacheEntry {
  text: string;
  timestamp: number;
  statusCode: number;
}

// In-Memory Web Cache to protect external sites and improve performance (Phase 13)
const WEB_CACHE = new Map<string, WebCacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour

/**
 * Validates resolved IP addresses to prevent SSRF vulnerabilities (Phase 6)
 */
export function isPrivateIp(ip: any): boolean {
  const ipStr = String(ip);
  // Check loopback, IPv6 loopback, and private IPv4 subnets
  if (ipStr === '127.0.0.1' || ipStr === '::1' || ipStr === '0.0.0.0') return true;

  const parts = ipStr.split('.').map(Number);
  if (parts.length === 4) {
    const [p0, p1, p2, p3] = parts;
    // 10.0.0.0/8
    if (p0 === 10) return true;
    // 172.16.0.0/12
    if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
    // 192.168.0.0/16
    if (p0 === 192 && p1 === 168) return true;
    // 169.254.0.0/16 (Link-local subnet, includes AWS/GCP metadata)
    if (p0 === 169 && p1 === 254) return true;
  }
  return false;
}

// Custom socket lookup overrides to block DNS rebinding SSRF attacks at connection establishment time
const safeLookup = (hostname: string, options: any, callback: any) => {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) {
      return callback(err);
    }
    if (isPrivateIp(address)) {
      return callback(new Error(`SSRF Prevention: Connection forbidden to private/internal IP address (${address}).`));
    }
    callback(null, address, family);
  });
};

const customHttpAgent = new http.Agent({ lookup: safeLookup, keepAlive: false });
const customHttpsAgent = new https.Agent({ lookup: safeLookup, keepAlive: false });

/**
 * Safe client-side fetcher with active SSRF protection, size checks, and timeouts (Phase 6 & 14)
 * Overrides socket resolver and manually traces redirect hops, protecting against DNS rebinding & loopback redirection.
 * Connection-level DNS validation is used to mitigate DNS rebinding and SSRF risks.
 */
export async function fetchWithSsrfProtection(urlStr: string): Promise<string> {
  let currentUrl = urlStr.trim();
  let hops = 0;
  const maxHops = 5;

  while (hops < maxHops) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(currentUrl);
    } catch {
      throw new Error(`Invalid URL format: ${currentUrl}`);
    }

    // Only allow http:// and https:// (unsupported protocols blocked)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error(`SSRF Prevention: Unsupported protocol "${parsedUrl.protocol}". Only http: and https: are allowed.`);
    }

    const hostname = parsedUrl.hostname;

    // Resolve DNS and check private address space before fetching
    try {
      const dnsResult = await lookupPromise(hostname);
      if (isPrivateIp(dnsResult.address)) {
        throw new Error(`SSRF Prevention: Access to private IP space (${dnsResult.address}) is forbidden.`);
      }
    } catch (err: any) {
      throw new Error(`SSRF/DNS validation failed for ${currentUrl}: ${err.message}`);
    }

    // Cache lookup only for initial hop
    if (hops === 0) {
      const cached = WEB_CACHE.get(currentUrl);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.text;
      }
    }

    try {
      const response = await axios.get(currentUrl, {
        timeout: 3500,
        maxContentLength: 1024 * 1024, // 1MB size limit (Phase 16 - oversized webpages rejected)
        maxRedirects: 0, // Disable automatic redirect following to inspect hops
        validateStatus: (status) => status >= 200 && status < 400,
        httpAgent: customHttpAgent,
        httpsAgent: customHttpsAgent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        responseType: 'text'
      });

      // Check for manual redirects and follow safe paths
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers['location'];
        if (!location) {
          throw new Error(`Redirect status ${response.status} returned without location header.`);
        }
        
        const redirectUrl = new URL(location, currentUrl).toString();
        currentUrl = redirectUrl;
        hops++;
        continue;
      }

      const contentType = String(response.headers['content-type'] || '');
      if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xml')) {
        throw new Error('Unsupported content type. Only HTML or text is allowed.');
      }

      const htmlText = response.data || '';

      // Cache successful response (Phase 13)
      if (hops === 0) {
        WEB_CACHE.set(urlStr.trim(), {
          text: htmlText,
          timestamp: Date.now(),
          statusCode: response.status
        });
      }

      return htmlText;
    } catch (error: any) {
      console.error(`Fetch failure for ${currentUrl}:`, error.message);
      throw new Error(`Failed to retrieve candidate webpage content: ${error.message}`);
    }
  }

  throw new Error(`Too many redirects (exceeded limit of ${maxHops}).`);
}

/**
 * Extracts readable article text from HTML body, purging headers, nav, and boilerplate (Phase 7)
 * Uses a layered selection strategy (article -> main -> likely container -> density check) and removes duplicates.
 */
export function extractCleanArticleText(html: string): string {
  if (!html) return '';

  const $ = cheerio.load(html);

  // Purge non-content and layout blocks instantly
  $('script, style, noscript, iframe, svg, nav, header, footer, aside, form, button, [role="banner"], [role="navigation"], .cookie-banner, .cookie-consent, #menu, .sidebar, #footer, .footer, #header, .header, #nav, .nav').remove();

  let contentRoot = $('body');

  // Layered strategy:
  // 1. Check for <article> tags
  const article = $('article');
  if (article.length > 0) {
    contentRoot = article.first();
  } else {
    // 2. Check for <main> tags
    const main = $('main');
    if (main.length > 0) {
      contentRoot = main.first();
    } else {
      // 3. Try likely container elements
      const likelyContainer = $('#content, .content, .post, .entry, .article-body, #article-body, #main-content');
      if (likelyContainer.length > 0) {
        contentRoot = likelyContainer.first();
      }
    }
  }

  const textBlocks: string[] = [];

  // Traverse the content element tree
  contentRoot.find('p, h1, h2, h3, h4, h5, h6, li, span').each((_i, elem) => {
    // Prevent double extraction of child spans
    const parentName = $(elem).parent()[0]?.name;
    if (parentName && ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(parentName) && elem.name === 'span') {
      return;
    }

    const text = $(elem).text().replace(/\s+/g, ' ').trim();
    if (text.length > 8) {
      textBlocks.push(text);
    }
  });

  // Unique block deduplication to prevent nesting duplication anomalies
  const uniqueBlocks: string[] = [];
  const seenBlocks = new Set<string>();

  for (const text of textBlocks) {
    const norm = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm.length > 5 && !seenBlocks.has(norm)) {
      seenBlocks.add(norm);
      uniqueBlocks.push(text);
    }
  }

  // 4. Density Fallback: fallback to general body tags if main selection returned empty
  if (uniqueBlocks.length === 0) {
    $('body').find('p, h1, h2, h3, h4, h5, h6, li, span').each((_i, elem) => {
      const parentName = $(elem).parent()[0]?.name;
      if (parentName && ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(parentName) && elem.name === 'span') {
        return;
      }
      const text = $(elem).text().replace(/\s+/g, ' ').trim();
      const norm = text.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (text.length > 8 && !seenBlocks.has(norm)) {
        seenBlocks.add(norm);
        uniqueBlocks.push(text);
      }
    });
  }

  return uniqueBlocks
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
