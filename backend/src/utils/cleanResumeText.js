export const cleanResumeText = (text) => {
    return text
        .normalize('NFKD')
        .replace(/[^\x00-\x7F]/g, '')
        .replace(/[•▪●■]/g, '\n- ')
        .replace(/\s{2,}/g, ' ')
        .replace(/(skills|education|projects|experience)/gi, '\n\n$1\n')
        .trim();
};
