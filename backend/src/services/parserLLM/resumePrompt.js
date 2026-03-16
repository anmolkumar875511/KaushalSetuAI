/**
 * resumePrompt
 *
 * Instructs Gemini to extract structured data from resume text.
 * Returns a prompt string that expects ONLY a valid JSON response.
 */
export const resumePrompt = (text) => `
You are a precise resume parsing engine. Your only job is to extract structured data from the resume text below.

Return ONLY valid JSON — no markdown fences, no explanations, no comments.

━━━ RULES ━━━

categories:
- Pick ALL that apply from this exact list: tech, medical, law, finance, education, design, management, government, other
- Each entry needs a confidence score (0.0–1.0)
- Source is always "ai_inferred"

skills:
- Extract every technical and professional skill mentioned or clearly implied
- Normalize names: lowercase, prefer full forms ("react.js" over "react", "node.js" over "node")
- Level inference: "beginner" if listed without context, "intermediate" if used in projects, "advanced" if described as expert/lead/senior-level
- Source: "resume" if explicitly mentioned, "ai_inferred" if implied by role/project context
- Confidence: 1.0 for explicitly mentioned, 0.7–0.9 for inferred

experience:
- Extract all work/internship entries
- durationMonths: calculate from start/end dates if present (e.g. "Jan 2022 – Mar 2024" = 26 months)
  If only year ranges: use 12 months per year
  If "present" or "current": use today's date for calculation
  If no dates at all: set to null

education:
- year: graduation year as a 4-digit integer (e.g. 2023), null if unknown

projects:
- Only include projects with a clear title
- description: 1–2 sentence summary

━━━ JSON SCHEMA ━━━
{
  "categories": [
    { "name": "tech|medical|law|finance|education|design|management|government|other", "confidence": 0.0–1.0, "source": "ai_inferred" }
  ],
  "skills": [
    { "name": "string", "level": "beginner|intermediate|advanced", "confidence": 0.0–1.0, "source": "resume|ai_inferred" }
  ],
  "experience": [
    { "role": "string", "company": "string", "durationMonths": number|null }
  ],
  "education": [
    { "degree": "string", "institute": "string", "year": number|null }
  ],
  "projects": [
    { "title": "string", "description": "string" }
  ]
}

━━━ RESUME TEXT ━━━
"""
${text.slice(0, 6000)}
"""
`;
