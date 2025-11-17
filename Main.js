// ---------------- IMPORTS & CONFIG ----------------
import 'dotenv/config';
import { 
  Client, GatewayIntentBits, ActivityType, EmbedBuilder,
  REST, Routes, SlashCommandBuilder,
  ButtonBuilder, ButtonStyle, ActionRowBuilder
} from "discord.js";

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const requiredRoleId = process.env.SAY_ROLE_ID;
const welcomeChannelId = process.env.WELCOME_CHANNEL;
const leaveChannelId = process.env.LEAVE_CHANNEL;
const rolesChannelId = process.env.ROLES_CHANNEL;
const rulesChannelId = process.env.RULE_CHANNEL;

// Create bot client
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
      option
        .setName('message')
        .setDescription('The message to send')
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log("Slash commands registered successfully!");
  } catch (err) {
    console.error("Error registering slash commands:", err);
  }
})();

// ---------------- BOT READY EVENT ----------------
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const statuses = [
    { name: "Miss Thiv 🩷", type: ActivityType.Listening },
    { name: "with 💚Miss Thiv Fam", type: ActivityType.Playing },
    { name: "0 members ⭐", type: ActivityType.Watching }
  ];

  let i = 0;
  setInterval(() => {
    const guild = client.guilds.cache.first();
    if (guild) {
      statuses[2].name = `${guild.memberCount} members ⭐`;
    }

    client.user.setPresence({
      activities: [statuses[i]],
      status: "online"
    });

    i = (i + 1) % statuses.length;
  }, 10000);
});

// ---------------- AUTO-REPLY ----------------
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  if (content === "hi" || content === "hello") {
    message.reply(`Hello <@${message.author.id}> <a:aWave:970955825914978305>`);
  }
});

// ---------------- WELCOME EMBED ----------------
client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("#f434b4")
    .setAuthor({
      name: `Welcome @${member.user.username}`,
      iconURL: member.user.displayAvatarURL({ dynamic: true })
    })
    .setTitle(`Welcome to <a:pink:1420493746759536762> MISS THIV OFFICIAL <a:pink:1420493746759536762>`)
    .setDescription(
      `Make sure to read the rules and collect your roles!\n\n` +
      `<a:arrow_heartright:1419889005117571123> **Grab your roles in:** <#${rolesChannelId}>\n` +
      `<a:arrow_heartright:1419889005117571123> **Check out the rules in:** <#${rulesChannelId}>`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
    .setImage("https://res.cloudinary.com/dzetdzeld/image/upload/v1763353599/banner_vuyxpk.png")
    .setFooter({ text: "Miss Thiv Official" });

  await channel.send({
    content: `Welcome <@${member.id}> <a:fg_bun_love:1419889827423191121>`,
    embeds: [embed]
  });
});

// ---------------- LEAVE EMBED ----------------
client.on("guildMemberRemove", async (member) => {
  const channel = member.guild.channels.cache.get(leaveChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("#f37ae5")
    .setAuthor({
      name: `${member.user.tag} left the server 😢`,
      iconURL: member.user.displayAvatarURL({ dynamic: true })
    })
    .setDescription(`We are sad to see <@${member.id}> leave!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setFooter({ text: "Miss Thiv Official" });

  await channel.send({ embeds: [embed] });
});

// ---------------- /SAY SLASH COMMAND ----------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'say') {
    if (!interaction.member.roles.cache.has(requiredRoleId)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const msg = interaction.options.getString('message');
    await interaction.reply({ content: 'Message sent!', ephemeral: true });
    await interaction.channel.send(msg);
  }
});

// ---------------- !THIV COMMAND ----------------
const prefix = "!";
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
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

// ---------------- LOGIN ----------------
client.login(token);
