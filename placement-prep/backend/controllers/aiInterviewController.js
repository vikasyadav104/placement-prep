const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateInterviewRoadmap = async (req, res) => {
  try {
    const { interviewData, weeks } = req.body;
    const userProfile = await User.findById(req.user.id).select('resumeText skills projectDescription');

    const prompt = `
      You are a Technical Interview Coach. Analyze these interview failures and resume projects.
      INTERVIEW WEAKNESSES: ${JSON.stringify(interviewData.detailedAnalysis.filter(i => i.score < 7))}
      RESUME: ${userProfile.skills?.join(', ')} | Projects: ${userProfile.projectDescription}
      
      Generate a ${weeks || 4}-week roadmap as JSON (no markdown):
      { "title": "Recovery Plan", "weeks": [{ "weekTitle": "Week 1", "theme": "...", "focusAreas": [], "actionItems": [] }] }
    `;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    const roadmapJSON = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
    
    res.status(200).json({ roadmap: roadmapJSON });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "Failed to generate roadmap." });
  }
};

module.exports = { generateInterviewRoadmap };