export const extractExperience = (experienceSection = '', positionsSection = '') => {
    const sourceText = `${experienceSection}\n${positionsSection}`.trim();
    if (!sourceText) return [];

    const experience = [];
    const seen = new Set();

    const lines = sourceText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const ROLE_KEYWORDS = [
        'intern',
        'developer',
        'engineer',
        'team leader',
        'lead',
        'member',
        'coordinator',
        'media team',
        'volunteer',
        'contributor',
    ];

    lines.forEach((line) => {
        const lower = line.toLowerCase();
        if (lower.includes('positions of responsibility') || lower.includes('experience')) {
            return;
        }

        if (!ROLE_KEYWORDS.some((k) => lower.includes(k))) return;

        const rangeMatch = line.match(/(20\d{2})\s*[–-]\s*(20\d{2}|current)/i);
        const singleYearMatch = line.match(/20\d{2}/);

        let durationMonths = null;

        if (rangeMatch) {
            const start = Number(rangeMatch[1]);
            const end =
                rangeMatch[2].toLowerCase() === 'current'
                    ? new Date().getFullYear()
                    : Number(rangeMatch[2]);

            durationMonths = Math.max(0, (end - start) * 12);
        }

        const role = line
            .replace(/20\d{2}.*/, '')
            .replace(/positions of responsibility/i, '')
            .trim();

        if (!role || seen.has(role)) return;

        seen.add(role);

        experience.push({
            role,
            company: '',
            durationMonths,
        });
    });

    return experience;
};
