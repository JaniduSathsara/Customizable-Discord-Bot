// ---------------- IMPORTS & CONFIG ----------------
import 'dotenv/config';
import { 
  Client, GatewayIntentBits, ActivityType, EmbedBuilder,
  REST, Routes, SlashCommandBuilder,
  ButtonBuilder, ButtonStyle, ActionRowBuilder
} from "discord.js";

// ---------------- ENV VARIABLES ----------------
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const requiredRoleId = process.env.SAY_ROLE_ID;
const welcomeChannelId = process.env.WELCOME_CHANNEL;
const leaveChannelId = process.env.LEAVE_CHANNEL;
const rolesChannelId = process.env.ROLES_CHANNEL;
const rulesChannelId = process.env.RULE_CHANNEL;
const BOOST_ROLE_ID = process.env.BOOST_ROLE_ID;
const BOOST_CHANNEL_ID = process.env.BOOST_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

// ---------------- BOT CLIENT ----------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ---------------- SLASH COMMAND REGISTRATION ----------------
const commands = [
  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message using the bot!')
    .addStringOption(option =>
      option.setName('message').setDescription('The message to send').setRequired(true)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("Slash commands registered successfully!");
  } catch (err) {
    console.error("Error registering slash commands:", err);
  }
})();

// ---------------- BOT READY EVENT ----------------
client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const statuses = [
    { name: "Miss Thiv 🩷", type: ActivityType.Listening },
    { name: "with 💚Miss Thiv Fam", type: ActivityType.Playing },
    { name: "0 members ⭐", type: ActivityType.Watching }
  ];

  let i = 0;
  setInterval(() => {
    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const totalBoosts = client.guilds.cache.reduce((acc, g) => acc + g.premiumSubscriptionCount, 0);
    statuses[2].name = `${totalMembers} members | ${totalBoosts} boosts ⭐`;

    client.user.setPresence({ activities: [statuses[i]], status: "online" });
    i = (i + 1) % statuses.length;
  }, 10000);
});

// ---------------- MESSAGE & PREFIX COMMANDS ----------------
const prefix = "!";
const greetings = [
  "Hello there 🎉❤️",
  "🌸✨ Heyyy, beautiful souls! ✨🌸",
  "Sit back, relax, and let the good vibes flow 🌊💫",
  "Welcome to our cozy corner of the internet 💖🌙",
  "Heya! What's up?"
];
const lastMessageSent = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ---------- Auto-reply ----------
  const content = message.content.toLowerCase();
  if (content === "hi" || content === "hy" || content === "hello") {
    const availableMessages = greetings.filter(
      msg => msg !== lastMessageSent.get(message.author.id)
    );
   const randomMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];
lastMessageSent.set(message.author.id, randomMessage);
await message.reply(`<@${message.author.id}> ${randomMessage} `);
  }

  // ---------- Prefix Commands ----------
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "thiv") {
    const embed = new EmbedBuilder()
      .setTitle("Miss Thiv Official")
      .setDescription(
        `Hello <a:aWave:970955825914978305> I’m Thivya Deshani (Miss Thiv),\n` +
        `A passionate content creator and live streamer. <a:an_Hearts:970533804844412928>`
      )
      .setColor("F75EE6")
      .setImage("https://res.cloudinary.com/dzetdzeld/image/upload/v1763267871/tt_fgk7mf.png")
      .setFooter({ text: "👇 Click here to support me" });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Socials 🌐")
        .setURL("https://guns.lol/missthiv")
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel("YouTube 🔴")
        .setURL("https://youtube.com/@missthiv")
        .setStyle(ButtonStyle.Link)
    );

    await message.channel.send({ embeds: [embed], components: [buttons] });
  }
});

// ---------------- GUILD MEMBER EVENTS ----------------
client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("#f434b4")
    .setAuthor({ 
      name: `Welcome @${member.user.username}`, 
      iconURL: "https://res.cloudinary.com/dzetdzeld/image/upload/v1763267871/tt_fgk7mf.png" 
    })
    .setTitle(`Welcome to <a:pink:1420493746759536762> MISS THIV OFFICIAL <a:pink:1420493746759536762>`)
    .setDescription(
      `Make sure to read the rules and collect your roles!\n\n` +
      `<a:arrow_heartright:1419889005117571123> **Grab your roles in:** <#${rolesChannelId}>\n` +
      `<a:arrow_heartright:1419889005117571123> **Check out the rules in:** <#${rulesChannelId}>`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
    .setImage("https://res.cloudinary.com/dzetdzeld/image/upload/v1763353599/banner_vuyxpk.png")
    .setTimestamp()
    .setFooter({ text: "Miss Thiv Official" });

  try {
    await channel.send({ content: `Welcome <@${member.id}> <a:fg_bun_love:1419889827423191121>`, embeds: [embed] });
  } catch (err) {
    console.error("Failed to send welcome embed:", err);
  }
});

client.on("guildMemberRemove", async (member) => {
  const channel = member.guild.channels.cache.get(leaveChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("#f37ae5")
    .setAuthor({ name: `${member.user.tag} left the server 😢`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
    .setDescription(`We are sad to see <@${member.id}> leave!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setFooter({ text: "Miss Thiv Official" });

  try {
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Failed to send leave embed:", err);
  }
});

// ---------------- SERVER BOOST EVENTS ----------------
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  // Boost started
  if (!oldMember.premiumSince && newMember.premiumSince) {
    const boostChannel = await client.channels.fetch(BOOST_CHANNEL_ID).catch(() => null);
    if (boostChannel) {
      await boostChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff73fa')
            .setTitle('🚀 Server Boosted!')
            .setDescription(`🎉 Thank you <@${newMember.id}> for boosting **${newMember.guild.name}**!`)
            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
            .setImage('https://res.cloudinary.com/dzetdzeld/image/upload/v1770658388/boost_thankyou_kq2n7k.png')
            .setFooter({ text: "Miss Thiv Official" })
            .setTimestamp()
        ]
      });
    }
    if (BOOST_ROLE_ID) await newMember.roles.add(BOOST_ROLE_ID).catch(() => {});
  }

  // Boost ended
  if (oldMember.premiumSince && !newMember.premiumSince) {
    if (BOOST_ROLE_ID) await newMember.roles.remove(BOOST_ROLE_ID).catch(() => {});

    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#790679')
            .setTitle('💔 Boost Ended')
            .setDescription(`<@${newMember.id}> is no longer boosting the server.`)
            .setTimestamp()
            .setFooter({ text: "Miss Thiv Official" })
        ]
      });
    }
  }
});

// ---------------- SLASH COMMAND HANDLER ----------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'say') {
    if (!interaction.member.roles.cache.has(requiredRoleId)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const msg = interaction.options.getString('message');
    try {
      await interaction.reply({ content: 'Message sent!', ephemeral: true });
      await interaction.channel.send(msg);
    } catch (err) {
      console.error("Failed to send /say message:", err);
    }
  }
});

// ---------------- LOGIN ----------------
client.login(token);
