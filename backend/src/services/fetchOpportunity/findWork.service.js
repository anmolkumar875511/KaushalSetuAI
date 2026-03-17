import axios from 'axios';

const MAX_PAGES = 5; // max pages per keyword (100 results/page → 500 max)
const FETCH_TIMEOUT = 25_000; // 25s — FindWork pagination pages can be slow
const PAGE_DELAY_MS = 1_000; // 1s between pages — polite to the API
const MAX_FETCH_RETRIES = 2; // retry once on timeout or 5xx before giving up

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * fetchPage
 * Fetches a single FindWork page with retry on timeout / 5xx errors.
 */
const fetchPage = async (url, params, attempt = 1) => {
    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Token ${process.env.FINDWORK_API_KEY}` },
            params,
            timeout: FETCH_TIMEOUT,
        });
        return response.data;
    } catch (err) {
        const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
        const is5xx = err.response?.status >= 500;
        const isRetryable = isTimeout || is5xx;

        if (isRetryable && attempt < MAX_FETCH_RETRIES) {
            const waitMs = 5000 * attempt;
            console.warn(
                `[FindWork] ${isTimeout ? 'Timeout' : err.response?.status} on page — retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/${MAX_FETCH_RETRIES})`
            );
            await sleep(waitMs);
            return fetchPage(url, params, attempt + 1);
        }

        throw err; // bubble up — caller logs and skips this keyword
    }
};

/**
 * fetchJobsFromFindWork
 *
 * Fetches all pages for a given keyword from the FindWork API.
 * Follows the `next` pagination URL returned by the API.
 * Stops early if a page returns fewer than 10 results (last page).
 */
export const fetchJobsFromFindWork = async (keyword) => {
    const allResults = [];
    let url = process.env.FINDWORK_BASE_URL;
    let params = { search: keyword };
    let page = 1;

    while (url && page <= MAX_PAGES) {
        try {
            const data = await fetchPage(url, page === 1 ? params : undefined);
            const results = data.results ?? [];

            allResults.push(...results);
            console.log(`[FindWork] "${keyword}" page ${page}: ${results.length} results`);

            url = data.next ?? null;
            params = undefined;
            page++;

            if (results.length < 10) break;

            if (url) await sleep(PAGE_DELAY_MS);
        } catch (err) {
            console.error(
                `[FindWork] Fetch failed for keyword "${keyword}" page ${page}:`,
                err.message
            );
            break;
        }
    }

    return { results: allResults, pagesFetched: page - 1 };
};
