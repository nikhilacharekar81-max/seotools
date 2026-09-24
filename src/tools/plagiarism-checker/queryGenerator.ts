import { SearchProviderFactory } from './searchProviders';
import { countWords, splitIntoSentences } from './engine';

export interface CandidateSource {
  title: string;
  url: string;
  snippet: string;
  queryMatched: string;
}

export interface SourceDiscoveryResult {
  candidates: CandidateSource[];
  searchStatus: 'COMPLETED' | 'PARTIAL_SCAN' | 'SEARCH_ERROR';
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  errors?: string[];
}

// Configurable global default limits from environment variables (Phase 18)
const MAX_SEARCH_QUERIES = Number(process.env.MAX_SEARCH_QUERIES) || 5;
const MAX_CANDIDATE_URLS = Number(process.env.MAX_CANDIDATE_URLS) || 10;

/**
 * Normalizes a URL for consistent matching and comparison
 */
export function normalizeUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    let hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    let pathname = parsed.pathname.replace(/\/$/, '');
    return `${parsed.protocol}//${hostname}${pathname}`;
  } catch {
    return urlStr.toLowerCase().trim();
  }
}

/**
 * Checks if a given domain/URL should be ignored based on user exclude rules
 */
export function isExcludedDomain(urlStr: string, excludedUrl?: string): boolean {
  if (!excludedUrl) return false;
  
  const cleanExcluded = excludedUrl.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!cleanExcluded) return false;

  try {
    const parsed = new URL(urlStr);
    const domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
    return domain === cleanExcluded || domain.endsWith('.' + cleanExcluded);
  } catch {
    const domain = urlStr.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return domain === cleanExcluded || domain.endsWith('.' + cleanExcluded);
  }
}

/**
 * Computes a lightweight distinctiveness score for query prioritization (Phase 9).
 * Sentences with longer, more complex words are prioritized first.
 */
function calculateDistinctiveness(sentence: string): number {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  const total = words.length;
  if (total === 0) return 0;
  
  const longWordsCount = words.filter(w => w.length > 5).length;
  const longRatio = longWordsCount / total;

  return total + (longRatio * 15);
}

/**
 * Generates high-value distinctive search phrases from submitted text (Phase 9)
 * Sorts and prioritizes the most distinctive queries first to maximize coverage.
 */
export function generateSearchQueries(text: string): string[] {
  const rawSentences = splitIntoSentences(text);
  const eligibleQueries: { sentence: string; score: number }[] = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    const wordCount = countWords(trimmed);

    // Filter rules to prevent generic/low-value search queries:
    // 1. Must be between 6 and 25 words (too short is generic, too long degrades search engine matching)
    // 2. Must not start with common navigational headings (e.g. "Table of contents", "Join our newsletter")
    // 3. Must not be purely numerical or punctuation
    if (wordCount < 6 || wordCount > 25) continue;
    if (/^(table of contents|newsletter|contact us|get in touch|privacy policy|terms of service|copyright|about us|home)/i.test(trimmed)) continue;
    if (/^[0-9\s\-_.,;:!?'"()]+$/.test(trimmed)) continue;

    eligibleQueries.push({
      sentence: trimmed,
      score: calculateDistinctiveness(trimmed)
    });
  }

  // Prioritize distinctive sentences with highest linguistic density first
  eligibleQueries.sort((a, b) => b.score - a.score);

  return eligibleQueries.map(q => q.sentence).slice(0, MAX_SEARCH_QUERIES);
}

/**
 * Executes queries against the configured search provider to gather candidate source URLs (Phase 5 & 10)
 * Safely traces queries, handles search error states, and aggregates results.
 */
export async function discoverCandidateSources(
  text: string, 
  excludedUrl?: string
): Promise<SourceDiscoveryResult> {
  const queries = generateSearchQueries(text);
  if (queries.length === 0) {
    return {
      candidates: [],
      searchStatus: 'COMPLETED',
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0
    };
  }

  let provider;
  try {
    provider = SearchProviderFactory.getProvider();
  } catch (err: any) {
    console.error('Failed to initialize search provider:', err.message);
    return {
      candidates: [],
      searchStatus: 'SEARCH_ERROR',
      totalQueries: queries.length,
      successfulQueries: 0,
      failedQueries: queries.length,
      errors: [err.message]
    };
  }

  const collectedCandidates: CandidateSource[] = [];
  const seenUrls = new Set<string>();
  let successfulQueries = 0;
  let failedQueries = 0;
  const errors: string[] = [];

  // Process search queries sequentially to respect provider rate limits
  for (const query of queries) {
    try {
      // 1. Quoted exact search
      let searchResponse = await provider.search(`"${query}"`);
      
      // Fallback: If exact quoted query returns 0 results, search again without quotes
      if (searchResponse.length === 0) {
        searchResponse = await provider.search(query);
      }

      successfulQueries++;
      
      for (const result of searchResponse) {
        if (!result.url) continue;

        // Skip unsupported URL protocols (Phase 6)
        if (!result.url.startsWith('http://') && !result.url.startsWith('https://')) {
          continue;
        }

        const normalized = normalizeUrl(result.url);

        // Apply domain exclusions and skip duplicate candidate pages
        if (isExcludedDomain(result.url, excludedUrl)) continue;
        if (seenUrls.has(normalized)) continue;

        seenUrls.add(normalized);
        collectedCandidates.push({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          queryMatched: query
        });

        // Safe threshold limit on candidates per single scan (Phase 19)
        if (collectedCandidates.length >= MAX_CANDIDATE_URLS) {
          break;
        }
      }

      if (collectedCandidates.length >= MAX_CANDIDATE_URLS) {
        break;
      }
    } catch (err: any) {
      failedQueries++;
      errors.push(err.message);
      console.warn(`Query search failed for: "${query}". Error:`, err.message);
    }
  }

  // Calculate strict Search Status rules (Phase 1)
  let searchStatus: 'COMPLETED' | 'PARTIAL_SCAN' | 'SEARCH_ERROR' = 'COMPLETED';
  if (failedQueries === queries.length) {
    searchStatus = 'SEARCH_ERROR';
  } else if (failedQueries > 0) {
    searchStatus = 'PARTIAL_SCAN';
  }

  return {
    candidates: collectedCandidates,
    searchStatus,
    totalQueries: queries.length,
    successfulQueries,
    failedQueries,
    errors: errors.length > 0 ? errors : undefined
  };
}
