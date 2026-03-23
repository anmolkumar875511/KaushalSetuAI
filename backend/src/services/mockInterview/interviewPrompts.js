export const generateInterviewQuestionsPrompt = ({
    jobRole,
    experienceLevel,
    focusAreas,
    totalQuestions,
}) => {
    const focusStr = focusAreas?.length ? `Focus heavily on: ${focusAreas.join(', ')}.` : '';

    return `
You are a senior technical interviewer at a top tech company.

Generate ${totalQuestions} interview questions for a ${experienceLevel}-level ${jobRole} position.
${focusStr}

Mix the questions across these categories (choose proportionally):
- Technical / coding concepts
- System design (skip for fresher level)
- Behavioral / situational
- Problem-solving

Rules:
- Questions should be open-ended (not MCQ)
- Each question should require a 2–5 sentence answer minimum
- Vary difficulty: ~30% medium, ~50% medium-hard, ~20% hard
- Make questions feel realistic and specific to the role

Return ONLY valid JSON:
{
  "questions": [
    "Question text here?",
    "Question text here?"
  ]
}

Do NOT include explanations, markdown, or any text outside the JSON.
`;
};

export const evaluateAnswerPrompt = ({ question, userAnswer, jobRole, experienceLevel }) => `
You are an expert technical interviewer evaluating a candidate's interview response.

Role: ${jobRole} (${experienceLevel} level)
Question: "${question}"
Candidate's Answer: "${userAnswer || '(No answer provided)'}"

Evaluate the answer fairly and constructively.

Return ONLY valid JSON:
{
  "score": <integer 0–10>,
  "feedback": "<2–3 sentence overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "idealAnswer": "<a concise ideal answer in 3–5 sentences>"
}

Scoring guide:
- 0–3: Poor / Off-topic / Missing
- 4–5: Partial / Superficial
- 6–7: Decent / Correct but lacks depth
- 8–9: Strong / Thorough
- 10: Exceptional / Near-perfect

Be strict but fair. If the answer is empty or irrelevant, score 0–2.
Do NOT include markdown or any text outside the JSON.
`;

export const generateOverallFeedbackPrompt = ({ jobRole, experienceLevel, answers }) => {
    const qa = answers
        .map(
            (a, i) =>
                `Q${i + 1}: ${a.question}\nScore: ${a.aiEvaluation?.score ?? 0}/10\nAnswer: ${a.userAnswer || '(blank)'}`
        )
        .join('\n\n');

    return `
You are a senior hiring manager reviewing a completed mock interview.

Role: ${jobRole} (${experienceLevel} level)

Interview Summary:
${qa}

Provide a holistic assessment of this candidate.

Return ONLY valid JSON:
{
  "overallFeedback": "<3–4 sentence summary of performance>",
  "strengths": ["<top strength 1>", "<top strength 2>", "<top strength 3>"],
  "areasToImprove": ["<area 1>", "<area 2>", "<area 3>"]
}

Be specific, actionable, and encouraging. Do NOT include markdown or text outside the JSON.
`;
};
