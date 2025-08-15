// ====================
// Load environment variables
// ====================
require('dotenv').config({ path: './ai_bot.env' });

// ====================
// Discord & OpenAI setup
// ====================
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ====================
// Your existing bot code
// ====================
client.once('ready', () => {
  console.log(`Bot online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  if (message.content.startsWith('!ping')) {
    message.channel.send('Pong!');
  }

  // Add your other commands here
});

// ====================
// Keep-alive server for Replit
// ====================
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Keep-alive server running on port ${PORT}`));

// Self-ping to prevent Replit from sleeping
setInterval(() => {
  fetch(`http://localhost:${PORT}`)
    .then(() => console.log('Self-ping to stay awake'))
    .catch((err) => console.error('Ping error:', err));
}, 300000); // every 5 minutes

// ====================
// Start Discord bot
// ====================
client.login(process.env.DISCORD_TOKEN);
