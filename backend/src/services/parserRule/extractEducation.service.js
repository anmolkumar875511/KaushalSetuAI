export const extractEducation = (sectionText = '') => {
    if (!sectionText) return [];

    const blocks = sectionText
        .split('\n•')
        .map((b) => b.trim())
        .filter((b) => b.length > 20);

    return blocks.map((block) => {
        const year = block.match(/20\d{2}/)?.[0] || null;

        const degreeMatch = block.match(/b\.tech|bs|bachelor|m\.tech|intermediate|high school/i);

        const lines = block.split('\n').filter(Boolean);

        return {
            degree: degreeMatch ? degreeMatch[0].toLowerCase() : '',
            institute: lines[0]?.replace(/20\d{2}.*/, '').trim() || '',
            year: year ? Number(year) : null,
        };
    });
};
