import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { resumePrompt } from './resumePrompt.js';
import { normalizeResumeParsed } from '../../utils/normalizeResumeParsed.js';

export const parseResumeWithLLM = async (resumeText) => {
    try {
        console.log('Using AI to parse resume');

        const prompt = resumePrompt(resumeText);
        const raw = await queryGemini(prompt);

        const parsed = safeJsonParse(raw);
        if (!parsed) throw new Error('Invalid JSON from AI');

        const normalized = normalizeResumeParsed(parsed);

        console.log('Resume parsed & normalized with AI');
        return normalized;
    } catch (err) {
        console.error('AI parsing failed:', err.message);
        return null;
    }
};
