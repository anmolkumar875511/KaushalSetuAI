import { generateAssessmentPrompt } from './assessmentPrompt.js';
import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';

export const generateAssessmentQuestions = async (topic) => {
    try {
        const prompt = generateAssessmentPrompt(topic);

        const response = await queryGemini(prompt);

        const text = response.response.text();

        const parsed = safeJsonParse(text);

        if (!parsed || !parsed.questions) {
            throw new Error('Failed to generate assessment questions');
        }

        return parsed.questions;
    } catch (error) {}
};
