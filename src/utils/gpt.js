// abvService.js
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

const chatGPTConfig = {
    model: 'gpt-3.5-turbo',
    temperature: 1.0,
    max_tokens: 2048,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: null,
};

async function getChatGPTResponse(prompt) {
    const url = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await axios.post(
            url,
            {
                ...chatGPTConfig,
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI:', error.response?.data || error.message);
        return 'Sorry, something went wrong.';
    }
}


// (async () => {
//     const userPrompt = 'Tell me a joke about programming.';
//     const chatResponse = await getChatGPTResponse(userPrompt);
//     console.log('ChatGPT Response:', chatResponse);
// })();


module.exports = { getChatGPTResponse };
