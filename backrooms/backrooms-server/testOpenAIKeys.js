require('dotenv').config();
const axios = require('axios');

const testKey = async (apiKey, botName) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are ${botName}.` },
          { role: 'user', content: 'Can you say hello?' },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    console.log(`${botName} Response:`, response.data.choices[0].message.content);
  } catch (error) {
    console.error(`${botName} Error:`, error.response?.data || error.message);
  }
};

const main = async () => {
  const botAKey = process.env.OPENAI_API_KEY_BOT_A;
  const botBKey = process.env.OPENAI_API_KEY_BOT_B;

  if (!botAKey || !botBKey) {
    console.error('API keys for Bot A or Bot B are missing in the .env file.');
    return;
  }

  console.log('Testing API keys...');
  await testKey(botAKey, 'Bot A');
  await testKey(botBKey, 'Bot B');
};

main();
