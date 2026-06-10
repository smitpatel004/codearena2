/**
 * Gemini AI Service
 * Sends coding stats to Google Gemini API for AI analysis
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const analyzeProfile = async (stats) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert competitive programming coach. Analyze the following coding profile and provide detailed, actionable feedback.

## Coding Profile Stats:

**LeetCode:**
- Total Solved: ${stats.leetcode?.totalSolved || 0}
- Easy: ${stats.leetcode?.easySolved || 0}
- Medium: ${stats.leetcode?.mediumSolved || 0}
- Hard: ${stats.leetcode?.hardSolved || 0}
- Contest Rating: ${stats.leetcode?.contestRating || 0}

**Codeforces:**
- Current Rating: ${stats.codeforces?.currentRating || 0}
- Max Rating: ${stats.codeforces?.maxRating || 0}
- Rank: ${stats.codeforces?.rank || 'unrated'}

**CodeChef:**
- Current Rating: ${stats.codechef?.currentRating || 0}
- Stars: ${stats.codechef?.stars || '0★'}

**Overall Skill Score:** ${stats.skillScore || 0}/100

Please respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"],
  "recommendedTopics": ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"],
  "summary": "A 2-3 sentence overall assessment of the coder's profile and potential.",
  "nextMilestone": "Specific next goal to achieve"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Gemini API error: ${error.message}`);
  }
};

module.exports = { analyzeProfile };
