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
export function isPrivateIp(ip: string): boolean {
  // Check loopback, IPv6 loopback, and private IPv4 subnets
  if (ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0') return true;

  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    const [p0, p1, p2, p3] = parts;
    // 10.0.0.0/8
    if (p0 === 10) return true;
    // 172.16.0.0/12
    if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
    // 192.168.0.0/16
    if (p0 === 192 && p1 === 168) return true;
    // 169.254.169.254 (AWS/Cloud Metadata Endpoint)
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
 */
export async function fetchWithSsrfProtection(urlStr: string): Promise<string> {
  const normalizedUrl = urlStr.trim();
  
  // 1. Resolve host and block private networks prior to socket connection
  try {
    const parsedUrl = new URL(normalizedUrl);
    const hostname = parsedUrl.hostname;

    const dnsResult = await lookupPromise(hostname);
    if (isPrivateIp(dnsResult.address)) {
      throw new Error(`SSRF Prevention: Access to private IP space (${dnsResult.address}) is forbidden.`);
    }
  } catch (err: any) {
    throw new Error(`SSRF/DNS validation failed for ${urlStr}: ${err.message}`);
  }

  // 2. Return cached response if available
  const cached = WEB_CACHE.get(normalizedUrl);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.text;
  }

  // 3. Request with strict size limit (1MB) and timeout (3500ms) over safe agents
  try {
    const response = await axios.get(normalizedUrl, {
      timeout: 3500,
      maxContentLength: 1024 * 1024, // 1MB Limit
      httpAgent: customHttpAgent,
      httpsAgent: customHttpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      responseType: 'text'
    });

    const contentType = String(response.headers['content-type'] || '');
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xml')) {
      throw new Error('Unsupported content type. Only HTML or text is allowed.');
    }

    const htmlText = response.data || '';

    // Cache the result
    WEB_CACHE.set(normalizedUrl, {
      text: htmlText,
      timestamp: Date.now(),
      statusCode: response.status
    });

    return htmlText;
  } catch (error: any) {
    console.error(`Fetch failure for ${normalizedUrl}:`, error.message);
    throw new Error(`Failed to retrieve candidate webpage content: ${error.message}`);
  }
}

/**
 * Extracts readable article text from HTML body, purging headers, nav, and boilerplate (Phase 7)
 */
export function extractCleanArticleText(html: string): string {
  if (!html) return '';

  const $ = cheerio.load(html);

  // Purge code segments, styling, navigation, menus, cookie overlays, etc.
  $('script, style, noscript, iframe, svg, nav, header, footer, aside, form, [role="banner"], [role="navigation"], .cookie-banner, .cookie-consent, #menu, .sidebar').remove();

  // Pick paragraph, headings, lists, span tags
  const textBlocks: string[] = [];
  $('p, h1, h2, h3, h4, h5, h6, li, span').each((_i, elem) => {
    const text = $(elem).text().trim();
    if (text.length > 5) {
      textBlocks.push(text);
    }
  });

  // Normalize duplicate whitespace, spacing, and carriage returns
  return textBlocks
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
