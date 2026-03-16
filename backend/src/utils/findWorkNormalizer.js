import { mapDomain } from './domainMapper.js';
import { DOMAIN_SKILLS } from './constants.js';
import {
    enrichJobWithAI,
    extractSkillsRuleBased,
    inferExperienceLevel,
    extractSalaryFromText,
    benchmarkSalary,
} from '../services/fetchOpportunity/jobEnricher.service.js';

export async function normalizeFindWorkJob(job) {
    const title = (job.role ?? '').trim();
    const description = (job.text ?? '').trim();
    const location = (job.location ?? 'Remote').trim();
    const rawSkills = Array.isArray(job.keywords) ? job.keywords : [];

    const category = mapDomain(title, description);

    const ai = await enrichJobWithAI(title, description);

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

    skills = [...new Set(skills.map((s) => s.toLowerCase().trim()).filter(Boolean))].slice(0, 20);

    const experienceLevel = ai?.experienceLevel ?? inferExperienceLevel(title, description);

    const fullText = `${title} ${description}`;
    let salaryMin = null;
    let salaryMax = null;

    const extracted = extractSalaryFromText(fullText);
    if (extracted) {
        salaryMin = extracted.min;
        salaryMax = extracted.max;
    } else if (ai?.salaryMin && ai?.salaryMax) {
        salaryMin = ai.salaryMin;
        salaryMax = ai.salaryMax;
    } else {
        const bench = benchmarkSalary(category, experienceLevel);
        salaryMin = bench.min;
        salaryMax = bench.max;
    }

    return {
        title,
        company: { name: (job.company_name ?? 'Unknown').trim() },
        description,
        requiredSkills: skills,
        category,
        opportunityType: 'job',
        experienceLevel,
        location,
        stipendOrSalary: {
            min: salaryMin ?? 0,
            max: salaryMax ?? 0,
            currency: 'INR',
        },
        applicationLink: job.url ?? '',
        source: 'external',
        externalSource: 'findwork',
        externalId: String(job.id),
        isActive: true,
        lastSeenAt: new Date(),
    };
}
