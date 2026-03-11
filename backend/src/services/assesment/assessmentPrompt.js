export const generateAssessmentPrompt = (topic) => `
You are an expert technical interviewer.

Generate an assessment for the topic: "${topic}".

Rules:
- Total questions: 10
- Difficulty distribution:
  - 3 easy
  - 4 medium
  - 3 hard
- Each question must have exactly 4 options.
- "correctAnswer" must exactly match one of the options.
- Questions should test real understanding of the topic.

Return ONLY valid JSON in the following format:

{
  "questions": [
    {
      "question": "string",
      "options": ["option1","option2","option3","option4"],
      "correctAnswer": "one option exactly from options",
      "level": "easy | medium | hard"
    }
  ]
}

Important:
- Do NOT include explanations.
- Do NOT include markdown.
- Return only JSON.
`;
