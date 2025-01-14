// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

let context = "Two bots are trapped in the backrooms. They must discuss and navigate their way out, speaking English and helping each other.";

const fetchGPTResponse = async (prompt, apiKey, model) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: model,
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
        stop: ["babbage-002:", "davinci-002:"],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(`Error fetching GPT response: ${error.response?.data || error.message}`);
    return 'Error generating GPT response.';
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

io.on('connection', (socket) => {
  console.log('A user connected');
  let botAResponse = `davinci-002: ${context}`;

  (async () => {
    for (let i = 0; i < 5; i++) {
      io.emit('message', { sender: 'davinci-002', text: botAResponse });
      const botBResponse = await fetchGPTResponse(
        `${botAResponse}\n\nbabbage-002:`,
        process.env.OPENAI_API_KEY_BOT_B,
        'babbage-002'
      );
      io.emit('message', { sender: 'babbage-002', text: botBResponse });

      await delay(5000);

      botAResponse = await fetchGPTResponse(
        `${botBResponse}\n\ndavinci-002:`,
        process.env.OPENAI_API_KEY_BOT_A,
        'davinci-002'
      );
      io.emit('message', { sender: 'davinci-002', text: botAResponse });

      await delay(5000);
    }
    console.log('Bot conversation completed.');
  })();
});

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
