const { SolanaAgentKit } = require('solana-agent-kit');
const { PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

(async () => {
  try {
    // Load the private key from environment variables
    const privateKeyBase58 = process.env.SOLANA_PRIVATE_KEY;
    if (!privateKeyBase58 || typeof privateKeyBase58 !== 'string') {
      throw new Error('Invalid or missing SOLANA_PRIVATE_KEY. Ensure it is a valid Base58 private key string.');
    }

    // Decode the private key into Uint8Array
    const privateKeyArray = Uint8Array.from(bs58.decode(privateKeyBase58));

    // Initialize Solana Agent Kit with the private key
    const agent = new SolanaAgentKit(privateKeyBase58, 'https://api.mainnet-beta.solana.com');

    // Example token addresses and amount
    const outputMint = new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'); // BONK
    const inputAmount = 0.01; // Amount in SOL

    // Log the swap details
    console.log(`Attempting to swap ${inputAmount} SOL for BONK (${outputMint.toString()})...`);

    // Perform the swap
    const transactionSignature = await agent.trade(outputMint, inputAmount);

    // Log the success
    console.log(`Swap successful! Transaction Signature: ${transactionSignature}`);
    console.log(`View transaction on Solscan: https://solscan.io/tx/${transactionSignature}`);
  } catch (error) {
    // Log any errors
    console.error('Error during swap:', error.message);
  }
})();
