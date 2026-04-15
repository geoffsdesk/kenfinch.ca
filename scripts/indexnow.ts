/**
 * IndexNow submitter
 *
 * Pings IndexNow (Bing + Yandex + others — critically the ChatGPT browsing
 * backend uses Bing) with a list of URLs whenever content changes. Run this
 * post-deploy from CI, or locally after publishing new content.
 *
 * Usage:
 *   # Submit every URL in the sitemap:
 *   npm run indexnow
 *
 *   # Submit specific URLs:
 *   npm run indexnow -- https://www.kenfinch.ca/blog/new-post https://www.kenfinch.ca/sell
 *
 * Key is published at /public/<key>.txt and served from
 * https://www.kenfinch.ca/<key>.txt so IndexNow can verify ownership.
 */

const HOST = 'www.kenfinch.ca';
const KEY = 'dce69cfd4f284344ed6693ce3f1a98d0';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITE_ORIGIN = `https://${HOST}`;

// Neighbourhood slugs — kept hard-coded rather than imported so this script
// has no dependency on the Next.js runtime.
const NEIGHBOURHOOD_SLUGS = [
  'old-oakville', 'bronte', 'glen-abbey', 'river-oaks', 'west-oak-trails',
  'eastlake', 'college-park', 'morrison', 'palermo', 'uptown-core',
  'iroquois-ridge', 'sixteen-hollow',
];

const BLOG_SLUGS = [
  'how-to-price-your-oakville-home-2026',
  'staging-tips-oakville-homes',
  'oakville-vs-burlington-selling-2026',
  'spring-2026-sellers-checklist-oakville',
  'october-2026-market-report-oakville',
  '90-day-executive-sale-plan',
];

function defaultUrlList(): string[] {
  return [
    `${SITE_ORIGIN}/`,
    `${SITE_ORIGIN}/sell`,
    `${SITE_ORIGIN}/contact`,
    `${SITE_ORIGIN}/neighborhoods`,
    `${SITE_ORIGIN}/blog`,
    ...NEIGHBOURHOOD_SLUGS.map((s) => `${SITE_ORIGIN}/neighborhoods/${s}`),
    ...BLOG_SLUGS.map((s) => `${SITE_ORIGIN}/blog/${s}`),
  ];
}

async function submit(urls: string[]): Promise<void> {
  if (urls.length === 0) {
    console.error('No URLs supplied — nothing to submit.');
    process.exit(1);
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  console.log(`Submitting ${urls.length} URL(s) to IndexNow...`);
  for (const u of urls) console.log(`  - ${u}`);

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  console.log(`\nIndexNow responded: ${res.status} ${res.statusText}`);

  // 200 = URLs received. 202 = URLs received, key validation in progress.
  // 400 = invalid request. 403 = key not valid. 422 = URLs don't belong to host.
  // 429 = rate limited.
  if (res.status === 200 || res.status === 202) {
    console.log('Success.');
    return;
  }

  const body = await res.text().catch(() => '');
  console.error(`IndexNow submission failed. Response body:\n${body}`);
  process.exit(1);
}

const cliUrls = process.argv.slice(2);
const urls = cliUrls.length > 0 ? cliUrls : defaultUrlList();
submit(urls).catch((err) => {
  console.error('IndexNow submission errored:', err);
  process.exit(1);
});
