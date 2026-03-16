import { DOMAINS } from './constants.js';

export function mapDomain(title = '', description = '') {
    const titleText = title.toLowerCase();
    const descText = (description ?? '').toLowerCase().slice(0, 2000); // cap description scan

    const scores = {};

    for (const [domain, keywords] of Object.entries(DOMAINS)) {
        let score = 0;
        for (const keyword of keywords) {
            if (titleText.includes(keyword)) score += 3;
            if (descText.includes(keyword)) score += 1;
        }
        if (score > 0) scores[domain] = score;
    }

    if (!Object.keys(scores).length) return 'other';

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}
