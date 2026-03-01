export const splitSections = (text = '') => {
    const sections = {};
    const lines = text.split('\n');

    let current = null;

    const MAP = {
        education: ['education', 'academic', 'qualifications'],
        projects: ['personal projects', 'projects', 'project experience'],
        skills: [
            'technical skills',
            'skills',
            'skill set',
            'areas of expertise',
            'expertise',
            'technologies',
        ],
        experience: ['positions of responsibility', 'experience'],
        coding: ['coding achievements'],
    };

    for (const line of lines) {
        const clean = line.trim();

        for (const key in MAP) {
            if (MAP[key].some((h) => clean.includes(h))) {
                current = key;
                sections[current] = [];
                continue;
            }
        }

        if (current) sections[current].push(clean);
    }

    Object.keys(sections).forEach((k) => (sections[k] = sections[k].join('\n')));

    return sections;
};
