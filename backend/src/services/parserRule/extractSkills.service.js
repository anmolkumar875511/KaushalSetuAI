export const extractSkills = (sectionText = '') => {
    if (!sectionText) return [];

    const groups = {
        languages: [],
        frameworks: [],
        tools: [],
        databases: [],
    };

    const lines = sectionText.split('\n');

    lines.forEach((line) => {
        if (line.includes('languages:')) {
            groups.languages.push(...line.split(':')[1].split(','));
        }
        if (line.includes('frameworks:')) {
            groups.frameworks.push(...line.split(':')[1].split(','));
        }
        if (line.includes('developer tools:')) {
            groups.tools.push(...line.split(':')[1].split(','));
        }
        if (line.includes('cloud/databases:')) {
            groups.databases.push(...line.split(':')[1].split(','));
        }
    });

    return Object.values(groups)
        .flat()
        .map((s) => s.trim())
        .filter(Boolean)
        .map((skill) => ({
            name: skill.toLowerCase(),
            level: 'intermediate',
            confidence: 0.85,
            source: 'resume',
        }));
};
