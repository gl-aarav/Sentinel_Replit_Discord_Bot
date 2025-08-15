// Keep-alive server for Replit
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Keep-alive server running on port ${PORT}`);
});


require('dotenv').config({ path: './ai_bot.env' });
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ADMIN_ROLE = 'Founder/Admin'; // role allowed to run admin commands

client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
});

// Helper function to check admin permissions
function isAdmin(member) {
  return member.roles.cache.some(role => role.name === ADMIN_ROLE);
}

// Helper function to split long messages into chunks
function splitMessage(message) {
  const chunks = [];
  while (message.length > 0) {
    chunks.push(message.slice(0, 2000));
    message = message.slice(2000);
  }
  return chunks;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  // CREATE CHANNEL
    if (command === '!createchannel') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ You do not have permission to create channels.');
      }
      const channelName = args.join('-');
      if (!channelName) return message.reply('Usage: !createchannel <name>');
      try {
        const newChannel = await message.guild.channels.create({
          name: channelName,
          type: 0 // GUILD_TEXT
        });
        message.reply(`✅ Channel created: ${newChannel}`);
      } catch (err) {
        console.error(err);
        message.reply('❌ Failed to create channel.');
      }
    }

    // DELETE CHANNEL
    if (command === '!deletechannel') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ You do not have permission to delete channels.');
      }
      const channelName = args.join('-').toLowerCase();
      const channelToDelete = message.guild.channels.cache.find(c => c.name.toLowerCase() === channelName);
      if (!channelToDelete) return message.reply(`❌ No channel found named "${channelName}".`);
      try {
        await channelToDelete.delete();
        message.reply(`✅ Channel deleted: #${channelName}`);
      } catch (err) {
        console.error(err);
        message.reply('❌ Failed to delete channel.');
      }
    }

  // ==================== !help ====================
  if (command === '!help') {
  if (!isAdmin(message.member)) 
      return message.channel.send('❌ You don’t have permission to use this command.');

  return message.channel.send(`**Available Commands (Founder/Admin only):**
  \`\`\`
  !help - Show this help message
  !addrole <role> @user - Add a role to a user
  !removerole <role> @user - Remove a role from a user
  !createrole <name> - Create a new role
  !deleterole <name> - Delete an existing role
  !renamerole <oldName> <newName> - Rename a role
  !kick @user - Kick a user from the server
  !ban @user - Ban a user from the server
  !unban <userID> - Unban a user by their ID
  !deleteall <#channel> - Delete all messages in a channel
  !createchannel <name> - Create a new text channel
  !deletechannel <name> - Delete a text channel
  !chat <message> [#channel] [@user] - Chat via AI in current or specified channel
  \`\`\``);
}


  // ==================== !chat ====================
  if (command === '!chat') {
    try {
      let targetChannel = message.channel;
      const userMention = message.mentions.users.first();
      const channelMention = message.mentions.channels.first();

      // Remove mentions from args for clean prompt
      const prompt = args.filter(a => !a.startsWith('<@') && !a.startsWith('<#')).join(' ');

      if (channelMention) targetChannel = channelMention;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      let reply = response.choices[0].message.content;

      // Mention user if specified
      if (userMention) reply = `${userMention}, ${reply}`;

      splitMessage(reply).forEach(chunk => targetChannel.send(chunk));
    } catch (err) {
      console.error(err);
      message.channel.send('❌ An error occurred while executing the command.');
    }
  }

  // ==================== Admin server commands ====================
  if (!isAdmin(message.member)) return;

  if (command === '!addrole') {
    const roleName = args[0];
    const user = message.mentions.members.first();
    if (!roleName || !user) return message.channel.send('Usage: !addrole <role> @user');
    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) return message.channel.send('Role not found');
    await user.roles.add(role);
    message.channel.send(`✅ Added ${roleName} to ${user.user.tag}`);
  }

  if (command === '!removerole') {
    const roleName = args[0];
    const user = message.mentions.members.first();
    if (!roleName || !user) return message.channel.send('Usage: !removerole <role> @user');
    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) return message.channel.send('Role not found');
    await user.roles.remove(role);
    message.channel.send(`✅ Removed ${roleName} from ${user.user.tag}`);
  }

  if (command === '!createrole') {
    const roleName = args.join(' ');
    if (!roleName) return message.channel.send('Usage: !createrole <name>');
    await message.guild.roles.create({ name: roleName });
    message.channel.send(`✅ Role "${roleName}" created`);
  }

  if (command === '!deleterole') {
    const roleName = args.join(' ');
    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) return message.channel.send('Role not found');
    await role.delete();
    message.channel.send(`✅ Role "${roleName}" deleted`);
  }

  if (command === '!renamerole') {
    const oldName = args[0];
    const newName = args.slice(1).join(' ');
    const role = message.guild.roles.cache.find(r => r.name === oldName);
    if (!role || !newName) return message.channel.send('Usage: !renamerole <oldName> <newName>');
    await role.setName(newName);
    message.channel.send(`✅ Renamed "${oldName}" to "${newName}"`);
  }

  if (command === '!kick') {
    const user = message.mentions.members.first();
    if (!user) return message.channel.send('Usage: !kick @user');
    await user.kick();
    message.channel.send(`✅ Kicked ${user.user.tag}`);
  }

  if (command === '!ban') {
    const user = message.mentions.members.first();
    if (!user) return message.channel.send('Usage: !ban @user');
    await user.ban();
    message.channel.send(`✅ Banned ${user.user.tag}`);
  }

  if (command === '!unban') {
    const userId = args[0];
    if (!userId) return message.channel.send('Usage: !unban <userID>');
    await message.guild.members.unban(userId);
    message.channel.send(`✅ Unbanned user ID ${userId}`);
  }

  if (command === '!deleteall') {
    const channel = message.mentions.channels.first() || message.channel;
    let fetched;
    do {
      fetched = await channel.messages.fetch({ limit: 100 });
      await channel.bulkDelete(fetched, true).catch(err => console.error(err));
    } while (fetched.size >= 2);
    message.channel.send('✅ Deleted all messages in this channel');
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
