export const resumePrompt = (text) => `
You are a resume parsing engine.

Return ONLY valid JSON.
Do NOT add explanations or comments.

IMPORTANT:
- Categories MUST be selected ONLY from this list:
  tech, medical, law, finance, education
- Do NOT invent new category names
- If unsure, return an empty categories array

JSON schema:
{
  "categories": [
    { "name": "tech | medical | law | finance | education | design | management | other", "confidence": number, "source": "ai_inferred" }
  ],
  "skills": [
    { "name": "string", "level": "beginner | intermediate | advanced", "confidence": number, "source": "resume | ai_inferred" }
  ],
  "experience": [
    { "role": "string", "company": "string", "durationMonths": number }
  ],
  "education": [
    { "degree": "string", "institute": "string", "year": number }
  ],
  "projects": [
    { "title": "string", "description": "string" }
  ]
}

Resume text:
"""
${text}
"""
`;
