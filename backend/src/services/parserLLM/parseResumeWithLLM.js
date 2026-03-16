import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { resumePrompt } from './resumePrompt.js';
import { normalizeResumeParsed } from '../../utils/normalizeResumeParsed.js';

const MAX_RETRIES = 2;

export const parseResumeWithLLM = async (resumeText) => {
    const prompt = resumePrompt(resumeText);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[ResumeParser] AI parse attempt ${attempt}/${MAX_RETRIES}`);

            const raw = await queryGemini(prompt);
            const parsed = safeJsonParse(raw);

            if (!parsed || typeof parsed !== 'object') {
                throw new Error(
                    `safeJsonParse returned ${parsed === null ? 'null' : typeof parsed}`
                );
            }

            const normalized = normalizeResumeParsed(parsed, 'ai');

            const hasContent =
                normalized.skills.length > 0 ||
                normalized.categories.length > 0 ||
                normalized.experience.length > 0;

            if (!hasContent) {
                throw new Error(
                    'Normalized result is empty — likely a parse or extraction failure'
                );
            }

            console.log(
                `[ResumeParser] AI parse succeeded — ` +
                    `${normalized.skills.length} skills, ` +
                    `${normalized.categories.length} categories, ` +
                    `${normalized.experience.length} experience entries`
            );

            return normalized;
        } catch (err) {
            console.warn(`[ResumeParser] Attempt ${attempt} failed: ${err.message}`);
            if (attempt === MAX_RETRIES) {
                console.error(
                    '[ResumeParser] All AI parse attempts exhausted — falling back to rule-based'
                );
                return null;
            }
        }
    }

    return null;
};
