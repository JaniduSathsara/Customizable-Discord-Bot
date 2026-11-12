
import 'dotenv/config';

import {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events
} from 'discord.js';

const config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,

  prefix: process.env.PREFIX || '!',

  serverName: process.env.SERVER_NAME || 'My Discord Server',
  botName: process.env.BOT_NAME || 'My Discord Bot',
  ownerName: process.env.OWNER_NAME || 'Server Owner',

  requiredRoleId: process.env.SAY_ROLE_ID,

  welcomeChannelId: process.env.WELCOME_CHANNEL,
  leaveChannelId: process.env.LEAVE_CHANNEL,
  rolesChannelId: process.env.ROLES_CHANNEL,
  rulesChannelId: process.env.RULE_CHANNEL,

  boostChannelId: process.env.BOOST_CHANNEL_ID,
  logChannelId: process.env.LOG_CHANNEL_ID,
  boostRoleId: process.env.BOOST_ROLE_ID,

  welcomeMessage: process.env.WELCOME_MESSAGE || 'Welcome to our community!',
  leaveMessage: process.env.LEAVE_MESSAGE || 'We are sad to see you leave!',
  boostMessage: process.env.BOOST_MESSAGE || 'Thank you for boosting our server!',

  welcomeColor: process.env.WELCOME_COLOR || '#f434b4',
  leaveColor: process.env.LEAVE_COLOR || '#f37ae5',
  boostColor: process.env.BOOST_COLOR || '#ff73fa',

  welcomeImage: process.env.WELCOME_IMAGE,
  boostImage: process.env.BOOST_IMAGE,
  botImage: process.env.BOT_IMAGE,

  websiteUrl: process.env.WEBSITE_URL,
  youtubeUrl: process.env.YOUTUBE_URL,
  socialUrl: process.env.SOCIAL_URL
};


if (!config.token || !config.clientId) {
  console.error('Missing TOKEN or CLIENT_ID in .env file.');
  process.exit(1);
}


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message using the bot.')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('The message to send')
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

async function registerCommands() {
  try {
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );

    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Command registration failed:', error);
  }
}

registerCommands();

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`${config.botName} is online!`);

  const statuses = [
    {
      name: config.serverName,
      type: ActivityType.Listening
    },
    {
      name: process.env.STATUS_1 || 'your community',
      type: ActivityType.Playing
    },
    {
      name: process.env.STATUS_2 || 'your server',
      type: ActivityType.Watching
    }
  ];

  let index = 0;

  const updateStatus = () => {
    const totalMembers = client.guilds.cache.reduce(
      (total, guild) => total + guild.memberCount,
      0
    );

    const currentStatuses = [
      statuses[0],
      statuses[1],
      {
        name: `${totalMembers} ${process.env.STATUS_3 || 'members'}`,
        type: ActivityType.Watching
      }
    ];

    client.user.setPresence({
      activities: [currentStatuses[index]],
      status: 'online'
    });

    index = (index + 1) % currentStatuses.length;
  };

  updateStatus();
  setInterval(updateStatus, 10000);
});


const greetings = [
  // USE YOUR OWN MESSAGES
];

const lastMessageSent = new Map();

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();

  if (['hi', 'hy', 'hello'].includes(content)) {
    const availableMessages = greetings.filter(
      greeting => greeting !== lastMessageSent.get(message.author.id)
    );

    const randomMessage =
      availableMessages[
      Math.floor(Math.random() * availableMessages.length)
      ];

    lastMessageSent.set(message.author.id, randomMessage);

    await message.reply(
      `<@${message.author.id}> ${randomMessage}`
    );
  }

  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/);

  const command = args.shift()?.toLowerCase();

  if (command === 'info') {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(config.botName)
      .setDescription(
        `Welcome to **${config.serverName}**!\n\n` +
        `Bot Owner: **${config.ownerName}**\n` +
        `Bot Name: **${config.botName}**`
      )
      .setFooter({ text: config.serverName })
      .setTimestamp();

    if (config.botImage) {
      embed.setThumbnail(config.botImage);
    }

    const buttons = new ActionRowBuilder();

    if (config.websiteUrl) {
      buttons.addComponents(
        new ButtonBuilder()
          .setLabel('Website')
          .setURL(config.websiteUrl)
          .setStyle(ButtonStyle.Link)
      );
    }

    if (config.socialUrl) {
      buttons.addComponents(
        new ButtonBuilder()
          .setLabel('Socials')
          .setURL(config.socialUrl)
          .setStyle(ButtonStyle.Link)
      );
    }

    if (config.youtubeUrl) {
      buttons.addComponents(
        new ButtonBuilder()
          .setLabel('YouTube')
          .setURL(config.youtubeUrl)
          .setStyle(ButtonStyle.Link)
      );
    }

    await message.channel.send({
      embeds: [embed],
      components: buttons.components.length ? [buttons] : []
    });
  }
});


client.on(Events.GuildMemberAdd, async member => {
  if (!config.welcomeChannelId) return;

  const channel = await member.guild.channels
    .fetch(config.welcomeChannelId)
    .catch(() => null);

  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(config.welcomeColor)
    .setAuthor({
      name: `Welcome ${member.user.username}`,
      iconURL: member.user.displayAvatarURL()
    })
    .setTitle(`Welcome to ${config.serverName}!`)
    .setDescription(
      `${config.welcomeMessage}\n\n` +
      (config.rolesChannelId
        ? `🎭 **Collect your roles:** <#${config.rolesChannelId}>\n`
        : '') +
      (config.rulesChannelId
        ? `📜 **Read the rules:** <#${config.rulesChannelId}>`
        : '')
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
    .setFooter({ text: config.serverName })
    .setTimestamp();

  if (config.welcomeImage) {
    embed.setImage(config.welcomeImage);
  }

  try {
    await channel.send({
      content: `Welcome <@${member.id}>! ❤️`,
      embeds: [embed]
    });
  } catch (error) {
    console.error('Welcome message failed:', error);
  }
});

client.on(Events.GuildMemberRemove, async member => {
  if (!config.leaveChannelId) return;

  const channel = await member.guild.channels
    .fetch(config.leaveChannelId)
    .catch(() => null);

  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(config.leaveColor)
    .setTitle(`${member.user.username} left the server`)
    .setDescription(
      `${config.leaveMessage}\n\n` +
      `We hope to see you again!`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: config.serverName })
    .setTimestamp();

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Leave message failed:', error);
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {


  if (!oldMember.premiumSince && newMember.premiumSince) {

    if (config.boostChannelId) {
      const channel = await newMember.guild.channels
        .fetch(config.boostChannelId)
        .catch(() => null);

      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(config.boostColor)
          .setTitle('🚀 Server Boosted!')
          .setDescription(
            `🎉 Thank you <@${newMember.id}>!\n\n` +
            `${config.boostMessage}\n` +
            `**${config.serverName}**`
          )
          .setThumbnail(
            newMember.user.displayAvatarURL()
          )
          .setFooter({ text: config.serverName })
          .setTimestamp();

        if (config.boostImage) {
          embed.setImage(config.boostImage);
        }

        await channel.send({ embeds: [embed] })
          .catch(console.error);
      }
    }

    if (config.boostRoleId) {
      await newMember.roles.add(config.boostRoleId)
        .catch(console.error);
    }
  }


  if (oldMember.premiumSince && !newMember.premiumSince) {

    if (config.boostRoleId) {
      await newMember.roles.remove(config.boostRoleId)
        .catch(console.error);
    }

    if (config.logChannelId) {
      const logChannel = await newMember.guild.channels
        .fetch(config.logChannelId)
        .catch(() => null);

      if (logChannel && logChannel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor('#790679')
          .setTitle('💔 Boost Ended')
          .setDescription(
            `<@${newMember.id}> is no longer boosting **${config.serverName}**.`
          )
          .setFooter({ text: config.serverName })
          .setTimestamp();

        await logChannel.send({ embeds: [embed] })
          .catch(console.error);
      }
    }
  }
});


client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'say') {

    if (!interaction.guild) {
      return interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true
      });
    }

    if (!config.requiredRoleId) {
      return interaction.reply({
        content: 'The SAY_ROLE_ID is not configured.',
        ephemeral: true
      });
    }

    const member = await interaction.guild.members
      .fetch(interaction.user.id);

    if (!member.roles.cache.has(config.requiredRoleId)) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const msg = interaction.options.getString('message');

    try {
      await interaction.reply({
        content: 'Message sent successfully!',
        ephemeral: true
      });

      await interaction.channel.send(msg);

    } catch (error) {
      console.error('Say command failed:', error);
    }
  }
});

client.login(config.token);
