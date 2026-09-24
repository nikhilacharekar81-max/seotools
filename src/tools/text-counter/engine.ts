/**
 * Text Counter & Analyzer - Deterministic Calculation Engine
 * 
 * Rules:
 * - Words: Sequences of non-whitespace characters, splitting on Unicode whitespace (\s+)
 *   Handles punctuation-isolated tokens, emojis, and hyphenated compound words.
 * - Characters: Total Unicode code points (UTF-16 code units or code points).
 * - Characters (no spaces): Total characters excluding all Unicode whitespace (\s).
 * - Sentences: Segments ending in terminal punctuation (. ? ! or Unicode equivalents like 。！？).
 * - Paragraphs: Non-empty text blocks separated by one or more newline sequences (\r?\n\s*\r?\n).
 * - Lines: Text lines separated by individual newline characters (\r?\n).
 * - Reading Time: (words / readingSpeedWpm) * 60 seconds.
 * - Speaking Time: (words / speakingSpeedWpm) * 60 seconds.
 */

export interface TextStatistics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeSeconds: number;
  readingTimeFormatted: string;
  speakingTimeSeconds: number;
  speakingTimeFormatted: string;
  avgWordLength: number;
  processingTimeMs: number;
}

export interface EngineConfig {
  readingSpeedWpm: number;
  speakingSpeedWpm: number;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  readingSpeedWpm: 200,
  speakingSpeedWpm: 130,
};

/**
 * Format seconds into human-readable string (e.g., "1m 15s" or "< 1s")
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const mins = Math.floor(seconds / 60);
  const remSecs = Math.round(seconds % 60);
  if (remSecs === 0) return `${mins} min`;
  return `${mins}m ${remSecs}s`;
}

/**
 * Pure deterministic text analysis engine.
 * Completely private and client-side. Zero external network calls.
 */
export function analyzeText(text: string, config: EngineConfig = DEFAULT_ENGINE_CONFIG): TextStatistics {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  if (!text || text.length === 0) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeSeconds: 0,
      readingTimeFormatted: '0s',
      speakingTimeSeconds: 0,
      speakingTimeFormatted: '0s',
      avgWordLength: 0,
      processingTimeMs: 0,
    };
  }

  // 1. Total Characters
  const characters = text.length;

  // 2. Characters excluding whitespace
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // 3. Lines
  // Splitting by \r\n or \n
  const lines = text.split(/\r\n|\r|\n/).length;

  // 4. Paragraphs
  // Blocks of non-whitespace text separated by one or more blank lines
  const rawParagraphs = text.split(/\r?\n\s*\r?\n/);
  const paragraphs = rawParagraphs.filter(p => p.trim().length > 0).length || (text.trim().length > 0 ? 1 : 0);

  // 5. Words
  // Regex matching non-whitespace sequences, handling unicode, emojis, CJK, and punctuation
  // Remove leading/trailing whitespace
  const trimmed = text.trim();
  let words = 0;
  if (trimmed.length > 0) {
    // Check if CJK characters predominate
    const cjkChars = trimmed.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g);
    const nonCjkWords = trimmed
      .replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);
    
    words = nonCjkWords.length + (cjkChars ? cjkChars.length : 0);
  }

  // 6. Sentences
  // Segments terminated by ., !, ?, or CJK terminal punctuation (。, ！, ？)
  // Handles decimal numbers (e.g., 3.14) so they don't incorrectly trigger sentence breaks
  let sentences = 0;
  if (trimmed.length > 0) {
    // Replace decimals with placeholders so 3.14 isn't 2 sentences
    const cleanText = trimmed.replace(/\b\d+\.\d+\b/g, '0');
    const matched = cleanText.match(/[^.!?。！？]+[.!?。！？]+(\s+|$)|[^.!?。！？]+$/g);
    sentences = matched ? matched.filter(s => s.trim().length > 0).length : (trimmed.length > 0 ? 1 : 0);
  }

  // 7. Reading & Speaking Time
  const wpmReading = config.readingSpeedWpm > 0 ? config.readingSpeedWpm : 200;
  const wpmSpeaking = config.speakingSpeedWpm > 0 ? config.speakingSpeedWpm : 130;

  const readingTimeSeconds = words > 0 ? (words / wpmReading) * 60 : 0;
  const speakingTimeSeconds = words > 0 ? (words / wpmSpeaking) * 60 : 0;

  // 8. Average word length
  const avgWordLength = words > 0 ? Number((charactersNoSpaces / words).toFixed(1)) : 0;

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const processingTimeMs = Number((endTime - startTime).toFixed(2));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTimeSeconds,
    readingTimeFormatted: formatDuration(readingTimeSeconds),
    speakingTimeSeconds,
    speakingTimeFormatted: formatDuration(speakingTimeSeconds),
    avgWordLength,
    processingTimeMs,
  };
}
