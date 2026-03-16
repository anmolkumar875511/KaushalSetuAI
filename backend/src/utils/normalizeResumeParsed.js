import { DOMAINS } from './constants.js';

/* ── Enum values mirroring the ResumeParsed Mongoose model exactly ── */
const VALID_SKILL_LEVELS = ['beginner', 'intermediate', 'advanced']; // skills.level
const VALID_CATEGORY_SOURCES = ['rule_based', 'ai_inferred']; // categories.source
const VALID_SKILL_SOURCES = ['resume', 'ai_inferred']; // skills.source
const VALID_DOMAINS = new Set(Object.keys(DOMAINS)); // categories.name

const clamp = (n, min = 0, max = 1) =>
    typeof n === 'number' && !isNaN(n) ? Math.min(max, Math.max(min, n)) : 0.7;

/**
 * SKILL_ALIASES
 * Maps common variants to a canonical lowercase form so "react" and
 * "react.js" are never stored as two separate skill documents.
 */
const SKILL_ALIASES = {
    react: 'react.js',
    reactjs: 'react.js',
    node: 'node.js',
    nodejs: 'node.js',
    express: 'express.js',
    expressjs: 'express.js',
    next: 'next.js',
    nextjs: 'next.js',
    vue: 'vue.js',
    vuejs: 'vue.js',
    angularjs: 'angular',
    postgres: 'postgresql',
    mongo: 'mongodb',
    k8s: 'kubernetes',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    cpp: 'c++',
    golang: 'go',
    dotnet: '.net',
    net: '.net',
};

const canonicalSkillName = (name) => {
    const lower = name.toLowerCase().trim().replace(/\s+/g, ' ');
    return SKILL_ALIASES[lower] ?? lower;
};

export const normalizeResumeParsed = (data, caller = 'ai') => {
    if (!data || typeof data !== 'object') {
        return { categories: [], skills: [], experience: [], education: [], projects: [] };
    }

    const defaultCategorySource = caller === 'rule' ? 'rule_based' : 'ai_inferred';

    const categories = Array.isArray(data.categories)
        ? data.categories
              .filter((c) => c?.name && typeof c.name === 'string')
              .map((c) => ({
                  name: c.name.toLowerCase().trim(),
                  confidence: clamp(Number(c.confidence)),
                  source: VALID_CATEGORY_SOURCES.includes(c.source)
                      ? c.source
                      : defaultCategorySource,
              }))
              .filter((c) => VALID_DOMAINS.has(c.name))
              .reduce((acc, c) => {
                  const existing = acc.find((x) => x.name === c.name);
                  if (existing) {
                      existing.confidence = Math.max(existing.confidence, c.confidence);
                  } else {
                      acc.push(c);
                  }
                  return acc;
              }, [])
        : [];

    const skillMap = new Map();

    if (Array.isArray(data.skills)) {
        for (const s of data.skills) {
            if (!s?.name || typeof s.name !== 'string') continue;

            const canonical = canonicalSkillName(s.name);
            if (!canonical) continue;

            const entry = {
                name: canonical, // lowercase — model has lowercase:true
                level: VALID_SKILL_LEVELS.includes(s.level) ? s.level : 'beginner',
                confidence: clamp(Number(s.confidence)),
                source: VALID_SKILL_SOURCES.includes(s.source) ? s.source : 'resume',
            };

            const existing = skillMap.get(canonical);
            if (!existing || entry.confidence > existing.confidence) {
                skillMap.set(canonical, entry);
            }
        }
    }

    const experience = Array.isArray(data.experience)
        ? data.experience
              .filter((e) => e?.role || e?.company)
              .map((e) => ({
                  role: (e.role ?? '').trim(),
                  company: (e.company ?? '').trim(),
                  durationMonths:
                      Number.isFinite(e.durationMonths) && e.durationMonths >= 0
                          ? Math.round(e.durationMonths)
                          : undefined,
              }))
        : [];

    const currentYear = new Date().getFullYear();
    const education = Array.isArray(data.education)
        ? data.education
              .filter((ed) => ed?.degree || ed?.institute)
              .map((ed) => ({
                  degree: (ed.degree ?? '').trim(),
                  institute: (ed.institute ?? '').trim(),
                  year:
                      Number.isInteger(ed.year) && ed.year >= 1950 && ed.year <= currentYear + 6
                          ? ed.year
                          : undefined,
              }))
        : [];

    const projects = Array.isArray(data.projects)
        ? data.projects
              .filter((p) => p?.title && typeof p.title === 'string' && p.title.trim())
              .map((p) => ({
                  title: p.title.trim(),
                  description: (p.description ?? '').trim(),
              }))
        : [];

    return {
        categories,
        skills: Array.from(skillMap.values()),
        experience,
        education,
        projects,
    };
};
