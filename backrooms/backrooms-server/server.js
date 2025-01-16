const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const winston = require('winston');
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

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' }),
  ],
});

// Bot context and user sessions
const bullyContext = `
You are a playful and witty AI bot called "Terminal_of_Bully". Your job is to humorously tease and engage users. Be entertaining, sarcastic, but never offensive.
`;
let userSessions = {};

// Helper to fetch GPT response
const fetchGPTResponse = async (userMessage, userId) => {
  const userContext = userSessions[userId]?.context || '';
  const prompt = `${bullyContext}\n\nPrevious Context:\n${userContext}\n\nUser: ${userMessage}\nTerminal_of_Bully:`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // Cost-efficient model
        messages: [
          { role: 'system', content: bullyContext },
          { role: 'assistant', content: userContext },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 250, // Smaller max tokens for efficiency
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const botResponse = response.data.choices[0]?.message?.content?.trim();
    if (!botResponse) {
      logger.warn(`Empty response for user ${userId}`);
      return "Hmm, I seem to have spaced out. Can you try that again?";
    }

    // Trim user session context to the last 5 messages for token efficiency
    userSessions[userId] = {
      ...userSessions[userId],
      context: `${userContext}\nUser: ${userMessage}\nTerminal_of_Bully: ${botResponse}`
        .split('\n')
        .slice(-10)
        .join('\n'),
    };

    logger.info(`Response for user ${userId}: "${botResponse}"`);
    return botResponse;
  } catch (error) {
    logger.error(`Error fetching GPT response: ${error.message}`);
    return "Oops, I ran into a hiccup. Try again in a bit!";
  }
};

// Socket.io events
io.on('connection', (socket) => {
  const userId = socket.id;
  logger.info(`A user connected: ${userId}`);

  socket.on('disconnect', () => {
    logger.info(`User ${userId} disconnected`);
  });

  socket.on('user-message', async (data) => {
    const userMessage = data.text;
    logger.info(`Received message from ${userId}: "${userMessage}"`);
    const botResponse = await fetchGPTResponse(userMessage, userId);
    socket.emit('bot-response', { sender: 'Terminal_of_Bully', text: botResponse });
  });
});

// Start the server
server.listen(4000, () => {
  logger.info('Server is running on http://localhost:4000');
});
