import { ingestFindWorkJobs } from './findWorkIngest.service.js';
import { DOMAIN_KEYWORDS } from '../../utils/constants.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const runIngestion = async () => {
    try {
        for (const keywords of Object.values(DOMAIN_KEYWORDS)) {
            for (const keyword of keywords) {
                try {
                    const saved = await ingestFindWorkJobs(keyword);
                    console.log(`${saved} jobs ingested for keyword: ${keyword}`);
                    await sleep(1500);
                } catch (error) {
                    console.error(`Failed for keyword "${keyword}":`, error.message);
                }
            }
        }
    } catch (error) {
        console.error(`Failed to ingest job:`, error.message);
    }
};
