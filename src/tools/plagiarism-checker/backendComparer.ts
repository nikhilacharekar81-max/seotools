import { discoverCandidateSources, CandidateSource } from './queryGenerator';
import { fetchWithSsrfProtection, extractCleanArticleText } from './backendExtractor';
import { 
  countWords, 
  splitIntoSentences, 
  calculateJaccardSimilarity, 
  calculateLevenshteinSimilarity, 
  SentenceAnalysis, 
  VerifiedSource,
  PlagiarismReport,
  MatchedSpan
} from './engine';

/**
 * Normalizes strings for robust exact matching (Phase 9)
 */
function normalizeForExact(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Backend Plagiarism Coordinator (Phases 8, 9, 10, 11, 18)
 */
export async function runBackendPlagiarismScan(
  text: string,
  excludedUrl?: string,
  sensitivity: 'strict' | 'standard' | 'lenient' = 'standard'
): Promise<PlagiarismReport> {
  const startTime = Date.now();
  const userSentences = splitIntoSentences(text);
  const totalWords = countWords(text);
  const totalCharacters = text.length;

  // 1. Discover potential matching web URLs
  let candidates: CandidateSource[] = [];
  let searchStatus: 'COMPLETED' | 'PARTIAL_SCAN' | 'SEARCH_ERROR' = 'COMPLETED';

  try {
    candidates = await discoverCandidateSources(text, excludedUrl);
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

  // Comparison logic
  const sentenceResults: SentenceAnalysis[] = [];
  const matchedSpans: MatchedSpan[] = [];
  
  // Set to track which word indices in the document were matched to prevent double counting (Phase 18)
  const matchedWordsSet = new Set<number>();
  let wordCursorOffset = 0;

  let matchingSentencesCount = 0;
  let exactMatchesCount = 0;
  let partialMatchesCount = 0;

  const sourceMap = new Map<string, { domain: string; title: string; url: string; matchCount: number; highestSim: number }>();

  for (let i = 0; i < userSentences.length; i++) {
    const userSent = userSentences[i];
    const sentenceWordCount = countWords(userSent);
    const wordsInSent = userSent.split(/\s+/).filter(w => w.length > 0);

    let bestMatch: {
      matchType: 'none' | 'exact' | 'partial';
      score: number;
      source?: VerifiedSource;
      snippet?: string;
    } = { matchType: 'none', score: 0 };

    // Compare only if the sentence is substantive
    if (sentenceWordCount >= minWords) {
      const normalizedUser = normalizeForExact(userSent);

      // Check against each successfully retrieved web page content
      for (const [url, sourceDoc] of verifiedCorpusMap.entries()) {
        const sourceNormalized = normalizeForExact(sourceDoc.cleanText);

        // 1. Exact Match verification (Phase 9)
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
          break; // Perfect match found, stop looking for this sentence
        }

        // 2. Near/Partial Match evaluation (Phase 10)
        // Break webpage text into sentences for precision matching
        const sourceSentences = splitIntoSentences(sourceDoc.cleanText);
        for (const srcSent of sourceSentences) {
          const jaccard = calculateJaccardSimilarity(userSent, srcSent);
          
          if (jaccard >= matchThreshold && jaccard > bestMatch.score) {
            const lev = calculateLevenshteinSimilarity(userSent, srcSent);
            const score = Math.max(jaccard, lev);

            if (score >= matchThreshold && score > bestMatch.score) {
              bestMatch = {
                matchType: score === 100 ? 'exact' : 'partial',
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

    // Process matched sentence
    if (bestMatch.matchType !== 'none' && bestMatch.source) {
      matchingSentencesCount++;
      if (bestMatch.matchType === 'exact') {
        exactMatchesCount++;
      } else {
        partialMatchesCount++;
      }

      // Track individual matched words uniquely to prevent double counting (Phase 18)
      for (let wIdx = 0; wIdx < sentenceWordCount; wIdx++) {
        matchedWordsSet.add(wordCursorOffset + wIdx);
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

      // Update source statistics
      const dom = bestMatch.source.domain;
      const current = sourceMap.get(dom) || {
        domain: dom,
        title: bestMatch.source.title,
        url: bestMatch.source.url,
        matchCount: 0,
        highestSim: 0
      };
      current.matchCount++;
      current.highestSim = Math.max(current.highestSim, bestMatch.score);
      sourceMap.set(dom, current);

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

  // Calculate Overall Plagiarism Percentage avoiding double counting (Phase 17 & 18)
  const totalMatchedWords = matchedWordsSet.size;
  const matchingPercentage = totalWords > 0 
    ? Math.min(100, Math.round((totalMatchedWords / totalWords) * 100)) 
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
