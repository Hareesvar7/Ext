// src/services/openAIService.js
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env

async function getAIResponse(prompt) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4', // Ensure you are specifying the correct model
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.choices[0].message.content.trim(); // Ensure you access the content correctly
    } catch (error) {
        console.error("Error with AI Assist:", error.response ? error.response.data : error.message);
        throw new Error(error.response ? error.response.data.error.message : "Internal Server Error");
    }
}

module.exports = getAIResponse;
