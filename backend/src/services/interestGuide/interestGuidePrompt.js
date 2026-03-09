export const interestGuidePrompt = (interest) => `
You are an expert career mentor.

Create a learning roadmap for someone interested in:
${interest}

Return ONLY valid JSON.

JSON schema:
{
  "description": "string",
  "estimatedDuration": "string",
  "roadmap": [
    {
      "level": "Beginner",
      "skills": ["string"],
      "projects": ["string"],
      "resources": [
        {
          "title": "string",
          "url": "string"
        }
      ]
    },
    {
      "level": "Intermediate",
      "skills": [],
      "projects": [],
      "resources": []
    },
    {
      "level": "Advanced",
      "skills": [],
      "projects": [],
      "resources": []
    }
  ]
}
`;