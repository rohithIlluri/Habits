const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const winston = require('winston');
require('dotenv').config();
const axios = require('axios');
const { SolanaAgentKit } = require('solana-agent-kit');
const bs58 = require('bs58');
const { Keypair, PublicKey, Connection, clusterApiUrl } = require('@solana/web3.js');

// Initialize Express app and server
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
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' }),
  ],
});

// Decode Base58 private key and initialize Keypair
const privateKeyBase58 = process.env.SOLANA_PRIVATE_KEY;
if (!privateKeyBase58 || typeof privateKeyBase58 !== 'string') {
  throw new Error('Invalid or missing SOLANA_PRIVATE_KEY. Ensure it is a valid Base58 private key string.');
}
const privateKeyArray = Uint8Array.from(bs58.decode(privateKeyBase58));
const botWallet = Keypair.fromSecretKey(privateKeyArray);
const botPublicKey = botWallet.publicKey.toString();
logger.info(`Bot wallet initialized. Public Key: ${botPublicKey}`);

// Initialize SolanaAgentKit
const agent = new SolanaAgentKit(privateKeyBase58, 'https://api.mainnet-beta.solana.com');

// Initialize Solana connection
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

// Bot context and user sessions
const bullyContext = `
You are a playful and witty AI bot called "Terminal_of_Bully". Your job is to humorously tease and engage users. Be entertaining, sarcastic, but never offensive.
`;
let userSessions = {};

// Helper: Fetch GPT response
const fetchGPTResponse = async (userMessage, userId) => {
  const userContext = userSessions[userId]?.context || '';
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: bullyContext },
          { role: 'assistant', content: userContext },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 250,
        temperature: 0.7,
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      }
    );

    const botResponse = response.data.choices[0]?.message?.content?.trim();
    if (!botResponse) {
      logger.warn(`Empty response for user ${userId}`);
      return "Hmm, I seem to have spaced out. Can you try that again?";
    }

    // Update user session context
    userSessions[userId] = {
      ...userSessions[userId],
      context: `${userContext}\nUser: ${userMessage}\nTerminal_of_Bully: ${botResponse}`
        .split('\n')
        .slice(-10)
        .join('\n'),
    };

    return botResponse;
  } catch (error) {
    logger.error(`Error fetching GPT response: ${error.message}`);
    return "Oops, I ran into a hiccup. Try again in a bit!";
  }
};

// Helper: Fetch balance
const getBotBalance = async () => {
  try {
    const publicKeyInstance = new PublicKey(botPublicKey);
    const balanceInLamports = await connection.getBalance(publicKeyInstance);
    const balanceInSol = balanceInLamports / 1e9;
    return `Bot wallet balance: ${balanceInSol.toFixed(6)} SOL.\nWallet Address: ${botPublicKey}`;
  } catch (error) {
    logger.error(`Failed to fetch bot wallet balance: ${error.message}`);
    return `Error fetching bot wallet balance. Wallet Address: ${botPublicKey}`;
  }
};

// Helper: Perform token swap
const performSwap = async (tokenAddress, amount) => {
  try {
    if (!PublicKey.isOnCurve(new PublicKey(tokenAddress))) {
      throw new Error('Invalid token address.');
    }

    const tokenPublicKey = new PublicKey(tokenAddress);
    const transactionSignature = await agent.trade(
      tokenPublicKey,       // Output token address
      parseFloat(amount),   // Amount in SOL
      new PublicKey(botPublicKey), // Bot wallet address
      300                   // Slippage (3%)
    );
    const solscanLink = `https://solscan.io/tx/${transactionSignature}`;
    return `Swap successful! View it on Solscan: ${solscanLink}`;
  } catch (error) {
    logger.error(`Error during token swap: ${error.message}`);
    return `Failed to swap tokens. Error: ${error.message}`;
  }
};

// Socket.io events
io.on('connection', (socket) => {
  const userId = socket.id;
  logger.info(`A user connected: ${userId}`);

  socket.on('disconnect', () => {
    logger.info(`User ${userId} disconnected`);
    delete userSessions[userId];
  });

  socket.on('user-message', async (data) => {
    const userMessage = data.text.toLowerCase();
    logger.info(`Received message from ${userId}: "${userMessage}"`);

    if (!userSessions[userId]) userSessions[userId] = {};

    // Swap Flow
    if (userSessions[userId].swapInProgress) {
      if (!userSessions[userId].contractAddress) {
        if (!PublicKey.isOnCurve(new PublicKey(userMessage))) {
          socket.emit('bot-response', {
            sender: 'Terminal_of_Bully',
            text: 'Invalid contract address. Please provide a valid Base58 address.',
          });
          return;
        }

        userSessions[userId].contractAddress = userMessage;
        socket.emit('bot-response', {
          sender: 'Terminal_of_Bully',
          text: 'How much SOL do you want to swap?',
        });
        return;
      }

      if (!userSessions[userId].swapAmount) {
        if (!/^\d+(\.\d+)?$/.test(userMessage)) {
          socket.emit('bot-response', {
            sender: 'Terminal_of_Bully',
            text: 'Invalid amount. Please provide a numeric value.',
          });
          return;
        }

        userSessions[userId].swapAmount = userMessage;

        const result = await performSwap(userSessions[userId].contractAddress, userSessions[userId].swapAmount);
        userSessions[userId].swapInProgress = false;
        delete userSessions[userId].contractAddress;
        delete userSessions[userId].swapAmount;

        socket.emit('bot-response', { sender: 'Terminal_of_Bully', text: result });
        return;
      }
    }

    // Initiate Swap
    if (userMessage.includes('swap')) {
      userSessions[userId].swapInProgress = true;
      socket.emit('bot-response', {
        sender: 'Terminal_of_Bully',
        text: 'Which token do you want to swap to? Provide the contract address.',
      });
      return;
    }

    // Balance Check
    if (userMessage.includes('balance')) {
      const balanceMessage = await getBotBalance();
      socket.emit('bot-response', { sender: 'Terminal_of_Bully', text: balanceMessage });
      return;
    }

    // Default Bully Mode
    const botResponse = await fetchGPTResponse(userMessage, userId);
    socket.emit('bot-response', { sender: 'Terminal_of_Bully', text: botResponse });
  });
});

// Start the server
server.listen(4000, () => {
  logger.info('Server is running on http://localhost:4000');
});
