export const jobReadinessPrompt = (resumeData, interest) => `
You are an AI career analyst.

Analyze the candidate resume and career interest.

Return ONLY valid JSON.
Do NOT include explanations.

JSON schema:
{
  "readinessScore": number,
  "strengths": ["string"],
  "missingSkills": ["string"],
  "recommendedSkills": ["string"],
  "recommendations": ["string"],
  "estimatedLearningTime": "string",
  "demandInsights": [
    {
      "skill": "string",
      "demandScore": number
    }
  ]
}

Candidate Interest:
${interest}

Resume Data:
${JSON.stringify(resumeData)}

Rules:
- readinessScore must be between 0 and 100
- missingSkills should reflect real industry gaps
- demandScore should represent job market demand
`;