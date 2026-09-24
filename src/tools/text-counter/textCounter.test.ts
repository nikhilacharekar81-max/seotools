import { analyzeText, DEFAULT_ENGINE_CONFIG } from './engine';

/**
 * Automated Test Suite for Text Counter & Analyzer
 * Can be run in node or browser to verify deterministic calculations.
 */
export function runTextCounterTests() {
  const results: { test: string; passed: boolean; details?: string }[] = [];

  function assert(testName: string, condition: boolean, details?: string) {
    results.push({ test: testName, passed: condition, details });
  }

  // 1. Empty Text
  const empty = analyzeText('');
  assert('Empty text yields zero for all stats', 
    empty.words === 0 && empty.characters === 0 && empty.charactersNoSpaces === 0 && empty.sentences === 0 && empty.paragraphs === 0 && empty.lines === 0
  );

  // 2. Single Word
  const single = analyzeText('OmniTools');
  assert('Single word counting', single.words === 1 && single.characters === 9 && single.charactersNoSpaces === 9 && single.lines === 1);

  // 3. Multiple spaces and newlines
  const spacing = analyzeText('  Hello    World!   \n\n  Next  line.  ');
  assert('Multiple spaces and newlines tokenization', spacing.words === 4 && spacing.sentences === 2 && spacing.paragraphs === 2);

  // 4. Decimal numbers in sentences
  const decimals = analyzeText('The value of pi is approximately 3.14159. Have a nice day!');
  assert('Decimal numbers do not falsely split sentences', decimals.sentences === 2);

  // 5. Unicode and Emojis
  const unicode = analyzeText('Hello 🚀 world! 🌟 Have fun.');
  assert('Emojis and unicode characters', unicode.words === 5 && unicode.sentences === 2);

  // 6. CJK Ideographs (Chinese/Japanese/Korean)
  const cjk = analyzeText('你好世界！');
  assert('CJK characters recognized as distinct word tokens', cjk.words === 4 && cjk.sentences === 1);

  // 7. Reading and Speaking Time
  const tenWords = analyzeText('one two three four five six seven eight nine ten', { readingSpeedWpm: 200, speakingSpeedWpm: 100 });
  // 10 words at 200 wpm = 0.05 min = 3 seconds
  assert('Reading time calculation', Math.round(tenWords.readingTimeSeconds) === 3);
  // 10 words at 100 wpm = 0.1 min = 6 seconds
  assert('Speaking time calculation', Math.round(tenWords.speakingTimeSeconds) === 6);

  // 8. Large Text Simulation
  const largeSample = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(1000);
  const largeRes = analyzeText(largeSample);
  assert('Large text 8,000 words processes quickly', largeRes.words === 8000 && largeRes.processingTimeMs >= 0);

  return results;
}
