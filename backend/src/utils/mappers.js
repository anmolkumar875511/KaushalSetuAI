import { DOMAIN_SKILLS } from './constants.js';
import { DOMAINS } from './constants.js';
import { normalizeForSkills } from './normalizeForSkills.js';

export const mapCategoryFromText = (title = '', description = '') => {
    const text = `${title} ${description}`.toLowerCase();

    for (const [domain, keywords] of Object.entries(DOMAINS)) {
        if (keywords.some((keyword) => text.includes(keyword))) {
            return domain;
        }
    }

    return 'other';
};

export const mapOpportunityType = (title = '', description = '') => {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('intern') || text.includes('internship') || text.includes('trainee')) {
        return 'internship';
    }

    return 'job';
};

export const mapExperienceLevel = (title = '', description = '') => {
    const text = `${title} ${description}`.toLowerCase();

    if (
        text.includes('senior') ||
        text.includes('lead') ||
        text.includes('principal') ||
        text.includes('architect')
    ) {
        return 'advanced';
    }

    if (
        text.includes('2+ years') ||
        text.includes('3+ years') ||
        text.includes('mid level') ||
        text.includes('intermediate')
    ) {
        return 'intermediate';
    }

    return 'beginner';
};

export const extractSkills = (description = '', domain = 'other') => {
    const skillMap = DOMAIN_SKILLS[domain] || {};
    const text = normalizeForSkills(description);

    const found = new Set();

    for (const [canonical, aliases] of Object.entries(skillMap)) {
        for (const alias of aliases) {
            const aliasText = normalizeForSkills(alias);
            const regex = new RegExp(`\\b${aliasText}\\b`, 'i');

            if (regex.test(text)) {
                found.add(canonical);
                break;
            }
        }
    }

    return [...found];
};
