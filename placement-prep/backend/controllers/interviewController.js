const { GoogleGenAI } = require('@google/genai');
const Resume = require('../models/resume');
const User = require('../models/User'); // Added User model for saving scores
const calculateTopicScores = require('../utils/scoreCalculator');

const ai = new GoogleGenAI({ vertexai: false, apiKey: process.env.GEMINI_API_KEY });

const callGeminiWithRetry = async (prompt, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await ai.models.generateContent({
       model: 'gemini-flash-latest',
        contents: prompt,
      });
      return result.text;
    } catch (error) {
      const isRetryable = error.message.includes('UNAVAILABLE') || error.message.includes('RESOURCE_EXHAUSTED');
      if (isRetryable && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
  }
};

// 1. Generate Questions (Your existing code)
const generateInterviewQuestions = async (req, res) => {
  try {
    const codeforcesTopicCount = req.user.codeforcesStats?.topicCount || {};
    const leetcodeTopicCount = req.user.leetcodeStats?.topicCount || {};
    const combinedScores = calculateTopicScores(codeforcesTopicCount, leetcodeTopicCount);

    const latestResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const resumeText = latestResume ? latestResume.extractedText : 'No resume uploaded yet.';

    const prompt = `
You are conducting a mock SDE (Software Development Engineer) interview for a computer science student.

Here is the student's resume content:
${resumeText}

Here is the student's coding practice data (topic name : problems solved):
${JSON.stringify(combinedScores, null, 2)}

Generate exactly 12 interview questions for this student, mixing:
- 3 general/behavioral questions common in SDE interviews (e.g., "tell me about yourself", "why this company", handling conflict)
- 4 questions specifically about projects/experience mentioned in their resume
- 5 DSA (data structures & algorithms) questions, prioritizing topics with lower solved counts

Respond ONLY with valid JSON, no other text, in EXACTLY this structure:
{
  "questions": [
    {
      "questionNumber": 1,
      "type": "resume",
      "question": "The actual question text"
    }
  ]
}
Rules:
- "type" must be one of: "resume", "dsa", "behavioral"
- Questions should be realistic, specific, and conversational - as if a real interviewer is asking them out loud
- For DSA questions, phrase them as something askable verbally (not requiring code to be shown), like "How would you approach finding the shortest path in a graph with negative weights?"
- Do not include any text outside the JSON object - no markdown code fences.
`;

    let responseText = await callGeminiWithRetry(prompt);
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const questionsData = JSON.parse(responseText);

    res.status(200).json({
      message: 'Interview questions generated successfully',
      questions: questionsData.questions,
    });
  } catch (error) {
    console.error("🔥 BACKEND CRASH REASON (Generate):", error); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. NEW: Save Score and Update Rating (Codeforces Style)
const saveInterviewScore = async (req, res) => {
  try {
    const { finalScore } = req.body; // Ensure your frontend sends this out of 10
    const user = await User.findById(req.user._id);

    const currentRating = user.interviewRating || 1200;
    
    // Calculate the previous score average
    let previousAverage = 0;
    if (user.interviewHistory && user.interviewHistory.length > 0) {
      const totalScore = user.interviewHistory.reduce((sum, session) => sum + session.score, 0);
      previousAverage = totalScore / user.interviewHistory.length;
    } else {
      // Baseline for the very first interview (assuming scores are out of 10)
      previousAverage = 5; 
    }

    // Apply the custom rating formula
    let ratingChange = 0;
    
    if (finalScore >= previousAverage) {
      // Gained/Improved: (Current Score - Average Score) * 3
      ratingChange = Math.round((finalScore - previousAverage) * 3);
    } else {
      // Decreased/Worse: (Average Score - Current Score) * 2
      ratingChange = -Math.round((previousAverage - finalScore) * 2);
    }
    
    const newRating = currentRating + ratingChange;

    // Save to history array
    user.interviewHistory.push({
      score: finalScore,
      ratingChange: ratingChange,
      newRating: newRating,
      date: new Date()
    });

    user.interviewRating = newRating;
    await user.save();

    res.status(200).json({ 
      message: "Interview rated and saved successfully!", 
      newRating,
      ratingChange,
      history: user.interviewHistory 
    });

  } catch (error) {
    console.error("🔥 BACKEND CRASH REASON (Save Score):", error);
    res.status(500).json({ message: "Server error saving score.", error: error.message });
  }
};

// Export BOTH controllers
module.exports = { 
  generateInterviewQuestions, 
  saveInterviewScore 
};