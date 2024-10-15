const axios = require('axios');
require('dotenv').config(); // Load API key from .env

async function getAIResponse(prompt) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions', 
            {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150,
                temperature: 0.7,
            }, 
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        throw new Error(error.response ? error.response.data.error.message : "API Request failed");
    }
}

module.exports = getAIResponse;
