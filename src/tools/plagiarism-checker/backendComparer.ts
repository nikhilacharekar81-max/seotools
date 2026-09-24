import { discoverCandidateSources, CandidateSource } from './queryGenerator';
import { fetchWithSsrfProtection, extractCleanArticleText } from './backendExtractor';
import { 
  countWords, 
  splitIntoSentences, 
  calculateJaccardSimilarity, 
  calculateLevenshteinSimilarity, 
  normalizeTextForComparison,
  computeDetailedWordDiff,
  SentenceAnalysis, 
  VerifiedSource,
  PlagiarismReport,
  MatchedSpan
} from './engine';

/**
 * Backend Plagiarism Coordinator (Phases 8, 9, 10, 11, 18)
 * Compares user content to real scraped webpages and returns detailed evidence metrics.
 */
export async function runBackendPlagiarismScan(
  text: string,
  excludedUrl?: string,
  sensitivity: 'strict' | 'standard' | 'lenient' = 'standard'
): Promise<PlagiarismReport> {
  const startTime = Date.now();
  const userSentences = splitIntoSentences(text);
  
  // Word/Token list across the entire document (used for overall percentage calculations)
  const allWords = text.split(/\s+/).filter(w => w.length > 0);
  const totalWords = allWords.length;
  const totalCharacters = text.length;

  // 1. Discover potential matching web URLs
  let candidates: CandidateSource[] = [];
  let searchStatus: 'COMPLETED' | 'PARTIAL_SCAN' | 'SEARCH_ERROR' = 'COMPLETED';

  try {
    const discovery = await discoverCandidateSources(text, excludedUrl);
    candidates = discovery.candidates;
    searchStatus = discovery.searchStatus;
  } catch (err: any) {
    console.error('Search Discovery failed:', err.message);
    searchStatus = 'SEARCH_ERROR';
  }

  // 2. Fetch and extract clean texts from candidate URLs
  const verifiedCorpusMap = new Map<string, { title: string; url: string; domain: string; cleanText: string }>();

  for (const cand of candidates) {
    try {
      const html = await fetchWithSsrfProtection(cand.url);
      const cleanText = extractCleanArticleText(html);
      
      if (cleanText.trim().length > 20) {
        let domain = cand.url;
        try {
          domain = new URL(cand.url).hostname.replace(/^www\./, '');
        } catch {}

        verifiedCorpusMap.set(cand.url, {
          title: cand.title,
          url: cand.url,
          domain,
          cleanText
        });
      }
    } catch (err: any) {
      console.warn(`Could not verify candidate source (${cand.url}):`, err.message);
    }
  }

  // Setup sensitivity parameters
  const minWords = sensitivity === 'strict' ? 4 : sensitivity === 'lenient' ? 6 : 5;
  const matchThreshold = sensitivity === 'strict' ? 50 : sensitivity === 'lenient' ? 70 : 60;

  const sentenceResults: SentenceAnalysis[] = [];
  const matchedSpans: MatchedSpan[] = [];
  
  // Map of matched word indices to prevent double counting overlapping matching ranges (Phase 2 & 18)
  const matchedTokensFlags = new Array(totalWords).fill(false);
  let wordCursorOffset = 0;

  let matchingSentencesCount = 0;
  let exactMatchesCount = 0;
  let partialMatchesCount = 0;

  // Track verified sources by URL (do not collapse different URLs into a single source merely due to same domain)
  const sourceMap = new Map<string, { domain: string; title: string; url: string; matchCount: number; highestSim: number }>();

  for (let i = 0; i < userSentences.length; i++) {
    const userSent = userSentences[i];
    const sentenceWords = userSent.split(/\s+/).filter(w => w.length > 0);
    const sentenceWordCount = sentenceWords.length;

    let bestMatch: {
      matchType: 'none' | 'exact' | 'partial';
      score: number;
      source?: VerifiedSource;
      snippet?: string;
    } = { matchType: 'none', score: 0 };

    // Compare only if the sentence has substantive linguistic depth
    if (sentenceWordCount >= minWords) {
      const normalizedUser = normalizeTextForComparison(userSent);

      // Check against each successfully retrieved web page content
      for (const [url, sourceDoc] of verifiedCorpusMap.entries()) {
        const sourceNormalized = normalizeTextForComparison(sourceDoc.cleanText);

        // 1. Literal Exact Match verification (Phase 3 & 9)
        // Checks if the normalized user phrase exists as a normalized contiguous phrase in the source
        if (sourceNormalized.includes(normalizedUser)) {
          bestMatch = {
            matchType: 'exact',
            score: 100,
            source: {
              title: sourceDoc.title,
              url: sourceDoc.url,
              domain: sourceDoc.domain,
              matchedSnippet: userSent
            }
          };
          break; // Perfect verbatim match found, skip further comparisons for this sentence
        }

        // 2. Near/Partial Match evaluation (Phase 10 & 14)
        // Breaks webpage text into sentences for precision Jaccard/Levenshtein matching
        const sourceSentences = splitIntoSentences(sourceDoc.cleanText);
        for (const srcSent of sourceSentences) {
          const jaccard = calculateJaccardSimilarity(userSent, srcSent);
          
          if (jaccard >= matchThreshold && jaccard > bestMatch.score) {
            const lev = calculateLevenshteinSimilarity(userSent, srcSent);
            const score = Math.max(jaccard, lev);

            if (score >= matchThreshold && score > bestMatch.score) {
              bestMatch = {
                matchType: score === 100 ? 'exact' : 'partial', // Literal Exact Match is strictly 100%
                score,
                source: {
                  title: sourceDoc.title,
                  url: sourceDoc.url,
                  domain: sourceDoc.domain,
                  matchedSnippet: srcSent
                }
              };
            }
          }
        }
      }
    }

    // Process matched sentence and record granular token matches
    if (bestMatch.matchType !== 'none' && bestMatch.source) {
      matchingSentencesCount++;
      if (bestMatch.matchType === 'exact') {
        exactMatchesCount++;
      } else {
        partialMatchesCount++;
      }

      // Calculate actual matched tokens within this sentence (Phase 2)
      // Uses the token-level diff status to flag exactly which words overlapped the source snippet
      const diffResult = computeDetailedWordDiff(userSent, bestMatch.source.matchedSnippet);
      for (let wIdx = 0; wIdx < sentenceWordCount; wIdx++) {
        const token = diffResult.userTokens[wIdx];
        if (token && (token.status === 'exact-match' || token.status === 'partial-match')) {
          matchedTokensFlags[wordCursorOffset + wIdx] = true;
        }
      }

      const id = `sent_${i}_${Math.random().toString(36).substring(2, 6)}`;
      sentenceResults.push({
        id,
        originalText: userSent,
        matchType: bestMatch.matchType,
        similarityScore: bestMatch.score,
        matchedWordsCount: Math.round((bestMatch.score / 100) * sentenceWordCount),
        totalWordsCount: sentenceWordCount,
        matchedSource: bestMatch.source,
        suggestedAlternative: `Consider paraphrasing this content to improve original phrasing.`
      });

      // Span locations
      const start = text.indexOf(userSent);
      matchedSpans.push({
        start: start !== -1 ? start : 0,
        end: start !== -1 ? start + userSent.length : userSent.length,
        text: userSent,
        matchType: bestMatch.matchType,
        similarityScore: bestMatch.score,
        source: bestMatch.source
      });

      // Update source statistics by URL (keeps pages on same domain separate - Phase 8)
      const urlKey = bestMatch.source.url;
      const current = sourceMap.get(urlKey) || {
        domain: bestMatch.source.domain,
        title: bestMatch.source.title,
        url: urlKey,
        matchCount: 0,
        highestSim: 0
      };
      current.matchCount++;
      current.highestSim = Math.max(current.highestSim, bestMatch.score);
      sourceMap.set(urlKey, current);

    } else {
      sentenceResults.push({
        id: `sent_${i}_clean`,
        originalText: userSent,
        matchType: 'none',
        similarityScore: 0,
        matchedWordsCount: 0,
        totalWordsCount: sentenceWordCount
      });
    }

    wordCursorOffset += sentenceWordCount;
  }

  // =========================================================================
  // PLAGIARISM PERCENTAGE FORMULA (Phase 2 & 17)
  // =========================================================================
  // Numerator: Count of unique words flagged as exact or partial matches
  // Denominator: Total words in the submitted text
  // Math: (numerator / denominator) * 100
  //
  // Double-Counting Prevention (Phase 18):
  // Since matched words are logged as true/false flags relative to their original,
  // sequential position in the global user word list (allWords), overlapping matches
  // across multiple different URLs cannot inflate the overall similarity percentage.
  // =========================================================================
  const matchedTokensCount = matchedTokensFlags.filter(Boolean).length;
  const matchingPercentage = totalWords > 0 
    ? Math.min(100, Math.round((matchedTokensCount / totalWords) * 100)) 
    : 0;
  const noMatchPercentage = 100 - matchingPercentage;

  const sources = Array.from(sourceMap.values()).map(s => ({
    domain: s.domain,
    title: s.title,
    url: s.url,
    matchCount: s.matchCount,
    highestSimilarity: s.highestSim
  }));

  const durationMs = Date.now() - startTime;

  return {
    id: `RPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    totalWords,
    totalCharacters,
    totalSentences: userSentences.length,
    matchingSentencesCount,
    noMatchSentencesCount: userSentences.length - matchingSentencesCount,
    exactMatchesCount,
    partialMatchesCount,
    matchingPercentage,
    noMatchPercentage,
    sentences: sentenceResults,
    matchedSpans,
    sources,
    scannedAt: new Date().toLocaleString(),
    durationMs: Math.max(25, durationMs),
    searchStatus
  };
}
