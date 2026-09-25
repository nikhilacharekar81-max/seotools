import { runAutomatedTestSuite } from './src/tools/plagiarism-checker/test_suite';

async function main() {
  process.env.NODE_ENV = 'test';
  process.env.SEARCH_PROVIDER = 'test_mode';

  console.log('Running test suite in NODE_ENV=test mode...\n');
  
  const results = await runAutomatedTestSuite();
  
  console.log('| Test | Environment | Provider | Executed | Result | Status |');
  console.log('| ---- | ----------- | -------- | -------- | ------ | ------ |');
  for (const r of results) {
    const executedStr = r.executed ? 'Yes' : 'No';
    console.log(`| ${r.name} | ${r.environment} | ${r.provider} | ${executedStr} | ${r.actual.replace(/\|/g, '/')} | ${r.status} |`);
  }
  
  const failedCount = results.filter(t => t.status === 'FAIL').length;
  const passCount = results.filter(t => t.status === 'PASS').length;
  const skippedCount = results.filter(t => t.status === 'SKIPPED').length;

  console.log(`\nSummary: ${passCount} Passed, ${failedCount} Failed, ${skippedCount} Skipped.`);

  const allApplicablePassed = failedCount === 0;
  process.exit(allApplicablePassed ? 0 : 1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
