require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder
} = require('discord.js');

// Initialisation du bot avec les bons intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Connexion réussie
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// ➤ Détection boost réel (rôle attribué automatiquement par Discord)
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    const boosterRoleId = process.env.BOOSTER_ROLE_ID;
    const generalChannelId = process.env.GENERAL_CHANNEL_ID;

    const hadBoost = oldMember.roles.cache.has(boosterRoleId);
    const hasBoost = newMember.roles.cache.has(boosterRoleId);

    // Si le rôle vient d’être ajouté (nouveau boost)
    if (!hadBoost && hasBoost) {
      const embed = new EmbedBuilder()
        .setColor('#ff66cc')
        .setTitle('🚀 MERCI POUR TON BOOST !')
        .setDescription(`**${newMember.user.username}** vient de booster le serveur NXST RP ! 🎉  
Tu es maintenant **VIP** avec accès à une **zone secrète** 💎  
Bienvenue dans l’élite RP 👑`)
        .setThumbnail(newMember.user.displayAvatarURL())
        .setFooter({
          text: 'NXSTxVIP — Accès débloqué',
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      const channel = await newMember.guild.channels.fetch(generalChannelId);
      if (channel) {
        await channel.send({ content: `<@${newMember.id}>`, embeds: [embed] });
        console.log(`📢 Nouveau boost détecté : message envoyé pour ${newMember.user.tag}`);
      } else {
        console.warn("❌ Salon général introuvable.");
      }
    }
  } catch (err) {
    console.error("❌ Erreur dans GuildMemberUpdate :", err);
  }
});

// ➤ Commande !testboost (simulation admin)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = '!';
  const command = message.content.trim().toLowerCase();

  if (command === `${prefix}testboost`) {
    const boosterRoleId = process.env.BOOSTER_ROLE_ID;
    const generalChannelId = process.env.GENERAL_CHANNEL_ID;
    const member = message.member;

    // Vérifie permission admin
    if (!member.permissions.has('Administrator')) {
      return message.reply("⛔ Cette commande est réservée aux administrateurs.");
    }

    try {
      const hasRole = member.roles.cache.has(boosterRoleId);

      if (!hasRole) {
        await member.roles.add(boosterRoleId);
        console.log(`✅ [TESTBOOST] Rôle VIP Booster attribué à ${member.user.tag}`);
      } else {
        console.log(`🔁 [TESTBOOST] ${member.user.tag} avait déjà le rôle VIP Booster`);
      }

      const embed = new EmbedBuilder()
        .setColor('#ff66cc')
        .setTitle('🧪 TEST BOOST SIMULÉ')
        .setDescription(`**${member.user.username}** a simulé un boost Discord pour NXST RP 🎉  
🔓 Le rôle **VIP Booster** a été attribué.  
💬 Un message public vient d’être posté dans le salon général.`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({
          text: 'NXSTxVIP — Simulation de boost',
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      const channel = await message.guild.channels.fetch(generalChannelId);
      if (channel) {
        await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
        await message.reply("✅ Test boost envoyé dans le salon général.");
        console.log(`📨 [TESTBOOST] Embed envoyé dans #général pour ${member.user.tag}`);
      } else {
        await message.reply("❌ Salon général introuvable. Vérifie GENERAL_CHANNEL_ID dans .env.");
        console.warn("⚠️ Salon général introuvable (ID invalide ?)");
      }

    } catch (err) {
      console.error("❌ Erreur lors de l’exécution de !testboost :", err);
      await message.reply("❌ Une erreur est survenue pendant le test.");
    }
  }
});

// Lancement du bot
client.login(process.env.TOKEN);
