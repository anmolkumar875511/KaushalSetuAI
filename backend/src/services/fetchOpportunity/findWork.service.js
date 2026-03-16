import axios from 'axios';

const MAX_PAGES = 5;

export const fetchJobsFromFindWork = async (keyword) => {
    const allResults = [];
    let url = process.env.FINDWORK_BASE_URL;
    let page = 1;

    while (url && page <= MAX_PAGES) {
        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Token ${process.env.FINDWORK_API_KEY}` },
                params: page === 1 ? { search: keyword } : undefined,
                timeout: 10000,
            });

            const data = response.data;
            const results = data.results || [];
            allResults.push(...results);

            url = data.next ?? null;
            page++;

            if (results.length < 10) break;
        } catch (err) {
            console.error(
                `[FindWork] Fetch failed for keyword "${keyword}" page ${page}:`,
                err.message
            );
            break;
        }
    }

    return allResults;
};
