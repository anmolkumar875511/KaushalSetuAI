import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import {
    generateInterviewQuestionsPrompt,
    evaluateAnswerPrompt,
    generateOverallFeedbackPrompt,
} from './interviewPrompts.js';


export const generateInterviewQuestions = async ({ jobRole, experienceLevel, focusAreas, totalQuestions }) => {
    const prompt = generateInterviewQuestionsPrompt({ jobRole, experienceLevel, focusAreas, totalQuestions });
    const response = await queryGemini(prompt);
    const parsed = safeJsonParse(response);

    if (!parsed?.questions?.length) {
        throw new Error('Failed to generate interview questions');
    }

    return parsed.questions.slice(0, totalQuestions);
};

export const evaluateSingleAnswer = async ({ question, userAnswer, jobRole, experienceLevel }) => {
    const prompt = evaluateAnswerPrompt({ question, userAnswer, jobRole, experienceLevel });
    const response = await queryGemini(prompt);
    const parsed = safeJsonParse(response);

    if (!parsed || typeof parsed.score !== 'number') {
        return {
            score: 0,
            feedback: 'Could not evaluate this answer automatically.',
            strengths: [],
            improvements: ['Please provide a more detailed answer.'],
            idealAnswer: null,
        };
    }

    return {
        score: Math.min(10, Math.max(0, parsed.score)),
        feedback: parsed.feedback || '',
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        idealAnswer: parsed.idealAnswer || null,
    };
};

export const generateOverallFeedback = async ({ jobRole, experienceLevel, answers }) => {
    const validScores = answers
        .map((a) => a.aiEvaluation?.score ?? 0)
        .filter((s) => typeof s === 'number');

    const avgRaw = validScores.reduce((sum, s) => sum + s, 0) / (validScores.length || 1);
    const overallScore = Math.round((avgRaw / 10) * 100);

    const prompt = generateOverallFeedbackPrompt({ jobRole, experienceLevel, answers });
    const response = await queryGemini(prompt);
    const parsed = safeJsonParse(response);

    return {
        overallScore,
        overallFeedback: parsed?.overallFeedback || 'Interview completed.',
        strengths: parsed?.strengths || [],
        areasToImprove: parsed?.areasToImprove || [],
    };
};