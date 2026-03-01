export const extractProjects = (sectionText = '') => {
    if (!sectionText) return [];

    const lines = sectionText.split('\n').filter(Boolean);
    const projects = [];

    let current = null;

    lines.forEach((line) => {
        if (line.match(/20\d{2}/) && !line.startsWith('-')) {
            if (current) projects.push(current);
            current = { title: line.trim(), description: '' };
        } else if (current) {
            current.description += ' ' + line.trim();
        }
    });

    if (current) projects.push(current);

    return projects;
};
