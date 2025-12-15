const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const models = response.data.models;
        console.log("Available Models:");
        models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
    } catch (error) {
        console.error("Error listing models:", error.response?.data || error.message);
    }
}

listModels();
