const { GoogleGenAI } = require('@google/genai');
const InterviewSession = require('../models/InterviewSession');

const ai = new GoogleGenAI({ vertexai: false, apiKey: process.env.GEMINI_API_KEY });

const callGeminiWithRetry = async (prompt, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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

// @route  POST /api/interview/submit-session
const submitInterviewSession = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions and answers are required' });
    }

    // Use the exact 'questions' variable that came from the frontend
    const prompt = `
      You are an expert technical interviewer evaluating a candidate for an SDE role.
      Here are the questions asked and the candidate's transcribed audio answers:
      ${JSON.stringify(questions)}

      Evaluate their performance. Return the response ONLY as a valid JSON object with this exact structure (no markdown tags):
      {
        "overallScore": 85,
        "overallFeedback": "A 2-sentence summary of their performance.",
        "detailedAnalysis": [
          {
            "question": "The question asked",
            "userAnswer": "The candidate's exact answer",
            "critique": "What they did wrong or missed",
            "idealResponse": "How they SHOULD have answered it (what to say instead)",
            "score": 8
          }
        ]
      }
    `;

    let responseText = await callGeminiWithRetry(prompt);
    
    // Safely strip any markdown backticks if Gemini includes them
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const evaluationJSON = JSON.parse(responseText);

    // Save the newly structured data to MongoDB
    const session = await InterviewSession.create({
      user: req.user._id,
      overallScore: evaluationJSON.overallScore,
      overallFeedback: evaluationJSON.overallFeedback,
      detailedAnalysis: evaluationJSON.detailedAnalysis,
    });

    res.status(201).json({
      message: 'Interview session evaluated successfully',
      session: session // Sending the saved DB object back to the React UI
    });
  } catch (error) {
    console.error("🔥 SUBMIT SESSION CRASH:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/interview/history
const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Interview history fetched successfully',
      sessions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { submitInterviewSession, getInterviewHistory };