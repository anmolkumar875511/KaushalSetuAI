import { queryGemini }  from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { SKILL_PATTERNS, DOMAIN_SKILLS, EXPERIENCE_SIGNALS, SALARY_BENCHMARKS } from '../../utils/constants.js';

/* ─────────────────────────────────────────────
   RULE-BASED FALLBACKS
───────────────────────────────────────────── */

/**
 * extractSkillsRuleBased
 * Applies regex patterns from SKILL_PATTERNS to the description.
 * Deduplicates and lowercases all matches.
 */
export function extractSkillsRuleBased(description = '') {
    const found = new Set();
    for (const pattern of SKILL_PATTERNS) {
        const matches = description.matchAll(new RegExp(pattern.source, pattern.flags));
        for (const m of matches) {
            found.add(m[0].toLowerCase().trim());
        }
    }
    return [...found].slice(0, 20); // cap at 20
}

/**
 * inferExperienceLevel
 * Scans title + description against EXPERIENCE_SIGNALS patterns.
 * Returns 'advanced' | 'intermediate' | 'beginner'.
 */
export function inferExperienceLevel(title = '', description = '') {
    const text = `${title} ${description}`.toLowerCase();
    for (const [level, patterns] of Object.entries(EXPERIENCE_SIGNALS)) {
        if (patterns.some((p) => p.test(text))) return level;
    }
    return 'beginner';
}

/**
 * extractSalaryFromText
 * Tries to pull explicit salary figures from the job text.
 * Handles patterns like: "$120k", "120,000 USD", "£80k - £100k", "INR 15LPA"
 * Returns { min, max, currency } or null.
 */
export function extractSalaryFromText(text = '') {
    // USD/GBP/EUR explicit figures
    const currencyMap = { '$': 'USD', '£': 'GBP', '€': 'EUR', '₹': 'INR' };

    const patterns = [
        // $80k – $120k  |  $80,000 – $120,000
        /([£$€₹])\s*(\d[\d,]*\.?\d*)\s*[kK]?\s*[-–to]+\s*([£$€₹])?\s*(\d[\d,]*\.?\d*)\s*[kK]?/,
        // Up to $120k
        /up\s*to\s*([£$€₹])\s*(\d[\d,]*\.?\d*)\s*[kK]?/i,
        // 15 LPA  |  15–25 LPA
        /(\d+\.?\d*)\s*[-–to]*\s*(\d+\.?\d*)?\s*lpa/i,
        // competitive / negotiable — skip
    ];

    // LPA pattern (Indian)
    const lpaMatch = text.match(/(\d+\.?\d*)\s*[-–to]+\s*(\d+\.?\d*)\s*lpa/i);
    if (lpaMatch) {
        return {
            min:      Math.round(parseFloat(lpaMatch[1]) * 100000),
            max:      Math.round(parseFloat(lpaMatch[2]) * 100000),
            currency: 'INR',
        };
    }
    const lpaSingle = text.match(/(\d+\.?\d*)\s*lpa/i);
    if (lpaSingle) {
        const v = parseFloat(lpaSingle[1]) * 100000;
        return { min: Math.round(v * 0.85), max: Math.round(v * 1.15), currency: 'INR' };
    }

    // Currency + range pattern
    const rangeMatch = text.match(/([£$€₹])\s*(\d[\d,]*\.?\d*)\s*[kK]?\s*[-–to]+\s*(?:[£$€₹])?\s*(\d[\d,]*\.?\d*)\s*[kK]?/);
    if (rangeMatch) {
        const symbol   = rangeMatch[1];
        const currency = currencyMap[symbol] ?? 'USD';
        const mult     = rangeMatch[0].toLowerCase().includes('k') ? 1000 : 1;
        const min      = parseFloat(rangeMatch[2].replace(/,/g, '')) * mult;
        const max      = parseFloat(rangeMatch[3].replace(/,/g, '')) * mult;
        // Convert to INR
        const rates    = { USD: 83, GBP: 105, EUR: 90, INR: 1 };
        const rate     = rates[currency] ?? 83;
        return { min: Math.round(min * rate), max: Math.round(max * rate), currency: 'INR' };
    }

    return null;
}

/**
 * benchmarkSalary
 * Returns the salary benchmark for a category + experience level from constants.
 */
export function benchmarkSalary(category = 'other', experienceLevel = 'beginner') {
    const benchmarks = SALARY_BENCHMARKS[category] ?? SALARY_BENCHMARKS.other;
    return benchmarks[experienceLevel] ?? benchmarks.beginner;
}

/* ─────────────────────────────────────────────
   AI ENRICHMENT  (Gemini)
───────────────────────────────────────────── */



/* ─────────────────────────────────────────────
   Rate-limit state
   Simple in-process token bucket to stay within Gemini free tier:
   10 requests/minute → 1 request per 6 seconds minimum.
───────────────────────────────────────────── */
const GEMINI_RPM           = 10;         // free tier requests per minute
const MIN_INTERVAL_MS      = Math.ceil((60 / GEMINI_RPM) * 1000); // 6 000 ms
const MAX_RETRIES          = 3;
const BACKOFF_BASE_MS      = 20_000;     // start at 20s, Gemini suggests 16s+

let _lastGeminiCallAt = 0;

const waitForGeminiSlot = async () => {
    const now     = Date.now();
    const elapsed = now - _lastGeminiCallAt;
    if (elapsed < MIN_INTERVAL_MS) {
        await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
    }
    _lastGeminiCallAt = Date.now();
};

/**
 * enrichJobWithAI
 *
 * Calls Gemini to extract skills, experience level, and salary estimates.
 * Respects the free-tier 10 RPM limit with a token-bucket style throttle.
 * On 429 responses, backs off exponentially and retries up to MAX_RETRIES times.
 * Returns null if all retries fail — caller transparently falls back to rule-based.
 */
export async function enrichJobWithAI(title, description) {
    const prompt = ENRICHMENT_PROMPT(title, description);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await waitForGeminiSlot();

            const raw    = await queryGemini(prompt);
            const parsed = safeJsonParse(raw);

            if (!parsed || typeof parsed !== 'object') return null;

            return {
                skills:          Array.isArray(parsed.skills) ? parsed.skills.slice(0, 15) : null,
                experienceLevel: ['beginner','intermediate','advanced'].includes(parsed.experienceLevel)
                    ? parsed.experienceLevel
                    : null,
                salaryMin: typeof parsed.salaryMin === 'number' ? parsed.salaryMin : null,
                salaryMax: typeof parsed.salaryMax === 'number' ? parsed.salaryMax : null,
            };

        } catch (err) {
            const is429 = err?.message?.includes('429') || err?.status === 429;

            if (is429 && attempt < MAX_RETRIES) {
                // Parse retryDelay from error if available, else use exponential backoff
                const retryMatch = err.message?.match(/retry.*?(\d+)s/i);
                const retryAfterS = retryMatch ? parseInt(retryMatch[1], 10) : 0;
                const backoffMs   = retryAfterS > 0
                    ? retryAfterS * 1000 + 2000          // honour Gemini's suggestion + 2s buffer
                    : BACKOFF_BASE_MS * attempt;          // exponential: 20s, 40s

                console.warn(`[Enricher] 429 rate limit hit — waiting ${Math.round(backoffMs / 1000)}s before retry ${attempt + 1}/${MAX_RETRIES}`);
                await new Promise((r) => setTimeout(r, backoffMs));
                _lastGeminiCallAt = 0; // reset slot tracker after a long wait
                continue;
            }

            // Non-429 errors or final attempt — give up, use rule-based
            if (!is429) console.warn('[Enricher] AI enrichment failed:', err.message);
            return null;
        }
    }

    return null;
}