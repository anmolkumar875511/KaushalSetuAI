export const matchingPrompt = (userSkills, missingSkills) => `
You are a technical recruitment engine specialized in semantic skill matching.

CONTEXT:
User Skills: [${userSkills.join(', ')}]
Missing Job Skills: [${missingSkills.join(', ')}]

GOAL:
Check if any of the "Missing Job Skills" are semantically covered by the "User Skills".
Examples:
- "Tailwind CSS" covers "CSS Frameworks"
- "PostgreSQL" covers "Relational Databases"
- "React.js" covers "Frontend Libraries"

RULES:
1. If a missing skill is covered, move it to "newMatches".
2. If it is NOT covered, keep it in "stillMissing".
3. Return ONLY valid JSON. No explanations.

OUTPUT FORMAT:
{
  "newMatches": ["Skill Name"],
  "stillMissing": ["Skill Name"]
}
STRICT LIMIT: Return only the object. If you add any text before or after the JSON, the system will crash.
`;
