export const roadmapPrompt = (missingSkills, jobTitle, category, currentSkills = []) => `
You are an expert mentor in ${category} helping a candidate become job-ready.

Candidate Profile:
Target Role: ${jobTitle}
Current Skills: ${currentSkills.join(', ') || "Unknown"}
Missing Skills: ${missingSkills.join(', ')}

Your task:
Create a **4-week practical learning roadmap** focused on helping the candidate learn the missing skills required for the role.

Rules:
1. Each week must focus on **one or more missing skills**.
2. Tasks must be **actionable and practical**, not vague theory.
3. Include **hands-on tasks** like building small features or mini-projects.
4. Provide **only reliable learning resources** from:
   - YouTube
   - FreeCodeCamp
   - Official documentation
   - GitHub repositories
5. If a direct URL is uncertain, return a **YouTube search link** instead.
6. Each week should contain **3–5 tasks**.

Return STRICT JSON ONLY in this exact format:

[
  {
    "week": 1,
    "topic": "Skill or Concept Focus",
    "skillsCovered": ["skill1", "skill2"],
    "tasks": [
      "Task description 1",
      "Task description 2",
      "Task description 3"
    ],
    "resources": [
      {
        "title": "Resource Title",
        "url": "https://www.youtube.com/results?search_query=search+keywords"
      }
    ]
  }
]

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT include explanations, markdown, or text outside the JSON.
- Do NOT invent random websites.
- Prefer YouTube search links if unsure of a specific URL.

If you violate these rules the system will fail.
`;