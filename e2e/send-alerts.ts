/**
 * Post-test script: parses Playwright JSON results and sends failure alerts.
 *
 * Usage:  npx tsx e2e/send-alerts.ts
 *
 * This is called by the GitHub Actions workflow after tests complete.
 */

import fs from 'fs';
import path from 'path';
import { parsePlaywrightResults, sendFailureAlerts } from './utils/notifier';

async function main() {
  const resultsPath = path.resolve(__dirname, '../test-results/results.json');

  if (!fs.existsSync(resultsPath)) {
    console.log('No test results file found — skipping alerts.');
    process.exit(0);
  }

  const raw = fs.readFileSync(resultsPath, 'utf-8');
  const resultsJson = JSON.parse(raw);

  const runUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : undefined;

  const failures = parsePlaywrightResults(resultsJson, runUrl);

  if (failures.length === 0) {
    console.log('All tests passed — no alerts needed.');
    process.exit(0);
  }

  console.log(`${failures.length} failure(s) detected. Sending alerts...`);
  await sendFailureAlerts(failures);
  console.log('Alerts sent.');
}

main().catch((err) => {
  console.error('Alert script failed:', err);
  process.exit(1);
});
