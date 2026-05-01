process.on('unhandledRejection', err => {
  console.log('UNHANDLED ERROR:', err);
});

process.on('uncaughtException', err => {
  console.log('CRASH ERROR:', err);
});

const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const Canvas = require('canvas');

// =====================
// BOT CLIENT (FIXED INTENTS)
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages // مهم للإرسال
  ],
  partials: [Partials.GuildMember]
});

// =====================
// CONFIG
// =====================
const WELCOME_CHANNEL_ID = "1482312577886191697";
const MEMBER_ROLE_ID = "1499559273783365785";

// =====================
// READY EVENT (UPDATED)
// =====================
client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =====================
// WELCOME SYSTEM (FIXED)
// =====================
client.on('guildMemberAdd', async (member) => {
  console.log(`👤 ${member.user.tag} joined ${member.guild.name}`);

  try {
    // =====================
    // GIVE ROLE
    // =====================
    const role = member.guild.roles.cache.get(MEMBER_ROLE_ID);

    if (role) {
      await member.roles.add(role);
    } else {
      console.log("❌ Role not found");
    }

    // =====================
    // GET CHANNEL
    // =====================
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.log("❌ Welcome channel invalid");
      return;
    }

    const memberCount = member.guild.memberCount;

    // =====================
    // CANVAS IMAGE
    // =====================
    const canvas = Canvas.createCanvas(800, 300);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 800, 300);
    gradient.addColorStop(0, "#1f1c2c");
    gradient.addColorStop(1, "#928dab");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 45px sans-serif";
    ctx.fillText("WELCOME", 280, 60);

    ctx.font = "25px sans-serif";
    ctx.fillText(`Nav: ${member.user.username}`, 250, 130);
    ctx.fillText(`ID: ${member.user.id}`, 250, 170);
    ctx.fillText(`Members: ${memberCount}`, 250, 210);

    const buffer = canvas.toBuffer();

    // =====================
    // EMBED
    // =====================
    const embed = new EmbedBuilder()
      .setColor(0x00ffcc)
      .setTitle("🎉 Welcome!")
      .setDescription(
        `👋 Welcome <@${member.user.id}>\n\n` +
        `👤 Name: ${member.user.tag}\n` +
        `🆔 ID: ${member.user.id}\n` +
        `👥 Members: ${memberCount}`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setImage("attachment://welcome.png")
      .setTimestamp();

    // =====================
    // SEND MESSAGE
    // =====================
    await channel.send({
      content: `👋 Welcome <@${member.user.id}>!`,
      embeds: [embed],
      files: [{ attachment: buffer, name: "welcome.png" }]
    });

    console.log("✅ Welcome sent");

  } catch (err) {
    console.log("❌ Error:", err);
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.TOKEN);
