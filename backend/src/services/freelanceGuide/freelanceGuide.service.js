import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { freelancePrompt } from './freelanceGuidePrompt.js';
import FreelanceGuide from '../../models/freelanceGuide.model.js';

export const generateFreelanceGuide = async (userId, interest) => {
    try {
        console.log('Generating freelance guide');

        const prompt = freelancePrompt(interest);
        const raw = await queryGemini(prompt);

        const parsed = safeJsonParse(raw);
        if (!parsed) throw new Error('Invalid JSON from AI');

        const guide = await FreelanceGuide.create({
            user: userId,
            interest,
            ...parsed
        });

        console.log('Freelance guide created');
        return guide;

    } catch (err) {
        console.error('Freelance guide generation failed:', err.message);
        return null;
    }
};