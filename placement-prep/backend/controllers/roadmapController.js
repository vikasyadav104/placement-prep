const { GoogleGenAI } = require('@google/genai');
const Roadmap = require('../models/Roadmap');
const Resume = require('../models/Resume');
const calculateTopicScores = require('../utils/scoreCalculator');

const ai = new GoogleGenAI({ vertexai: false, apiKey: process.env.GEMINI_API_KEY });

const generateRoadmap = async (req, res) => {
  try {
    // Gather data we already have
    const codeforcesTopicCount = req.user.codeforcesStats?.topicCount || {};
    const leetcodeTopicCount = req.user.leetcodeStats?.topicCount || {};
    const combinedScores = calculateTopicScores(codeforcesTopicCount, leetcodeTopicCount);

    // Get the user's latest uploaded resume (if any)
    const latestResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const resumeText = latestResume ? latestResume.extractedText : 'No resume uploaded yet.';

    // Build the prompt
    const prompt = `
You are a placement preparation mentor for a computer science student preparing for SDE (Software Development Engineer) job interviews.

Here is the student's coding practice data (topic name : number of problems solved across LeetCode and Codeforces combined):
${JSON.stringify(combinedScores, null, 2)}

Here is the student's resume content:
${resumeText}

Based on this information, generate a personalized 4-week study roadmap to help this student prepare for SDE placements. 
- Prioritize topics where the solved count is lower, but phrase it encouragingly (e.g., "build more practice in X") rather than saying the student is "weak" at anything.
- Include a mix of DSA topics, and if the resume seems to lack certain skills (e.g., system design, projects), mention that too.
- Structure the roadmap week by week, with specific focus areas and suggested daily practice.
- Keep the tone motivating and practical, not generic.
`;

    // Call Gemini
const result = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
});
const roadmapText = result.text;
    // Save to database
    const roadmap = await Roadmap.create({
      user: req.user._id,
      content: roadmapText,
    });

    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap: {
        id: roadmap._id,
        content: roadmap.content,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { generateRoadmap };