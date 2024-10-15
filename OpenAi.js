const axios = require('axios');

async function getAIResponse(prompt) {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt,
        max_tokens: 100
    }, {
        headers: {
            'Authorization': `Bearer YOUR_OPENAI_API_KEY`, // Use environment variables for production
            'Content-Type': 'application/json'
        }
    });
    return response.data.choices[0].text.trim();
}

module.exports = getAIResponse;
