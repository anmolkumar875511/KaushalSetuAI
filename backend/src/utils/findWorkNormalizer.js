import { mapDomain }            from './domainMapper.js';
import { DOMAIN_SKILLS }        from './constants.js';
import {
    enrichJobWithAI,
    extractSkillsRuleBased,
    inferExperienceLevel,
    extractSalaryFromText,
    benchmarkSalary,
} from '../services/fetchOpportunity/jobEnricher.service.js';

/**
 * normalizeFindWorkJob
 *
 * Full enrichment pipeline per job.
 * @param {object}  job    — raw FindWork API job object
 * @param {boolean} [useAI=true] — set false to skip Gemini call (for already-known jobs)
 */
export async function normalizeFindWorkJob(job, useAI = true) {
    const title       = (job.role         ?? '').trim();
    const description = (job.text         ?? '').trim();
    const location    = (job.location     ?? 'Remote').trim();
    const rawSkills   = Array.isArray(job.keywords) ? job.keywords : [];

    /* ── 1. Category ── */
    const category = mapDomain(title, description);

    /* ── 2. AI enrichment (only for new jobs, best effort) ── */
    const ai = useAI ? await enrichJobWithAI(title, description) : null;

    /* ── 3. Skills — priority: AI → rule-based regex → API keywords → domain defaults ── */
    let skills = [];

    if (ai?.skills?.length) {
        skills = ai.skills;
    } else {
        const ruleSkills = extractSkillsRuleBased(description);
        skills = ruleSkills.length
            ? ruleSkills
            : rawSkills.length
                ? rawSkills.map((s) => s.toLowerCase().trim())
                : (DOMAIN_SKILLS[category] ?? []).slice(0, 8);
    }

    // Deduplicate + lowercase + remove empty
    skills = [...new Set(skills.map((s) => s.toLowerCase().trim()).filter(Boolean))].slice(0, 20);

    /* ── 4. Experience level — AI → rule-based ── */
    const experienceLevel = ai?.experienceLevel ?? inferExperienceLevel(title, description);

    /* ── 5. Salary — explicit text → AI → benchmark ── */
    const fullText  = `${title} ${description}`;
    let salaryMin   = null;
    let salaryMax   = null;

    // Try explicit salary mention in description
    const extracted = extractSalaryFromText(fullText);
    if (extracted) {
        salaryMin = extracted.min;
        salaryMax = extracted.max;
    } else if (ai?.salaryMin && ai?.salaryMax) {
        // Use AI estimate
        salaryMin = ai.salaryMin;
        salaryMax = ai.salaryMax;
    } else {
        // Fall back to benchmark
        const bench = benchmarkSalary(category, experienceLevel);
        salaryMin   = bench.min;
        salaryMax   = bench.max;
    }

    return {
        title,
        company:         { name: (job.company_name ?? 'Unknown').trim() },
        description,
        requiredSkills:  skills,
        category,
        opportunityType: 'job',
        experienceLevel,
        location,
        stipendOrSalary: {
            min:      salaryMin  ?? 0,
            max:      salaryMax  ?? 0,
            currency: 'INR',
        },
        applicationLink: job.url ?? '',
        source:          'external',
        externalSource:  'findwork',
        externalId:      String(job.id),
        isActive:        true,
        lastSeenAt:      new Date(),
    };
}