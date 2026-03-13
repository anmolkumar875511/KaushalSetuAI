import { generateAssessmentPrompt } from './assessmentPrompt.js';
import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';

export const generateAssessmentQuestions = async (topic) => {
    try {
        const prompt = generateAssessmentPrompt(topic);

        const response = await queryGemini(prompt);

        const parsed = safeJsonParse(response);

        if (!parsed || !parsed.questions || parsed.questions.length === 0) {
            throw new Error('Failed to generate questions');
        }

        return parsed.questions;
    } catch (error) {
        console.error('Question generation error:', error);
        throw error;
    }
};
