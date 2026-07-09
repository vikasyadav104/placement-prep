const { GoogleGenAI } = require('@google/genai');
const Roadmap = require('../models/Roadmap');
const Resume = require('../models/Resume');
// 1. ADD THIS IMPORT (Adjust the path if your model is named differently)
const InterviewSession = require('../models/InterviewSession'); 
const calculateTopicScores = require('../utils/scoreCalculator');

const ai = new GoogleGenAI({ vertexai: false, apiKey: process.env.GEMINI_API_KEY });

const generateRoadmap = async (req, res) => {
  try {
    // Gather data we already have
    const codeforcesTopicCount = req.user.codeforcesStats?.topicCount || {};
    const leetcodeTopicCount = req.user.leetcodeStats?.topicCount || {};
    const combinedScores = calculateTopicScores(codeforcesTopicCount, leetcodeTopicCount);

    // Get the user's latest uploaded resume
    const latestResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const resumeText = latestResume ? latestResume.extractedText : 'No resume uploaded yet.';

    // 2. GET THE LATEST INTERVIEW FEEDBACK
    const latestInterview = await InterviewSession.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const interviewFeedback = latestInterview && latestInterview.overallFeedback
      ? latestInterview.overallFeedback
      : 'No mock interview completed yet. Focus on baseline skills.';

    // 3. BUILD THE PROMPT (Updated for JSON and Interview Feedback)
    const prompt = `
You are a placement preparation mentor for a computer science student preparing for SDE (Software Development Engineer) job interviews.

Here is the student's coding practice data (topic name : number of problems solved across LeetCode and Codeforces combined):
${JSON.stringify(combinedScores, null, 2)}

Here is the student's resume content:
${resumeText}

Here is the feedback from their most recent AI Mock Interview:
${interviewFeedback}

Based on this information, generate a personalized 4-week study roadmap to help this student prepare for SDE placements. 
- Prioritize topics where the solved count is lower, but phrase it encouragingly.
- Explicitly dedicate time to fix the specific weaknesses mentioned in the mock interview feedback.
- Include a mix of DSA topics, and if the resume seems to lack certain skills (e.g., system design, projects), mention that too.

Return the response ONLY as a valid JSON object with the following exact structure. Do not include markdown formatting like \`\`\`json.
{
  "week1": { "theme": "String", "focusAreas": ["String", "String"], "actionItems": ["String", "String"] },
  "week2": { "theme": "String", "focusAreas": ["String", "String"], "actionItems": ["String", "String"] },
  "week3": { "theme": "String", "focusAreas": ["String", "String"], "actionItems": ["String", "String"] },
  "week4": { "theme": "String", "focusAreas": ["String", "String"], "actionItems": ["String", "String"] }
}
`;

    // Call Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7, // Helps keep JSON formatting consistent
      }
    });

    let rawText = result.text;
    
    // Clean up the text in case Gemini wraps it in markdown code blocks
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse the JSON
    const roadmapJSON = JSON.parse(rawText);

    // Save to database (we use JSON.stringify so it doesn't break your existing String schema)
    const roadmap = await Roadmap.create({
      user: req.user._id,
      content: JSON.stringify(roadmapJSON), 
    });

    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap: {
        id: roadmap._id,
        content: roadmapJSON, // Sent to frontend as a true JSON object for easy mapping
      },
    });
  } catch (error) {
    console.error("🔥 ROADMAP CRASH:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { generateRoadmap };