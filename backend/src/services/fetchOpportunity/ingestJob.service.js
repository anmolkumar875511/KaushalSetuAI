import { ingestFindWorkJobs } from './findWorkIngest.service.js';
import { DOMAIN_KEYWORDS } from '../../utils/constants.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DELAY_BETWEEN_KEYWORDS_MS = 2000;

export const runIngestion = async () => {
    const summary = { total: 0, byDomain: {} };

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
        summary.byDomain[domain] = 0;

        for (const keyword of keywords) {
            try {
                console.log(`[Ingestion] Processing: "${keyword}" (${domain})`);

                const saved = await ingestFindWorkJobs(keyword);
                summary.total += saved;
                summary.byDomain[domain] += saved;

                console.log(`[Ingestion] ✓ ${saved} jobs upserted for "${keyword}"`);
            } catch (err) {
                console.error(`[Ingestion] ✗ Failed for "${keyword}":`, err.message);
            }

            await sleep(DELAY_BETWEEN_KEYWORDS_MS);
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
            const saved = await ingestFindWorkJobs(keyword);
            total += saved;
            console.log(`[Ingestion:${domain}] ✓ ${saved} jobs for "${keyword}"`);
        } catch (err) {
            console.error(`[Ingestion:${domain}] ✗ Failed for "${keyword}":`, err.message);
        }
        await sleep(DELAY_BETWEEN_KEYWORDS_MS);
    }

    return total;
};
