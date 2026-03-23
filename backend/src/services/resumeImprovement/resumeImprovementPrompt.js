export const generateResumeImprovementPrompt = (resume) => {
    const skills = resume.skills?.map((s) => `${s.name} (${s.level})`).join(', ') || 'None listed';
    const experience = resume.experience
        ?.map((e) => `${e.title} at ${e.company} (${e.startDate}–${e.endDate || 'Present'}): ${e.description || ''}`)
        .join('\n') || 'None listed';
    const education = resume.education
        ?.map((e) => `${e.degree} — ${e.institution} (${e.startYear}–${e.endYear || 'Present'})`)
        .join('\n') || 'None listed';
    const projects = resume.projects
        ?.map((p) => `${p.name}: ${p.description || ''} [${(p.technologies || []).join(', ')}]`)
        .join('\n') || 'None listed';
    const summary = resume.summary || 'No summary provided';

    return `
You are a senior technical recruiter and resume coach with 15+ years of experience.

Analyse the following resume data and provide specific, actionable improvement suggestions.

--- RESUME DATA ---
Name: ${resume.name || 'Not provided'}
Summary: ${summary}

Skills: ${skills}

Experience:
${experience}

Education:
${education}

Projects:
${projects}
--- END RESUME ---

Evaluate the resume across these 5 dimensions and return improvement tips for each:

1. **summary** — Is the summary compelling, specific, and role-targeted?
2. **skills** — Are skills well-organised? Are important skills missing or over/under-stated?
3. **experience** — Are descriptions achievement-oriented (STAR method)? Are impact metrics used?
4. **projects** — Are projects described with impact and technologies clearly? Do they demonstrate depth?
5. **overall** — ATS compatibility, formatting red flags, keyword optimisation, missing sections.

For each dimension, return:
- A short severity: "critical" | "warning" | "good"
- A score 0–10
- 2–4 specific, actionable tips (not generic advice)

Also return:
- overallScore (0–100): Weighted average of all dimension scores × 10
- topPriorities: The 3 most impactful changes to make right now (short, direct)
- atsKeywords: 6–8 high-value keywords missing from this resume that are in demand

Return ONLY valid JSON — no markdown, no extra text:

{
  "overallScore": <number 0-100>,
  "topPriorities": ["<priority 1>", "<priority 2>", "<priority 3>"],
  "atsKeywords": ["<keyword>", ...],
  "dimensions": {
    "summary": {
      "score": <0-10>,
      "severity": "critical|warning|good",
      "tips": ["<tip>", ...]
    },
    "skills": {
      "score": <0-10>,
      "severity": "critical|warning|good",
      "tips": ["<tip>", ...]
    },
    "experience": {
      "score": <0-10>,
      "severity": "critical|warning|good",
      "tips": ["<tip>", ...]
    },
    "projects": {
      "score": <0-10>,
      "severity": "critical|warning|good",
      "tips": ["<tip>", ...]
    },
    "overall": {
      "score": <0-10>,
      "severity": "critical|warning|good",
      "tips": ["<tip>", ...]
    }
  }
}
`;
};