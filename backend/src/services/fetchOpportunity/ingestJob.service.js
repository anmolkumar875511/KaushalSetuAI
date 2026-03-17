import { ingestFindWorkJobs } from './findWorkIngest.service.js';
import { runAIEnrichmentBatch } from './enrichment.service.js';
import { DOMAIN_KEYWORDS } from '../../utils/constants.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ─────────────────────────────────────────────
   Two-phase pipeline
   ─────────────────────────────────────────────
   Phase 1 — runIngestion (fast, runs on demand / every few hours)
     Fetches jobs from FindWork, normalises with rule-based only.
     No Gemini calls. New jobs stored with aiEnriched: false.

   Phase 2 — runAIEnrichmentBatch (slow, runs once per day via cron)
     Picks up to 50 un-enriched jobs, calls Gemini for each one
     to improve requiredSkills, experienceLevel, and salary estimates.
     Stays within free-tier 1500 RPD with headroom for the rest of the app.

   Cron example (node-cron):
     '0 3 * * *'  →  3 AM daily — runs enrichment after overnight ingest
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   FindWork rate limit strategy

   FindWork doesn't publish a rate limit, but the 429s appear after
   ~1000 requests in a short window. Each page = 1 request.
   We observed 3 keywords × ~5 pages = ~15 requests before hitting 429.

   Fix: scale the inter-keyword delay by how many pages were just fetched.
     BASE_DELAY    — minimum gap regardless of page count (3s)
     PER_PAGE_MS   — extra cooldown per page fetched (2s)
   Example: 5-page keyword → 3s + 5×2s = 13s cooldown before next keyword.
   This keeps the sustained request rate well below FindWork's threshold.
───────────────────────────────────────────── */
const BASE_DELAY_MS = 3_000;
const PER_PAGE_MS = 2_000;

const delayAfterKeyword = (pagesFetched) => sleep(BASE_DELAY_MS + pagesFetched * PER_PAGE_MS);

/**
 * runIngestion — Phase 1
 * Rule-based ingest of all domain keywords. Fast, no AI quota usage.
 */
export const runIngestion = async () => {
    const summary = { total: 0, byDomain: {} };

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
        summary.byDomain[domain] = 0;

        for (const keyword of keywords) {
            try {
                console.log(`[Ingestion] Processing: "${keyword}" (${domain})`);
                const { count, pagesFetched } = await ingestFindWorkJobs(keyword);
                summary.total += count;
                summary.byDomain[domain] += count;
                console.log(
                    `[Ingestion] ✓ ${count} jobs upserted for "${keyword}" (${pagesFetched} pages)`
                );
                await delayAfterKeyword(pagesFetched);
            } catch (err) {
                console.error(`[Ingestion] ✗ Failed for "${keyword}":`, err.message);
                await sleep(BASE_DELAY_MS);
            }
        }
    }

    console.log('[Ingestion] Complete.', summary);
    return summary;
};

/**
 * runIngestionForDomain — Phase 1 (single domain)
 */
export const runIngestionForDomain = async (domain) => {
    const keywords = DOMAIN_KEYWORDS[domain];
    if (!keywords?.length) throw new Error(`Unknown domain: ${domain}`);

    let total = 0;
    for (const keyword of keywords) {
        try {
            const { count, pagesFetched } = await ingestFindWorkJobs(keyword);
            total += count;
            console.log(
                `[Ingestion:${domain}] ✓ ${count} jobs for "${keyword}" (${pagesFetched} pages)`
            );
            await delayAfterKeyword(pagesFetched);
        } catch (err) {
            console.error(`[Ingestion:${domain}] ✗ Failed for "${keyword}":`, err.message);
            await sleep(BASE_DELAY_MS);
        }
    }

    return total;
};

export { runAIEnrichmentBatch as runEnrichment };
