const { GoogleGenAI } = require('@google/genai');
const Resume = require('../models/Resume');
const calculateTopicScores = require('../utils/scoreCalculator');

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { generateInterviewQuestions };