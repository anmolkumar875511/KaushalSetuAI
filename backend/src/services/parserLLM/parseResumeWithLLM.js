import { queryGroq } from '../../utils/groqClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { resumePrompt } from './resumePrompt.js';
import { normalizeResumeParsed } from '../../utils/normalizeResumeParsed.js';

export const parseResumeWithLLM = async (resumeText) => {
    try {
        console.log('Using Groq to parse resume');

        const prompt = resumePrompt(resumeText);
        const raw = await queryGroq(prompt);

        const parsed = safeJsonParse(raw);
        if (!parsed) throw new Error('Invalid JSON from Groq');

        const normalized = normalizeResumeParsed(parsed);

        console.log('Resume parsed & normalized with Groq');
        return normalized;
    } catch (err) {
        console.error('Groq parsing failed:', err.message);
        return null;
    }
};
