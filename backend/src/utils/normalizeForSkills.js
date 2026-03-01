import { normalizeText } from './normalizeText.js';
export const normalizeForSkills = (text = '') => {
    return normalizeText(text)
        .replace(/[^a-z0-9+.\s-]/g, ' ')
        .replace(/\./g, '')
        .replace(/\s+/g, ' ')
        .trim();
};
