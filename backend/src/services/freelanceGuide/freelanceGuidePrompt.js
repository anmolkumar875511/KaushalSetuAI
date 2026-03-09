export const freelancePrompt = (interest) => `
You are a freelancing expert.

Create a freelancing guide for someone with skills in:
${interest}

Return ONLY valid JSON.

JSON schema:
{
  "platforms": [
    {
      "name": "string",
      "url": "string"
    }
  ],
  "servicesToOffer": ["string"],
  "portfolioProjects": ["string"],
  "pricingStrategy": [
    {
      "level": "Beginner | Intermediate | Advanced",
      "priceRange": "string"
    }
  ],
  "tips": ["string"]
}
`;