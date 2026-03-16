import { ENRICHMENT_PROMPT } from './jobEnricherPrompt.js';
import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import {
    SKILL_PATTERNS,
    DOMAIN_SKILLS,
    EXPERIENCE_SIGNALS,
    SALARY_BENCHMARKS,
} from '../../utils/constants.js';

export function extractSkillsRuleBased(description = '') {
    const found = new Set();
    for (const pattern of SKILL_PATTERNS) {
        const matches = description.matchAll(new RegExp(pattern.source, pattern.flags));
        for (const m of matches) {
            found.add(m[0].toLowerCase().trim());
        }
    }
    return [...found].slice(0, 20);
}

export function inferExperienceLevel(title = '', description = '') {
    const text = `${title} ${description}`.toLowerCase();
    for (const [level, patterns] of Object.entries(EXPERIENCE_SIGNALS)) {
        if (patterns.some((p) => p.test(text))) return level;
    }
    return 'beginner';
}

export function extractSalaryFromText(text = '') {
    const currencyMap = { $: 'USD', '£': 'GBP', '€': 'EUR', '₹': 'INR' };

    const patterns = [
        /([£$€₹])\s*(\d[\d,]*\.?\d*)\s*[kK]?\s*[-–to]+\s*([£$€₹])?\s*(\d[\d,]*\.?\d*)\s*[kK]?/,
        /up\s*to\s*([£$€₹])\s*(\d[\d,]*\.?\d*)\s*[kK]?/i,
        /(\d+\.?\d*)\s*[-–to]*\s*(\d+\.?\d*)?\s*lpa/i,
    ];

    const lpaMatch = text.match(/(\d+\.?\d*)\s*[-–to]+\s*(\d+\.?\d*)\s*lpa/i);
    if (lpaMatch) {
        return {
            min: Math.round(parseFloat(lpaMatch[1]) * 100000),
            max: Math.round(parseFloat(lpaMatch[2]) * 100000),
            currency: 'INR',
        };
    }
    const lpaSingle = text.match(/(\d+\.?\d*)\s*lpa/i);
    if (lpaSingle) {
        const v = parseFloat(lpaSingle[1]) * 100000;
        return { min: Math.round(v * 0.85), max: Math.round(v * 1.15), currency: 'INR' };
    }

    const rangeMatch = text.match(
        /([£$€₹])\s*(\d[\d,]*\.?\d*)\s*[kK]?\s*[-–to]+\s*(?:[£$€₹])?\s*(\d[\d,]*\.?\d*)\s*[kK]?/
    );
    if (rangeMatch) {
        const symbol = rangeMatch[1];
        const currency = currencyMap[symbol] ?? 'USD';
        const mult = rangeMatch[0].toLowerCase().includes('k') ? 1000 : 1;
        const min = parseFloat(rangeMatch[2].replace(/,/g, '')) * mult;
        const max = parseFloat(rangeMatch[3].replace(/,/g, '')) * mult;
        const rates = { USD: 83, GBP: 105, EUR: 90, INR: 1 };
        const rate = rates[currency] ?? 83;
        return { min: Math.round(min * rate), max: Math.round(max * rate), currency: 'INR' };
    }

    return null;
}

export function benchmarkSalary(category = 'other', experienceLevel = 'beginner') {
    const benchmarks = SALARY_BENCHMARKS[category] ?? SALARY_BENCHMARKS.other;
    return benchmarks[experienceLevel] ?? benchmarks.beginner;
}

export async function enrichJobWithAI(title, description) {
    try {
        const raw = await queryGemini(ENRICHMENT_PROMPT(title, description));
        const parsed = safeJsonParse(raw);

        if (!parsed || typeof parsed !== 'object') return null;

        return {
            skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 15) : null,
            experienceLevel: ['beginner', 'intermediate', 'advanced'].includes(
                parsed.experienceLevel
            )
                ? parsed.experienceLevel
                : null,
            salaryMin: typeof parsed.salaryMin === 'number' ? parsed.salaryMin : null,
            salaryMax: typeof parsed.salaryMax === 'number' ? parsed.salaryMax : null,
        };
    } catch (err) {
        console.warn('[Enricher] AI enrichment failed:', err.message);
        return null;
    }
}
