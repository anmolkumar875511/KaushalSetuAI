import { ingestFindWorkJobs } from './findWorkIngest.service.js';
import { runAIEnrichmentBatch } from './enrichment.service.js';
import { DOMAIN_KEYWORDS } from '../../utils/constants.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BASE_DELAY_MS = 3_000;
const PER_PAGE_MS = 2_000;

const delayAfterKeyword = (pagesFetched) => sleep(BASE_DELAY_MS + pagesFetched * PER_PAGE_MS);

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
