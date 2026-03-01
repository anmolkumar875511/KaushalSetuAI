import { DOMAINS } from './constants.js';

export function mapDomain(title = '', description = '') {
    const text = `${title} ${description}`.toLowerCase();

    for (const [domain, keywords] of Object.entries(DOMAINS)) {
        if (keywords.some((keyword) => text.includes(keyword))) {
            return domain;
        }
    }

    return 'other';
}
