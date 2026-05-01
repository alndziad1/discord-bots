const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// =====================
// CONFIG
// =====================
const LOG_CHANNEL_ID = "1482312585977139250";

// =====================
// INVITE CACHE
// =====================
const inviteCache = new Map();

// =====================
// LOAD INVITES
// =====================
async function loadInvites(guild) {
  try {
    const invites = await guild.invites.fetch();

    const map = new Map();
    invites.forEach(inv => {
      map.set(inv.code, inv.uses);
    });

    inviteCache.set(guild.id, map);
  } catch (err) {
    console.log("❌ Invite fetch error:", err.message);
  }
}

// =====================
// READY
// =====================
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  for (const guild of client.guilds.cache.values()) {
    await loadInvites(guild);
  }
});

// =====================
// KEEP CACHE UPDATED
// =====================
client.on('inviteCreate', invite => loadInvites(invite.guild));
client.on('inviteDelete', invite => loadInvites(invite.guild));

// =====================
// MEMBER JOIN
// =====================
client.on('guildMemberAdd', async member => {

  let inviter = "Unknown";

  try {
    const oldData = inviteCache.get(member.guild.id);
    const newInvites = await member.guild.invites.fetch();

    let usedInvite = null;

    newInvites.forEach(inv => {
      const oldUses = oldData?.get(inv.code);

      if (oldUses !== undefined && inv.uses > oldUses) {
        usedInvite = inv;
      }
    });

    if (usedInvite && usedInvite.inviter) {
      inviter = `${usedInvite.inviter.tag}`;
    }

    // update cache
    const updated = new Map();
    newInvites.forEach(inv => {
      updated.set(inv.code, inv.uses);
    });

    inviteCache.set(member.guild.id, updated);

  } catch (err) {
    console.log("❌ Invite tracking error:", err.message);
  }

  console.log(`👤 ${member.user.tag} joined — invited by ${inviter}`);

  // =====================
  // LOG CHANNEL
  // =====================
  try {
    const channel = await member.guild.channels.fetch(LOG_CHANNEL_ID);

    if (channel) {
      channel.send(
        `👤 **${member.user.tag}** joined the server\n📩 Invited by: **${inviter}**`
      );
    }
  } catch (err) {
    console.log("❌ Log channel error:", err.message);
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.TOKEN);