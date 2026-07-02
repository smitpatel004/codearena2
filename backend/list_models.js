const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
      console.log("Models supporting generateContent:");
      generateModels.forEach(m => console.log(m.name));
    } else {
      console.log("No models returned", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
