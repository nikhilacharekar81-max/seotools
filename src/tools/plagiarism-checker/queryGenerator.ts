import { SearchProviderFactory } from './searchProviders';
import { countWords, splitIntoSentences } from './engine';

export interface CandidateSource {
  title: string;
  url: string;
  snippet: string;
  queryMatched: string;
}

// Global default limits to prevent search provider abuse
const MAX_SEARCH_QUERIES = 5;
const MAX_CANDIDATE_URLS = 10;

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
 * Generates high-value search phrases from submitted text
 * Avoids very short sentences, common idioms, or boilerplate phrases.
 */
export function generateSearchQueries(text: string): string[] {
  const rawSentences = splitIntoSentences(text);
  const eligibleQueries: string[] = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    const wordCount = countWords(trimmed);

    // Filter rules to prevent generic/low-value search queries:
    // 1. Must be between 6 and 25 words (too short is generic, too long degrades search engine matching)
    // 2. Must not start with common navigational headings (e.g. "Table of contents", "Join our newsletter")
    // 3. Must not be purely numerical or punctuation
    if (wordCount < 6 || wordCount > 25) continue;
    if (/^(table of contents|newsletter|contact us|get in touch|privacy policy|terms of service|copyright)/i.test(trimmed)) continue;
    if (/^[0-9\s\-_.,;:!?'"()]+$/.test(trimmed)) continue;

    eligibleQueries.push(trimmed);
  }

  // To prevent exhausting API quotas, we only check up to a maximum number of sentences distributed across the text.
  if (eligibleQueries.length <= MAX_SEARCH_QUERIES) {
    return eligibleQueries;
  }

  // Distribute selections evenly across the article to capture plagiarism at different sections (Intro, Body, Outro)
  const selectedQueries: string[] = [];
  const step = eligibleQueries.length / MAX_SEARCH_QUERIES;
  for (let i = 0; i < MAX_SEARCH_QUERIES; i++) {
    const index = Math.floor(i * step);
    selectedQueries.push(eligibleQueries[index]);
  }

  return selectedQueries;
}

/**
 * Executes queries against the configured search provider to gather candidate source URLs
 */
export async function discoverCandidateSources(
  text: string, 
  excludedUrl?: string
): Promise<CandidateSource[]> {
  const queries = generateSearchQueries(text);
  if (queries.length === 0) return [];

  const provider = SearchProviderFactory.getProvider();
  const collectedCandidates: CandidateSource[] = [];
  const seenUrls = new Set<string>();

  // Process search queries sequentially to respect provider rate limits
  for (const query of queries) {
    try {
      // Wrap query in double quotes to find exact matching pages on the search engine
      let searchResponse = await provider.search(`"${query}"`);
      
      // Fallback: If exact quoted query returns 0 results, search again without quotes
      if (searchResponse.length === 0) {
        searchResponse = await provider.search(query);
      }
      
      for (const result of searchResponse) {
        if (!result.url) continue;

        // Skip unsupported URL protocols
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

        // Safe threshold limit on candidates per single scan
        if (collectedCandidates.length >= MAX_CANDIDATE_URLS) {
          return collectedCandidates;
        }
      }
    } catch (err: any) {
      console.warn(`Query search failed for: "${query}". Proceeding to next phrase. Error:`, err.message);
    }
  }

  return collectedCandidates;
}
