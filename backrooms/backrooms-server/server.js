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

// Logger setup with winston
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

// Preloaded Portfolio Data
const portfolioContext = `
You are an AI portfolio assistant for Sree Naga Rohith Reddy Illuri. Your job is to professionally and engagingly answer user questions about Sree's skills, experience, projects, and contact details. Always provide friendly, precise, and informative responses. Here's the portfolio summary:

**Skills:** Java 8/11/17, Spring Boot, Microservices, React.js, Angular, AWS, Azure, GCP, Docker, Kubernetes, REST APIs.

**Key Projects:**
1. **Distributed Payment Architecture:** Designed a scalable payment system supporting real-time transactions and fraud detection.
2. **Blockchain Development:** Built Solana smart contracts for NFT minting and staking, integrated with Web3.js.

**Experience:**
1. **Full Stack Developer at MasterCard Data & Services (2020–Present):** Developed enterprise-grade applications, implemented microservices, and ensured zero downtime in production.
2. **Developer at Just Pay (2021–2022):** Migrated monolith to microservices, built real-time analytics pipelines.

**Education:** 
- Masters in Information Technology from the University of the Cumberlands (2024).
- Bachelors in Mechanical Engineering from JNTU Hyderabad (2021).

**Contact Information:** Email: rohith.illuri@gmail.com | GitHub: https://github.com/rohithIlluri | LinkedIn: https://www.linkedin.com/in/sree-naga-rohith-reddy-illuri-99258a1ab/ | Phone: (314) 704-9516.

Respond professionally to user queries. Keep responses concise but thorough.
`;

// Fetch GPT-4 Response
const fetchGPTResponse = async (userMessage) => {
  const prompt = `${portfolioContext}\n\nUser: ${userMessage}\nBot:`;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: portfolioContext },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.7,
        stop: ['User:', 'Bot:'],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    logger.info(`Response fetched successfully for message: "${userMessage}"`);
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    logger.error(`Error fetching GPT-4 response: ${error.message}`);
    return "I'm sorry, I couldn't process your request at the moment. Please try again later.";
  }
};

// Socket.io Events
io.on('connection', (socket) => {
  logger.info('A user connected');

  socket.on('user-message', async (data) => {
    const userMessage = data.text;
    logger.info(`Received message: "${userMessage}" from user`);
    const botResponse = await fetchGPTResponse(userMessage);
    io.emit('bot-response', { sender: 'Portfolio Bot', text: botResponse });
  });

  socket.on('disconnect', () => {
    logger.info('A user disconnected');
  });
});

server.listen(4000, () => {
  logger.info('Server is running on http://localhost:4000');
});
