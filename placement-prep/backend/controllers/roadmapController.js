const { GoogleGenAI } = require('@google/genai');
const Roadmap = require('../models/Roadmap');
const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');
const calculateTopicScores = require('../utils/scoreCalculator');

const ai = new GoogleGenAI({ vertexai: false, apiKey: process.env.GEMINI_API_KEY });

const generateRoadmap = async (req, res) => {
  try {
    // 1. Grab the dynamic 'weeks' variable from the frontend (default to 4 if missing)
    const { weeks = 4 } = req.body; 

    // Gather user stats
    const codeforcesTopicCount = req.user.codeforcesStats?.topicCount || {};
    const leetcodeTopicCount = req.user.leetcodeStats?.topicCount || {};
    const combinedScores = calculateTopicScores(codeforcesTopicCount, leetcodeTopicCount);

    const latestResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const resumeText = latestResume ? latestResume.extractedText : 'No resume uploaded yet.';

    const latestInterview = await InterviewSession.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const interviewFeedback = latestInterview && latestInterview.overallFeedback
      ? latestInterview.overallFeedback
      : 'No mock interview completed yet. Focus on baseline skills.';

    // 2. Build a dynamic JSON structure string based on the number of weeks
    let expectedJsonStructure = "{\n";
    for(let i = 1; i <= weeks; i++) {
      expectedJsonStructure += `  "week${i}": { "theme": "String", "focusAreas": ["String"], "actionItems": ["String"] }${i === weeks ? '' : ','}\n`;
    }
    expectedJsonStructure += "}";

    // 3. The Dynamic Prompt
    const prompt = `
You are a placement preparation mentor for a computer science student preparing for SDE job interviews.

Coding practice data:
${JSON.stringify(combinedScores, null, 2)}

Resume content:
${resumeText}

Recent Mock Interview Feedback:
${interviewFeedback}

Generate a personalized ${weeks}-week study roadmap to help this student prepare for placements. 
- Prioritize topics where the solved count is lower.
- Explicitly dedicate time to fix weaknesses mentioned in the interview feedback.

Return the response ONLY as a valid JSON object with EXACTLY ${weeks} keys (week1 to week${weeks}). Do not include markdown formatting like \`\`\`json.
Structure expected:
${expectedJsonStructure}
`;

    // Call Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.7 }
    });

    let rawText = result.text;
    
    // CRITICAL FIX: Clean up markdown so JSON.parse doesn't crash the server
    rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const roadmapJSON = JSON.parse(rawText);

    // Save to database
    const roadmap = await Roadmap.create({
      user: req.user._id,
      content: JSON.stringify(roadmapJSON), 
    });

    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap: {
        id: roadmap._id,
        content: roadmapJSON, 
      },
    });
  } catch (error) {
    console.error("🔥 ROADMAP CRASH:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { generateRoadmap };