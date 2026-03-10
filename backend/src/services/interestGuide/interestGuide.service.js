import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { interestGuidePrompt } from './interestGuidePrompt.js';
import InterestGuide from '../../models/interestGuide.model.js';

export const generateInterestGuide = async (userId, interest) => {
    try {
        console.log('Generating interest roadmap');

        const prompt = interestGuidePrompt(interest);
        const raw = await queryGemini(prompt);

        const parsed = safeJsonParse(raw);
        if (!parsed) throw new Error('Invalid JSON from AI');

        const guide = await InterestGuide.create({
            user: userId,
            interest,
            ...parsed,
        });

        console.log('Interest guide created');
        return guide;
    } catch (err) {
        console.error('Interest guide generation failed:', err.message);
        return null;
    }
};
