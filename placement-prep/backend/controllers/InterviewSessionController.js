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
    // Expected format: [{ question, type, userAnswerTranscript, timeTakenSeconds }, ...]

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions and answers are required' });
    }

    // Build a prompt with the full interview transcript
    const transcriptText = questions
      .map((q, i) => `Q${i + 1} (${q.type}): ${q.question}\nAnswer: ${q.userAnswerTranscript}\nTime taken: ${q.timeTakenSeconds} seconds`)
      .join('\n\n');

    const prompt = `
You are an experienced SDE interview coach reviewing a mock interview transcript.

Here is the full transcript:
${transcriptText}

For EACH question, provide:
1. Constructive feedback on their answer (encouraging tone, specific and actionable, not just "good job")
2. A suggested strong answer they could compare against

Also provide one overall feedback summary for the entire interview (2-4 sentences, covering communication clarity, pacing, and general impression).

Respond ONLY with valid JSON, no other text, in EXACTLY this structure:
{
  "overallFeedback": "summary text here",
  "questionFeedback": [
    {
      "questionNumber": 1,
      "feedback": "specific feedback text",
      "suggestedAnswer": "example strong answer text"
    }
  ]
}

Do not include any text outside the JSON object - no markdown code fences.
`;

    let responseText = await callGeminiWithRetry(prompt);
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const feedbackData = JSON.parse(responseText);

    // Merge feedback back into each question
    const enrichedQuestions = questions.map((q, i) => {
      const matchingFeedback = feedbackData.questionFeedback.find(
        (f) => f.questionNumber === i + 1
      );
      return {
        ...q,
        feedback: matchingFeedback ? matchingFeedback.feedback : '',
        suggestedAnswer: matchingFeedback ? matchingFeedback.suggestedAnswer : '',
      };
    });

    // Save the complete session
    const session = await InterviewSession.create({
      user: req.user._id,
      questions: enrichedQuestions,
      overallFeedback: feedbackData.overallFeedback,
    });

    res.status(201).json({
      message: 'Interview session evaluated successfully',
      session,
    });
  } catch (error) {
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