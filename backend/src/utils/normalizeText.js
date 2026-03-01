export const normalizeText = (text = '') => {
    return text
        .toLowerCase()
        .replace(/[§#ï]/g, ' ')
        .replace(/•/g, '\n• ')
        .replace(/[–—]/g, '-')
        .replace(/[^\x00-\x7F]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\n{2,}/g, '\n')
        .trim();
};
