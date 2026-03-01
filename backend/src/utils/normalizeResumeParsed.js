import { DOMAINS } from './constants.js';

const VALID_SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];
const VALID_CATEGORY_SOURCES = ['rule_based', 'ai_inferred'];
const VALID_SKILL_SOURCES = ['resume', 'ai_inferred'];

const VALID_DOMAINS = Object.keys(DOMAINS);

const clamp = (n, min = 0, max = 1) =>
    typeof n === 'number' ? Math.min(max, Math.max(min, n)) : 0.7;

export const normalizeResumeParsed = (data) => {
    return {
        categories: Array.isArray(data.categories)
            ? data.categories
                  .filter((c) => c?.name)
                  .map((c) => ({
                      name: c.name.toLowerCase().trim(),
                      confidence: clamp(Number(c.confidence)),
                      source: VALID_CATEGORY_SOURCES.includes(c.source) ? c.source : 'rule_based',
                  }))
                  .filter((c) => VALID_DOMAINS.includes(c.name))
            : [],

        skills: Array.isArray(data.skills)
            ? data.skills
                  .filter((s) => s?.name)
                  .map((s) => ({
                      name: s.name.toLowerCase().trim(),
                      level: VALID_SKILL_LEVELS.includes(s.level) ? s.level : 'beginner',
                      confidence: clamp(Number(s.confidence)),
                      source: VALID_SKILL_SOURCES.includes(s.source) ? s.source : 'resume',
                  }))
            : [],

        experience: Array.isArray(data.experience)
            ? data.experience.map((e) => ({
                  role: e?.role || '',
                  company: e?.company || '',
                  durationMonths: typeof e?.durationMonths === 'number' ? e.durationMonths : null,
              }))
            : [],

        education: Array.isArray(data.education)
            ? data.education.map((ed) => ({
                  degree: ed?.degree || '',
                  institute: ed?.institute || '',
                  year: typeof ed?.year === 'number' ? ed.year : null,
              }))
            : [],

        projects: Array.isArray(data.projects)
            ? data.projects
                  .filter((p) => p?.title)
                  .map((p) => ({
                      title: p.title.trim(),
                      description: p?.description || '',
                  }))
            : [],
    };
};
