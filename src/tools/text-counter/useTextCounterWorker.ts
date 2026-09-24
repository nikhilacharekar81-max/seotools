import { useState, useEffect, useRef } from 'react';
import { TextStatistics, EngineConfig, analyzeText, DEFAULT_ENGINE_CONFIG } from './engine';

const WORKER_SOURCE = `
self.onmessage = function(e) {
  var data = e.data;
  var text = data.text || '';
  var config = data.config || { readingSpeedWpm: 200, speakingSpeedWpm: 130 };
  var startTime = performance.now();

  if (!text || text.length === 0) {
    self.postMessage({
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
      processingTimeMs: 0
    });
    return;
  }

  var characters = text.length;
  var charactersNoSpaces = text.replace(/\\s/g, '').length;
  var lines = text.split(/\\r\\n|\\r|\\n/).length;
  var rawParagraphs = text.split(/\\r?\\n\\s*\\r?\\n/);
  var paragraphs = rawParagraphs.filter(function(p) { return p.trim().length > 0; }).length || (text.trim().length > 0 ? 1 : 0);

  var trimmed = text.trim();
  var words = 0;
  if (trimmed.length > 0) {
    var cjkChars = trimmed.match(/[\\u4e00-\\u9fa5\\u3040-\\u30ff\\uac00-\\ud7af]/g);
    var nonCjkWords = trimmed
      .replace(/[\\u4e00-\\u9fa5\\u3040-\\u30ff\\uac00-\\ud7af]/g, ' ')
      .trim()
      .split(/\\s+/)
      .filter(function(w) { return w.length > 0; });
    words = nonCjkWords.length + (cjkChars ? cjkChars.length : 0);
  }

  var sentences = 0;
  if (trimmed.length > 0) {
    var cleanText = trimmed.replace(/\\b\\d+\\.\\d+\\b/g, '0');
    var matched = cleanText.match(/[^.!?。！？]+[.!?。！？]+(\\s+|$)|[^.!?。！？]+$/g);
    sentences = matched ? matched.filter(function(s) { return s.trim().length > 0; }).length : (trimmed.length > 0 ? 1 : 0);
  }

  var wpmReading = config.readingSpeedWpm > 0 ? config.readingSpeedWpm : 200;
  var wpmSpeaking = config.speakingSpeedWpm > 0 ? config.speakingSpeedWpm : 130;

  var readingTimeSeconds = words > 0 ? (words / wpmReading) * 60 : 0;
  var speakingTimeSeconds = words > 0 ? (words / wpmSpeaking) * 60 : 0;

  function fmtDuration(secs) {
    if (secs <= 0) return '0s';
    if (secs < 60) return Math.max(1, Math.round(secs)) + 's';
    var mins = Math.floor(secs / 60);
    var rem = Math.round(secs % 60);
    if (rem === 0) return mins + ' min';
    return mins + 'm ' + rem + 's';
  }

  var avgWordLength = words > 0 ? Number((charactersNoSpaces / words).toFixed(1)) : 0;
  var endTime = performance.now();
  var processingTimeMs = Number((endTime - startTime).toFixed(2));

  self.postMessage({
    words: words,
    characters: characters,
    charactersNoSpaces: charactersNoSpaces,
    sentences: sentences,
    paragraphs: paragraphs,
    lines: lines,
    readingTimeSeconds: readingTimeSeconds,
    readingTimeFormatted: fmtDuration(readingTimeSeconds),
    speakingTimeSeconds: speakingTimeSeconds,
    speakingTimeFormatted: fmtDuration(speakingTimeSeconds),
    avgWordLength: avgWordLength,
    processingTimeMs: processingTimeMs
  });
};
`;

export function useTextCounterWorker(text: string, config: EngineConfig = DEFAULT_ENGINE_CONFIG) {
  const [stats, setStats] = useState<TextStatistics>(() => analyzeText(text, config));
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Web Worker via Blob URL
    try {
      if (typeof window !== 'undefined' && window.Worker) {
        const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = (e: MessageEvent<TextStatistics>) => {
          setStats(e.data);
          setIsProcessing(false);
        };

        worker.onerror = (err) => {
          console.warn('Text counter worker error, falling back to main thread calculation:', err);
          setStats(analyzeText(text, config));
          setIsProcessing(false);
        };

        workerRef.current = worker;

        return () => {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
        };
      }
    } catch (e) {
      console.warn('Web Workers unavailable, running on main thread:', e);
    }
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      setIsProcessing(true);
      workerRef.current.postMessage({ text, config });
    } else {
      // Main-thread fallback
      setStats(analyzeText(text, config));
    }
  }, [text, config.readingSpeedWpm, config.speakingSpeedWpm]);

  return { stats, isProcessing };
}
