export const ENRICHMENT_PROMPT = (title, description) => `
You are a job data enrichment engine. Given the job title and description below,
extract structured data and return ONLY a valid JSON object — no markdown, no explanation.

Job Title: ${title}
Description: ${description.slice(0, 3000)}

Return this exact JSON structure:
{
  "skills": ["skill1", "skill2", ...],        // up to 15 specific technical/professional skills required
  "experienceLevel": "beginner|intermediate|advanced",
  "salaryMin": <number or null>,              // estimated annual salary in INR (null if unknown)
  "salaryMax": <number or null>
}

Rules:
- skills: lowercase, specific (prefer "react.js" over "react", "node.js" over "node")
- experienceLevel: infer from years mentioned, seniority keywords, and complexity of role
- salary: estimate in INR based on role seniority and market rates; use null if impossible to estimate
`;
