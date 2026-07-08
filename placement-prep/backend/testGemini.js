const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ vertexai: false, apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
const result = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
});
    console.log('SUCCESS:', result.text);
  } catch (error) {
    console.log('FAILED:', error.message);
  }
}

test();