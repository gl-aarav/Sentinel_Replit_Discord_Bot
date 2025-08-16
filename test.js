require('dotenv').config({ path: './ai_bot.env' });

console.log("Checking environment variables...");
console.log(
  "Discord Token:", process.env.DISCORD_BOT_TOKEN ? "Found ✅" : "Missing ❌"
);
console.log(
  "OpenAI Key:", process.env.OPENAI_API_KEY ? "Found ✅" : "Missing ❌"
);
