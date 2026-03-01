export const SKILL_ALLIAS = {
    javascript: 'js',
    html: 'html5',
    css: 'css3',
    aws: 'amazon web services',
    cpp: 'c++',
    cplusplus: 'c++',
    node: 'nodejs',
    'node.js': 'nodejs',
    reactjs: 'react',
    'react.js': 'react',
    mongodb: 'mongo',
    postgres: 'postgresql',
    golang: 'go',
    py: 'python',
    amazonwebservices: 'amazon web services',
    hr: 'human resources',
    pr: 'public relations',
};

export const normalizeSkill = (skill) => {
    if (!skill) return '';

    let normalized = skill.toLowerCase().trim();

    normalized = normalized.replace(/[^a-z0-9+#]/g, '');

    return SKILL_ALLIAS[normalized] || normalized;
};
