const {
  default: baileysMessage
  } = require("@whiskeysockets/baileys")
  const {
    downloadMediaMessage
  } = require('@whiskeysockets/baileys')
  const {
    ownerNumber,
    ownerName,
    botNumber,
    botName,
    botVersion,
    load,
    data,
    gagal,
    systemerr,
    linkerr,
    usererr,
    dataerr,
    groupOnly,
    adminOnly,
    ownerOnly,
    privatOnly,
    botAdmin
  } = require("./config")
  const {
  default: fetch
  } = require('node-fetch')
  const os = require("os")
  const moment = require('moment-timezone');
  const cheerio = require('cheerio')
  const axios = require('axios')
  const fs = require("fs")
  const ffmpeg = require('fluent-ffmpeg');
  const path = require('path');
  const { spawn } = require("child_process");
  const { execSync } = require("child_process");
  const tmp = require("tmp");
  const sharp = require("sharp")
  const { randomUUID } = require("crypto");
  const thumMenu = fs.readFileSync("./media/raden.png")
  const databasePath = path.join(__dirname, './database/database.json');
  moment.tz.setDefault('Asia/Jakarta');
  const {
    toAudio
  } = require('./lib/converter');
  const API_KEY_WIRO = "qa29e4vlarzzdgrnhpmes3xi5dj64y8x"; // Ganti sesuai kebutuhan
  async function adminGroup(m, raden) {
    let groupMetadata = await raden.groupMetadata(m.chat)
    let groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
    return groupAdmins.includes(m.sender)
  }
  const readDatabase = () => {
    if (!fs.existsSync(databasePath)) {
      fs.writeFileSync(databasePath, JSON.stringify({
        groups: {}
      }));
    }
    const data = fs.readFileSync(databasePath);
    return JSON.parse(data);
  };
  
  const saveDatabase = (data) => {
    fs.writeFileSync(databasePath, JSON.stringify(data, null, 2));
  };

async function urlToSticker(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(res.data, "binary");

  const tmpFile = tmp.tmpNameSync({ postfix: ".webp" });
  await sharp(imageBuffer)
    .resize(512, 512, { fit: 'contain' })
    .webp()
    .toFile(tmpFile);

  return fs.readFileSync(tmpFile);
}
async function handler(raden, m) {
  const db = readDatabase();
  
    const getBuffer = async (url) => {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return res.data;
};
    const msg = m.message
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const senderNumber = sender.split("@")[0];
    const userName = m.pushName
    const isOwner = ownerNumber.includes(senderNumber)
    const ownerJid = ownerNumber + '@s.whatsapp.net'
    const contOwn = ownerNumber[0]
    const nameOwn = ownerName
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    const isPrivat = !isGroup
    if (!db.settings) db.settings = { anticall: false };
    if (typeof db.settings.roomgemini1 === "undefined") db.settings.roomgemini1 = {};
    if (isOwner && !db.settings.roomgemini1[sender]) {
  db.settings.roomgemini1[sender] = false;
}
    if (typeof db.settings.autoread === "undefined") db.settings.autoread = false;

    const time = moment().format('HH:mm:ss');
    const type = Object.keys(msg || {})[0]
    const body = type === "conversation"
    ? msg.conversation: type === "extendedTextMessage"
    ? msg.extendedTextMessage.text: type === "imageMessage"
    ? msg.imageMessage.caption: type === "videoMessage"
    ? msg.videoMessage.caption: type === "documentMessage"
    ? msg.documentMessage.caption: type === "messageContextInfo"
    ? msg.buttonsResponseMessage?.selectedDisplayText: "";
    const getQuotedText = (m) => {
      const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg) return null;

      const quotedType = Object.keys(quotedMsg)[0];
      switch (quotedType) {
      case 'conversation':
        return quotedMsg.conversation;
      case 'extendedTextMessage':
        return quotedMsg.extendedTextMessage.text;
      case 'imageMessage':
        return quotedMsg.imageMessage.caption || '[Media Gambar]';
      case 'videoMessage':
        return quotedMsg.videoMessage.caption || '[Media Video]';
      case 'documentMessage':
        return quotedMsg.documentMessage.caption || '[Dokumen]';
      default:
        return '[Pesan tidak dikenali]';
      }
    };
    const groupMetadata = isGroup ? await raden.groupMetadata(from): {};
    const participants = isGroup ? groupMetadata.participants.map(u => u.id): [];
    const groupAdmins = isGroup ? groupMetadata.participants
    .filter(p => p.admin !== null)
    .map(p => p.id): []

    const isBotAdmin = isGroup ? groupAdmins.includes(botNumber + '@s.whatsapp.net'): false
    const isAdmin = isGroup ? groupAdmins.includes(sender): false
    const hideTag = (text) => {
      return raden.sendMessage(from, {
        text,
        mentions: participants
      }, {
        quoted: m
      });
    };
    const command = body.split(" ")[0].toLowerCase().trim();
    const text = body.split(" ").slice(1).join(" ");
    const reply = (text) => {
      return raden.sendMessage(from, {
        text
      }, {
        quoted: m
      })
    }
    const tagReply = (text) => {
      return raden.sendMessage(from, {
        text,
        mentions: [sender]
      }, {
        quoted: m
      })
    }
    const sekarang = new Date();
    const hari = sekarang.toLocaleDateString('id-ID', {
      weekday: 'long'
    });

    const tanggal = sekarang.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const tanggalHari = `${hari}, ${tanggal}`;

    const tanggalHariJam = new Date().toLocaleString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    

    const sendMedia = async (type, urlOrBuffer, caption) => {
      return raden.sendMessage(from, {
        [type]: urlOrBuffer,
        caption
      }, {
        quoted: m
      });
    }

    const sendSticker = async (buffer) => {
      return raden.sendMessage(from, {
        sticker: buffer
      }, {
        quoted: m
      });
    }

    const isQuoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const isQuotedVideo = isQuoted?.mimetype?.includes('video')
    const isQuotedAudio = isQuoted?.mimetype?.includes('audio')
    const quoted = m.quoted ||
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    const logError = (msg, err) => {
      console.log(`[ERROR] [${moment().format('HH:mm:ss')}] ${msg}\n${err?.stack || err}`);
    }
    const groupId = from; // ID grup
    if (m.messageStubType === 8 && db.settings?.anticall) {
  const callerId = m.key.participant || m.key.remoteJid;

  // Tolak panggilan
  try {
    await raden.rejectCall(m.key.id, callerId);
  } catch (err) {
    console.error("Gagal tolak panggilan:", err);
  }

  await raden.sendMessage(callerId, {
    text: 'DILARANG MENELPON NOMOR BOT, SILAHKAN KETIK *HELP* ATAU *MENU !!*'
  }, { quoted: m });
}
if (db.settings.autoread) {
  try {
    await raden.readMessages([m.key]);
  } catch (err) {
    console.error("Gagal autoread:", err);
  }
}

    if (!db.groups) db.groups = {};
    if (!db.groups[groupId]) {
      db.groups[groupId] = {
      products: {},
      welcome: null,
      leave: null,
      welcome_active: true,
      leave_active: true
      };
    }
    

    
    
    
    switch (command) {
      
      
      
      
    case 'bot': {
        return tagReply(`🤖 : *Hallo kak @${sender.split('@')[0]} !!*\n\nAku *_${botName}_*, Aku adalah asisten chat yang dibuat dan dikembangkan oleh Raden👑\n\nJIKA PERLU BANTUAN BISA KETIK *HELP*`)
      }
      break

    case 'owner':
    case 'own': {
  const number = ownerNumber[0]; // contoh: "6281234567890"
  const displayName = "Raden Dev";

  return raden.sendMessage(from, {
    contacts: {
      displayName: displayName,
      contacts: [{
        vcard: `BEGIN:VCARD
VERSION:3.0
FN:${displayName}
TEL;type=CELL;type=VOICE;waid=${number}:+${number}
END:VCARD`
      }]
    }
  }, { quoted: m });
}

    case 'ping':
    case 'runtime':
    case 'status':
    case 'device': {
        const {
          performance
        } = require('perf_hooks');

        const start = performance.now();

        const runtime = () => {
          const seconds = process.uptime();
          const h = Math.floor(seconds / 3600);
          const m = Math.floor((seconds % 3600) / 60);
          const s = Math.floor(seconds % 60);
          return `${h} jam, ${m} menit, ${s} detik`;
        };

        const formatBytes = (bytes) => {
          const sizes = ['Bytes',
            'KB',
            'MB',
            'GB',
            'TB'];
          if (bytes === 0) return '0 Byte';
          const i = Math.floor(Math.log(bytes) / Math.log(1024));
          return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
        };

        const used = process.memoryUsage();
        const totalRam = os.totalmem();
        const freeRam = os.freemem();
        const usedRam = totalRam - freeRam;
        const cpu = os.cpus()[0].model;
        const core = os.cpus().length;

        const end = performance.now();
        const speed = (end - start).toFixed(3);

        const info = `📊 *STATUS ${botName}*

⏱ *Runtime:* ${runtime()}
⚡ *Response Speed:* ${speed} ms
📅 *Date:* ${tanggalHari}
⏰ *Time:* ${time} WIB

🖥️ *System Memory:*
• Total      : ${formatBytes(totalRam)}
• Used       : ${formatBytes(usedRam)}
• Available  : ${formatBytes(freeRam)}

🧾 *Bot Memory (Node.js):*
• RSS        : ${formatBytes(used.rss)}
• Heap Used  : ${formatBytes(used.heapUsed)}

🛠 *Node.js Version:* ${process.version}
💻 *CPU:* ${cpu}
⚙️ *CPU Cores:* ${core}\n`;

        return reply(info);
      }
      break;
    case 'sewa':
    case 'sewabot': {
        reply(`_*sᴇᴡᴀ ʙᴏᴛ ᴡʜᴀᴛsᴀᴘᴘ*_

𝙼𝚎𝚗𝚐𝚐𝚞𝚗𝚊𝚔𝚊𝚗 𝚓𝚊𝚜𝚊 𝚜𝚎𝚠𝚊
𝚋𝚘𝚝 𝚋𝚒𝚜𝚊 𝚖𝚎𝚖𝚋𝚊𝚗𝚝𝚞 𝚊𝚗𝚍𝚊
𝚞𝚗𝚝𝚞𝚔 𝚋𝚎𝚛𝚓𝚞𝚊𝚕𝚊𝚗 𝚍𝚒 𝚐𝚛𝚞𝚙

*ʜᴀʀɢᴀ sᴇᴡᴀ ʙᴏᴛ*
*𝟷* 𝑴𝒊𝒏𝒈𝒈𝒖 𝑹𝒑 ~*_𝟻.𝟶𝟶𝟶_*~  » 𝑹𝒑 *_𝟺.𝟶𝟶𝟶_*
*𝟷* 𝑩𝒖𝒍𝒂𝒏 𝑹𝒑 ~*_𝟷𝟸.𝟶𝟶𝟶_*~  » 𝑹𝒑  *_𝟷𝟶.𝟶𝟶𝟶_*
*𝟹* 𝑩𝒖𝒍𝒂𝒏 𝑹𝒑 ~*_𝟹𝟶.𝟶𝟶𝟶_*~ » 𝑹𝒑 *_𝟸𝟻.𝟶𝟶𝟶_*

╔═════ \`INFO BOT\` ═════
║ 🔰𝐍𝐚𝐦𝐚 𝐁𝐨𝐭 : *𝐁𝐨𝐭 𝐑𝐚𝐝𝐞𝐧 𝐒𝐭𝐨𝐫𝐞*
║ 🔰𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : 𝟏.𝟎.𝟎
║ 🔰𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 : 𝐑𝐚𝐝𝐞𝐧

╔════ \`𝐅𝐈𝐓𝐔𝐑 𝐒𝐄𝐖𝐀\` ════
║🛒 *GROUP STORE MENU*
║🔧 *TOOLS MENU*
║🔍 *SEARCH MENU*
║📥 *DOWNLOADER*
║🎮 *GAME MENU*
║🔫 *FUN MENU*
║👀 *STALKER MENU*
║⚙️ *MENU UMUM LAINNYA*`)
      }
      break
    case 'help': {
        reply("Sabar Bot Lagi di benerin")
      }
      break
    case 'tiktok':
case 'tt':
case 'ttdl':
case 'ttdown':
case 'tiktokmp4':
case 'tiktokvideo': {
  if (!text) return reply(`Kirim link TikTok!\n\nContoh: https://vt.tiktok.com/xxx`);
  if (!text.includes('tiktok.com')) return reply(linkerr);

  await reply(load);

  try {
    const v5Url = `https://api.tiklydown.eu.org/api/download/v5?url=${encodeURIComponent(text)}`;
    const res = await fetch(v5Url);
    const json = await res.json();

    if (!json?.result) return reply(gagal);
    const result = json.result;

    const title = result.title || 'Tidak ada judul';
    const author = result.author?.nickname || result.author?.unique_id || '-';
    const stats = {
      likeCount: result.digg_count || '-',
      commentCount: result.comment_count || '-',
      shareCount: result.share_count || '-',
      playCount: result.play_count || '-',
    };
    const duration = result.duration || '-';
    const createdAt = result.create_time ? moment.unix(result.create_time).format('YYYY-MM-DD') : '-';

    const caption = `✨ *TIKTOK ${result.images ? 'FOTO' : 'VIDEO'} DOWNLOADER* ✨

📌 Judul: ${title}
👤 Author: ${author}
❤️ Likes: ${stats.likeCount}
💬 Komentar: ${stats.commentCount}
🔁 Share: ${stats.shareCount}
▶️ Views: ${stats.playCount}
⏱ Durasi: ${duration}
📆 Upload: ${createdAt}`;

    // === Jika Konten Gambar ===
    if (Array.isArray(result.images) && result.images.length) {
      console.log('📸 Menggunakan API v5 - Tipe: Foto');
      await reply(`Mengirim ${result.images.length} foto...`);
      for (let img of result.images) {
        await raden.sendMessage(from, {
          image: { url: img },
          caption: caption
        }, { quoted: m });
      }
      return;
    }

    // === Jika Konten Video ===
    const videoUrl = result.play || result.hdplay || result.wmplay;
    if (!videoUrl || !videoUrl.includes('tiktokcdn')) {
      console.warn('❌ Video tidak valid di v5:', videoUrl);
      return reply('*_Maaf, video tidak tersedia atau gagal diproses._*');
    }

    console.log('🎬 Menggunakan API v5 - Tipe: Video');
    await raden.sendMessage(from, {
      video: { url: videoUrl },
      caption: caption
    }, { quoted: m });

  } catch (err) {
    console.error('❌ Error TikTok Downloader v5:', err);
    return reply('*_Maaf, terjadi kesalahan saat memproses permintaan TikTok._*');
  }
}
break;

    case 'tiktoksound':
    case 'tiktokaudio':
    case 'tiktokmp3':
    case 'ttsound':
    case 'ttaudio':
    case 'ttmp3': {
        if (!text) return reply(`Contoh: ${command} https://www.tiktok.com/xxx`);
        if (!text.includes('tiktok.com')) return reply(linkerr);

        try {
          reply(load);

          const res = await fetch(`https://api.tiklydown.eu.org/api/download/v5?url=${encodeURIComponent(text)}`);
          const json = await res.json();

          if (!json || json.status !== 200 || !json.result || !json.result.music_info?.play) {
            return reply(gagal);
          }

          const audioUrl = json.result.music_info.play;
          const authorName = json.result.music_info.author || 'TikTok Sound';

          await raden.sendMessage(from, {
            audio: {
              url: audioUrl
            },
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
              externalAdReply: {
                title: authorName,
                body: 'Audio TikTok',
                mediaType: 2,
                sourceUrl: text,
                showAdAttribution: true
              }
            }
          }, {
            quoted: m
          });

        } catch (err) {
          logError('Gagal fetch audio TikTok', err);
          reply(systemerr);
        }
      }
      break;

    case 'tiktokstalk':
    case 'ttstalk':
    case 'stalktt':
    case 'stalktiktok': {
        if (!text) return reply('Contoh: tiktokstalk radenstoreid')

        await reply(data)

        try {
          const res = await fetch(`https://api.tiklydown.eu.org/api/stalk?user=${encodeURIComponent(text)}`)
          const json = await res.json()

          if (json.status !== 200 || !json.data) {
            return reply(usererr)
          }

          const user = json.data.user
          const stats = json.data.stats

          const caption = `*TIKTOK STALKER*

👤 *Username:* @${user.uniqueId}
📛 *Nickname:* ${user.nickname}
🆔 *ID:* ${user.id}
🔐 *secUid:* ${user.secUid}
🌍 *Region:* ${user.region}
🗣️ *Bahasa:* ${user.language}
✅ *Verified:* ${user.verified ? 'Ya': 'Tidak'}
🔒 *Privat:* ${user.privateAccount ? 'Ya': 'Tidak'}
💼 *Akun Komersil:* ${user.commerceUserInfo?.commerceUser ? 'Ya': 'Tidak'}
🧾 *Kategori:* ${user.commerceUserInfo?.category || '-'}
📥 *Download Setting:* ${user.downloadSetting}
📝 *Bio:* ${user.signature || '-'}
🔗 *Bio Link:* ${user.bioLink?.link || '-'}
📆 *Akun Dibuat:* ${new Date(user.createTime * 1000).toLocaleString()}
🎵 *Tab Musik:* ${user.profileTab?.showMusicTab ? 'Aktif': 'Tidak'}
❓ *Tab QnA:* ${user.profileTab?.showQuestionTab ? 'Aktif': 'Tidak'}
📃 *Playlist:* ${user.profileTab?.showPlayListTab ? 'Aktif': 'Tidak'}
🏷️ *Embed Izin:* ${user.profileEmbedPermission === 1 ? 'Diizinkan': 'Tidak'}

📊 *STATISTIK*
👥 *Followers:* ${stats.followerCount.toLocaleString()}
👤 *Following:* ${stats.followingCount.toLocaleString()}
❤️ *Likes:* ${stats.heartCount.toLocaleString()}
🎞️ *Video:* ${stats.videoCount.toLocaleString()}
👫 *Teman:* ${stats.friendCount.toLocaleString()}

🔗 *Link Profil:* https://www.tiktok.com/@${user.uniqueId}`

          const avatar = user.avatarLarger || user.avatarMedium || user.avatarThumb

          await raden.sendMessage(from, {
            image: {
              url: avatar
            },
            caption: caption
          }, {
            quoted: m
          })

        } catch (err) {
          console.error('Error TikTokStalk:', err)
          reply(dataerr)
        }
      }
      break
      case 'ffstalk': {
  if (!text) return reply("Contoh: ffstalk 123456789");
  await reply("Mencari data Free Fire...");

  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "X-Device": randomUUID(),
    };

    // Ambil token
    const tokenResponse = await axios.post("https://api.duniagames.co.id/api/item-catalog/v1/get-token", {
      msisdn: "0812665588",
    }, { headers });

    const token = tokenResponse.data.status.code
      ? null
      : tokenResponse.data.data.token;

    if (!token) return reply("Gagal mendapatkan token.");

    // Proses pencarian user Free Fire
    const result = await axios.post("https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store", {
      productId: 3,
      itemId: 353,
      product_ref: "REG",
      product_ref_denom: "REG",
      catalogId: 376,
      paymentId: 1252,
      gameId: text,
      token,
      campaignUrl: "",
    }, { headers });

    const username = result.data?.data?.gameDetail?.userName;

    if (!username) return reply("User tidak ditemukan.");

    return reply(`🔍 *Free Fire Stalker*\n\n🆔 ID: ${text}\n👤 Nama: ${username}`);
  } catch (e) {
    console.error("FFStalk Error:", e);
    return reply("Terjadi kesalahan saat memproses permintaan.");
  }
}
break;

case 'igstalk': {
  if (!text) return reply(`Contoh: ${command} usernamenya`);

  reply("Sedang mengambil data profil Instagram...");

  try {
    // Coba API utama (insta-stalk)
    const res = await fetch(`https://aemt.me/igstalk?user=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status) throw new Error("Gagal mendapatkan data");

    const caption = `*Username:* ${json.username}
*Nama:* ${json.fullname}
*Bio:* ${json.bio}
*Follower:* ${json.follower}
*Following:* ${json.following}
*Post:* ${json.post}
*ID:* ${json.userid}
*Privasi:* ${json.private ? "Private" : "Publik"}
*Verified:* ${json.verified ? "✅" : "❌"}
`;

    await raden.sendMessage(from, {
      image: { url: json.profile_pic },
      caption
    }, { quoted: m });

    setLimit(m, db); // jika kamu pakai sistem limit
  } catch (err) {
    console.error("IG Stalk Error:", err);
    reply("Username tidak ditemukan atau terjadi kesalahan.");
  }
}
break;

    case 'hidetag':
    case 'h':
    case 'tagall': {
        if (!isGroup) return reply(groupOnly);

        try {
          const targetText = text || getQuotedText(m);
          if (!targetText) return reply("*_Masukan Pesan Atau Reply Pesan!_*");
          await hideTag(targetText);
        } catch (err) {
          logError("Gagal kirim hide tag", err);
          reply("Gagal mengirim pesan dengan hide tag.");
        }
      }
      break;

    case 'add': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly);
  if (!isBotAdmin) return reply(botAdmin);
  if (!text) return reply('Contoh: add 6281234567890');

  const raw = text.replace(/\D/g, '');
  if (raw.length < 9) return reply("Nomor tidak valid.");

  const number = raw + '@s.whatsapp.net';

  try {
    const res = await raden.groupParticipantsUpdate(from, [number], 'add');
    const result = res?.[0];

    if (!result) {
      return reply("Gagal menambahkan. Tidak ada respons dari server.");
    }

    switch (result.status) {
      case 403:
        return raden.sendMessage(from, {
          text: `Gagal menambahkan @${raw} karena pengaturan privasi pengguna.`,
          mentions: [number]
        }, { quoted: m });

      case 409:
        return raden.sendMessage(from, {
          text: `Gagal Menambahkan @${raw} Karena Sudah Ada di Group`,
          mentions: [number]
        }, { quoted: m });

      case 401:
        return raden.sendMessage(from, {
          text: `Gagal Menambahkan @${raw} Karena Privasi`,
          mentions: [number]
        }, { quoted: m });

      default:
        if (result.status >= 400) {
          return raden.sendMessage(from, {
            text: `Gagal menambahkan @${raw}. Terjadi Karena Privasi Atau @${raw} Sudah Ada Di Group!`,
            mentions: [number]
          }, { quoted: m });
        }
    }

    return raden.sendMessage(from, {
      text: `Berhasil Menambahkan @${raw}`,
      mentions: [number]
    }, { quoted: m });

  } catch (err) {
    console.error('Add Error:', err);
    return reply(`Gagal menambahkan @${raw} Pastikan Nomor Benar!`);
  }
}
break;

    case 'kick': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly);
  if (!isBotAdmin) return reply(botAdmin);

  let target;

  // Jika reply pesan
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant;
  }

  // Jika ada @mention
  else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }

  // Jika ada teks nomor (misalnya: kick 628xxxxx)
  else if (text) {
    const nomor = text.replace(/[^0-9]/g, '');
    if (nomor.length < 5) return reply("Nomor tidak valid.");
    target = nomor + '@s.whatsapp.net';
  }

  // Jika tidak ada input sama sekali
  else {
    return reply("Tag, reply, atau masukkan nomor yang mau dikick.");
  }

  // Cegah kick admin
  if (groupAdmins.includes(target)) {
    return reply("Tidak bisa mengeluarkan admin.");
  }

  // Jalankan perintah kick
  try {
    await raden.groupParticipantsUpdate(from, [target], 'remove');
    reply("Sukses mengeluarkan member.");
  } catch (e) {
    console.error("Kick Error:", e);
    reply("Gagal mengeluarkan member.");
  }

  break;
}
    case 'promote': {
        if (!isGroup) return reply(groupOnly)
        if (!isAdmin) return reply(adminOnly)
        if (!isBotAdmin) return reply(botAdmin)

        let target
        if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
          target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (text.match(/\d{5,}/)) {
          target = text.replace(/\D/g, '') + '@s.whatsapp.net'
        } else {
          return reply('Contoh: promote @user atau promote 628xxxxxx')
        }

        try {
          await raden.groupParticipantsUpdate(from, [target], 'promote')
          reply(`Berhasil menjadikan @${target.split('@')[0]} sebagai admin.`, 'extendedTextMessage', {
            contextInfo: {
              mentionedJid: [target]
            }
          })
        } catch (err) {
          console.error('Promote Error:', err)
          reply('Gagal promote member.')
        }
      }
      break

    case 'demote': {
        if (!isGroup) return reply(groupOnly)
        if (!isAdmin) return reply(adminOnly)
        if (!isBotAdmin) return reply(botAdmin)

        let target
        if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
          target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
        } else if (text.match(/\d{5,}/)) {
          target = text.replace(/\D/g, '') + '@s.whatsapp.net'
        } else {
          return reply('Contoh: demote @user atau demote 628xxxxxx')
        }

        try {
          await raden.groupParticipantsUpdate(from, [target], 'demote')
          reply(`Berhasil menghapus admin dari @${target.split('@')[0]}.`, 'extendedTextMessage', {
            contextInfo: {
              mentionedJid: [target]
            }
          })
        } catch (err) {
          console.error('Demote Error:', err)
          reply('Gagal demote member.')
        }
      }
      break
      
    case 'toaudio': {
        if (!m.quoted) return reply('Reply file video atau voice yang ingin dijadikan audio!');
        const mime = m.quoted.mimetype || '';
        if (!/video|audio/.test(mime)) return reply('Reply file video atau voice!');

        reply('Sedang mengkonversi ke audio...');

        try {
          const media = await raden.downloadMediaMessage(m.quoted);
          if (!media) {
            console.log('Media kosong/null!');
            return reply('Gagal mengunduh media!');
          }

          const fs = require('fs');
          const path = require('path');
          const ffmpeg = require('fluent-ffmpeg');

          const inputPath = path.join(__dirname, 'tmp_input');
          const outputPath = path.join(__dirname, 'tmp_output.mp3');

          fs.writeFileSync(inputPath, media);

          ffmpeg(inputPath)
          .audioBitrate(128)
          .toFormat('mp3')
          .save(outputPath)
          .on('end', async () => {
            console.log('Konversi selesai, mengirim...');
            const audioBuffer = fs.readFileSync(outputPath);
            await raden.sendMessage(m.chat, {
              audio: audioBuffer, mimetype: 'audio/mpeg', ptt: false
            }, {
              quoted: m
            });
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err.message);
            reply('Gagal mengkonversi file.');
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          });

        } catch (e) {
          console.error('Try-Catch Error:',
            e.message);
          reply('Terjadi kesalahan saat memproses.');
        }
        break;
      }

    case 'menu':
    case 'allmenu': {
        tagReply(`╔═════ \`USER INFO\` ═════
║ *Name* : \`\`\`${userName}\`\`\`
║ *ID* : *@${sender.split(`@`)[0]}*
║ *DATE* : \`\`\`${tanggalHari}\`\`\`
║ *TIME* : \`\`\`${time} WIB\`\`\`

╔════ \`🤖BOT MENU\` ══
║
║ *RUNTIME*
║ *HELP*
║ *ALLMENU*
║ *BOT*
║
╠══ \`👥GROUP MENU\` ═══
║
║ *HIDETAG*
║ *ADD*
║ *KICK*
║ *PROMOTE*
║ *DEMOTE*
║ *ADDLIST*
║ *UPDATELIST*
║ *LIST*
║ *DELLIST*
║ *DELLISTALL*
║ *SETWELCOME*
║ *SETLEAVE*
║ *VIEWWELCOME*
║ *VIEWLEAVE*
║ *AUTOWELCOME*
║ *AUTOLEAVE*
║
╠══ \`📥DOWNLOAD MENU\` ═══
║
║ *TIKTOK*
║ *TIKTOKSOUND*
║
╠══ \`👀STALK MENU\` ═══
║
║ *TIKTOKSTALK*
║
╠══ \`⚒️TOOLS MENU\` ═══
║
║ *SSWEB*
║ *RVO*
║ *BRAT*
║ *BRATVIDEO*
║
╠══ \`🧠AI MENU\` ═══
║
║ *GEMINI* (2.0 FLASH)
║ *ROOMGEMINI* (2.0 FLASH) 
║ *QWENAI* (QWEN3-30B-A3B)
║ *DEEPSEEKAI* (V3 0324)
║
╠══ \`👑OWNER MENU\` ═══
║
║ *ANTICALL*
║ *AUTOREAD*
║
╚═══ ⟪ ©𝑹𝒂𝒅𝒆𝒏 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓`)
}
break


case 'ss':
case 'ssweb':
case 'screenshotwebsite': {
  if (!text) return reply(`Contoh: ${command} https://linktr.ee/radenstoreid`);

  reply(data);

  try {
    const targetUrl = 'https://' + text.replace(/^https?:\/\//, '');
    const ssUrl = 'https://image.thum.io/get/width/1900/crop/1000/fullpage/' + targetUrl;

    await raden.sendMessage(from, {
      image: { url: ssUrl },
      caption: `Berhasil Screenshot:\n${targetUrl}`
    }, { quoted: m });

  } catch (e) {
    console.error('Gagal ambil screenshot:', e);
    reply('Server screenshot sedang offline atau link tidak valid!');
  }
}
break
  case 'rvo':
case 'readviewonce':
case 'readviewone': {
  const context = m.message?.extendedTextMessage?.contextInfo;
  const quoted = context?.quotedMessage;
  const stanzaId = context?.stanzaId;
  const participant = context?.participant;

  if (!quoted) return reply("Reply pesan *gambar/video sekali lihat* yang ingin kamu buka.");

  try {
    const messageType = Object.keys(quoted)[0];

    if (messageType !== "imageMessage" && messageType !== "videoMessage") {
      return reply("Media yang direply bukan gambar/video.");
    }

    const fakeQuoted = {
      key: {
        remoteJid: from,
        id: stanzaId,
        fromMe: false,
        participant
      },
      message: {
        [messageType]: quoted[messageType]
      }
    };

    const mediaBuffer = await downloadMediaMessage(fakeQuoted, "buffer", {}, { logger: console });

    if (!mediaBuffer) return reply("Gagal mengambil media view-once.");

    if (messageType === "imageMessage") {
      await raden.sendMessage(from, {
        image: mediaBuffer,
        caption: "View-once berhasil dibuka."
      }, { quoted: m });
    } else if (messageType === "videoMessage") {
      await raden.sendMessage(from, {
        video: mediaBuffer,
        caption: "View-once berhasil dibuka."
      }, { quoted: m });
    } else {
      reply("Jenis media tidak dikenali.");
    }

  } catch (err) {
    console.error("ERROR RVO:", err);
    reply("Gagal membuka pesan view-once. Coba dengan media valid.");
  }

  break;
}

case 'qc':
case 'quote':
case 'fakechat': {
  if (!text && !m.quoted) return reply(`Kirim/reply pesan *${command}* teksnya`);

  try {
    await reply("Sebentar, sedang membuat quote...");

    const quotedText = text || (
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
      "[Tidak bisa membaca teks]"
    );

    const avatar = await raden.profilePictureUrl(sender, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');

    const res = await fetch("https://quoted.lyo.su/quote/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "quote",
        format: "png",
        backgroundColor: "#1b1b1b",
        width: 512,
        height: 768,
        scale: 2,
        messages: [
          {
            avatar: true,
            from: {
              id: sender,
              name: userName,
              photo: { url: avatar }
            },
            text: quotedText,
            replyMessage: {}
          }
        ]
      })
    });

    const data = await res.json();
    const buffer = Buffer.from(data.result.image, 'base64');

    await raden.sendMessage(from, {
      sticker: buffer
    }, { quoted: m });

  } catch (err) {
    console.error("Quote Error:", err);
    reply("Gagal membuat quote. Server mungkin sedang bermasalah.");
  }

  break;
}

case 'brat': {
  if (!text && !quoted?.conversation) return reply(`Kirim atau reply teks dengan:\n\n${command} alok`);
  const bratText = text || quoted.conversation;

  reply(load);

  const urls = [
    `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(bratText)}`,
    `https://aqul-brat.hf.space/?text=${encodeURIComponent(bratText)}`
  ];

  for (const url of urls) {
    try {
      const buffer = await urlToSticker(url);
      return await raden.sendMessage(from, { sticker: buffer }, { quoted: m });
    } catch (e) {
      console.error("Gagal dari URL:", url, "\n", e.message);
    }
  }

  reply("Gagal membuat stiker. Semua server brat offline.");
  break;
}

case 'bratvid':
case 'bratvideo': {
  if (!text && (!quoted || !quoted.text)) return reply(`Kirim atau reply pesan *${command} teksnya*`);

  const teks = (quoted ? quoted.text : text).split(' ');
  const tempDir = path.join(__dirname, 'database/sampah');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  try {
    reply(load);

    const framePaths = [];
    for (let i = 0; i < teks.length; i++) {
      const currentText = teks.slice(0, i + 1).join(' ');
      let res;
      try {
        res = await getBuffer('https://brat.caliphdev.com/api/brat?text=' + encodeURIComponent(currentText));
      } catch (e) {
        res = await getBuffer('https://aqul-brat.hf.space/?text=' + encodeURIComponent(currentText));
      }
      const framePath = path.join(tempDir, `${m.sender}-${i}.png`);
      fs.writeFileSync(framePath, res);
      framePaths.push(framePath);
    }

    const fileListPath = path.join(tempDir, `${m.sender}-frames.txt`);
    let list = '';
    for (let file of framePaths) {
      list += `file '${file}'\n`;
      list += `duration 0.5\n`;
    }
    list += `file '${framePaths[framePaths.length - 1]}'\n`;
    list += `duration 2\n`;
    fs.writeFileSync(fileListPath, list);

    const videoOut = path.join(tempDir, `${m.sender}-brat.mp4`);
    const stickerOut = path.join(tempDir, `${m.sender}-brat.webp`);

    // Buat video dari frame
    execSync(`ffmpeg -y -f concat -safe 0 -i "${fileListPath}" -vf fps=15 -pix_fmt yuv420p -c:v libx264 "${videoOut}"`);

    // Konversi video ke stiker WebP
    execSync(`ffmpeg -y -i "${videoOut}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -ss 0 -t 8 -preset default -an -vsync 0 -s 512x512 "${stickerOut}"`);

    // Kirim stiker
    const bufferSticker = fs.readFileSync(stickerOut);
    await raden.sendMessage(from, { sticker: bufferSticker }, { quoted: m });

    // Hapus file sementara
    framePaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath);
    if (fs.existsSync(videoOut)) fs.unlinkSync(videoOut);
    if (fs.existsSync(stickerOut)) fs.unlinkSync(stickerOut);

  } catch (err) {
    console.error("BRAT VIDEO ERROR:", err);
    reply("Terjadi kesalahan saat membuat stiker.");
  }
}
break;
  
      case 'addlist': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly)

  const db = readDatabase();
  if (!db.groups[groupId]) db.groups[groupId] = { products: {} };

  const safeText = typeof text === 'string' ? text.trim() : '';
  const args = safeText.split(" ");
  const key = args.shift()?.toLowerCase();
  const caption = args.join(" ")?.trim();
  
  if (!key) return reply("Contoh: addlist \`KEY\` spasi \`ISI_LIST\`");

if (db.groups[groupId].products[key]) {
  return reply(`Key *${key}* sudah terdaftar!\nGunakan \`updatelist ${key}
  isi baru\` untuk mengubah!`);
}

  const context = m.message?.extendedTextMessage?.contextInfo || {};
  const quotedMsg = context.quotedMessage;
  const stanzaId = context.stanzaId;
  const participant = context.participant;

  const quotedImage = quotedMsg?.imageMessage;
  const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;

  const isImageMessage = m.message?.imageMessage;
  const imageCaption = m.message?.imageMessage?.caption || "";

  // === 1. Reply Gambar ===
  if (quotedImage && key && !caption) {
    try {
      const media = await downloadMediaMessage({
        key: {
          remoteJid: m.chat,
          id: stanzaId,
          fromMe: false,
          participant: participant
        },
        message: {
          imageMessage: quotedImage
        }
      }, "buffer", {}, { logger: console });

      const base64 = media.toString("base64");
      const replyCaption =
      (quotedImage.caption?.toLowerCase().startsWith('addlist') ? '' :
      quotedImage.caption) || '';

      db.groups[groupId].products[key] = {
        type: "image",
        caption: replyCaption,
        data: base64
      };

      saveDatabase(db);
      return reply(`ADDLIST REPLY GAMBAR DENGAN KEY *${key}* BERHASIL`);
    } catch (err) {
      console.error("Gagal ambil gambar reply:", err);
      return reply("GAGAL MENYIMPAN GAMBAR DARI REPLY!");
    }
  }

  // === 2. Kirim Gambar Langsung + Caption (bisa kosong)
  if (isImageMessage && key) {
    try {
      const media = await downloadMediaMessage(m, "buffer", {}, { logger: console });
      const base64 = media.toString("base64");
      const finalCaption = caption || '';

      db.groups[groupId].products[key] = {
        type: "image",
        caption: finalCaption,
        data: base64
      };

      saveDatabase(db);
      return reply(`GAMBAR DENGAN KEY *${key}* BERHASIL DITAMBAHKAN.`);
    } catch (err) {
      console.error("Gagal ambil gambar langsung:", err);
      return reply("GAGAL MENYIMPAN GAMBAR.");
    }
  }

  // === 3. Reply Teks ===
  if (quotedText && key && !caption) {
    db.groups[groupId].products[key] = {
      type: "text",
      content: quotedText
    };
    saveDatabase(db);
    return reply(`ADDLIST REPLY DENGAN KEY *${key}* BERHASIL.`);
  }

  // === 4. Teks Biasa ===
  if (key && caption && !isImageMessage && !quotedImage && !quotedText) {
    db.groups[groupId].products[key] = {
      type: "text",
      content: caption
    };
    saveDatabase(db);
    return reply(`SUKSES ADDLIST DENGAN KEY *${key}*`);
  }

  return reply(`Format salah.\n\n• Teks: *addlist key isi produk*\n• Kirim gambar + caption: *addlist key caption*\n• Kirim gambar + caption kosong: *addlist key*\n• Reply gambar lalu ketik: *addlist key*\n• Reply teks lalu ketik: *addlist key*`);
}
break

  case 'updatelist': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly)

  const db = readDatabase();
  if (!db.groups[groupId]) db.groups[groupId] = { products: {} };

  const safeText = typeof text === 'string' ? text.trim() : '';
  const args = safeText.split(" ");
  const key = args.shift()?.toLowerCase();
  const newCaption = args.join(" ")?.trim();

  if (!key) return reply("Contoh: updatelist \`KEY\` spasi \`LIST_BARU\`");

  if (!db.groups[groupId].products[key]) {
    return reply(`PRODUK DENGAN KEY *${key}* TIDAK DITEMUKAN.`);
  }

  const context = m.message?.extendedTextMessage?.contextInfo || {};
  const quotedMsg = context.quotedMessage;
  const stanzaId = context.stanzaId;
  const participant = context.participant;

  const quotedImage = quotedMsg?.imageMessage;
  const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;

  const isImageMessage = m.message?.imageMessage;
  const imageCaption = m.message?.imageMessage?.caption || "";

  // === 1. Reply Gambar (update isi gambar)
  if (quotedImage && !newCaption) {
    try {
      const media = await downloadMediaMessage({
        key: {
          remoteJid: m.chat,
          id: stanzaId,
          fromMe: false,
          participant: participant
        },
        message: {
          imageMessage: quotedImage
        }
      }, "buffer", {}, { logger: console });

      const base64 = media.toString("base64");const replyCaption = (quotedImage.caption?.toLowerCase().startsWith('updatelist') ? '' : quotedImage.caption) || '';
      

      db.groups[groupId].products[key] = {
        type: "image",
        caption: replyCaption,
        data: base64
      };

      saveDatabase(db);
      return reply(`UPDATELIST REPLY GAMBAR DENGAN KEY *${key}* BERHASIL`);
    } catch (err) {
      console.error("Gagal ambil gambar reply:", err);
      return reply("GAGAL UPDATELIST GAMBAR DARI REPLY!");
    }
  }

  // === 2. Kirim Gambar Langsung + Caption
  if (isImageMessage) {
    try {
      const media = await downloadMediaMessage(m, "buffer", {}, { logger: console });
      const base64 = media.toString("base64");
      const finalCaption = (newCaption || imageCaption ||
      '').toLowerCase().startsWith('updatelist') ? '' : (newCaption ||
      imageCaption || '');

      db.groups[groupId].products[key] = {
        type: "image",
        caption: finalCaption,
        data: base64
      };

      saveDatabase(db);
      return reply(`GAMBAR LANGSUNG DENGAN KEY *${key}* BERHASIL DIPERBARUI.`);
    } catch (err) {
      console.error("Gagal ambil gambar langsung:", err);
      return reply("GAGAL UPDATELIST GAMBAR.");
    }
  }

  // === 3. Reply Teks
  if (quotedText && !newCaption) {
    db.groups[groupId].products[key] = {
      type: "text",
      content: quotedText
    };
    saveDatabase(db);
    return reply(`TEKS HASIL REPLY DENGAN KEY *${key}* BERHASIL DIPERBARUI.`);
  }

  // === 4. Teks Biasa
  if (newCaption) {
    db.groups[groupId].products[key] = {
      type: "text",
      content: newCaption
    };
    saveDatabase(db);
    return reply(`TEKS DENGAN KEY *${key}* BERHASIL DIPERBARUI.`);
  }

  return reply(`Format salah.\n\n• Teks: *updatelist key isi baru*\n• Kirim gambar + caption: *updatelist key caption*\n• Kirim gambar saja: *updatelist key*\n• Reply gambar/teks lalu ketik: *updatelist key*`);
}
break

  case 'dellist': {
    if (!isGroup) return reply(groupOnly);
    if (!isAdmin) return reply(adminOnly)
    const key = text.trim().toLowerCase();

    if (!key) return reply("Contoh: dellist \`KEY\`");

    const db = readDatabase();
    if (!db.groups[groupId] || !db.groups[groupId].products[key]) {
      return reply(`Produk dengan key *${key}* tidak ditemukan.`);
    }

    delete db.groups[groupId].products[key];
    saveDatabase(db);

    reply(`PRODUK DENGAN KEY *${key}* BERHASIL DIHAPUS.`);
    break;
  }
  break
  
  case 'dellistall': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly)

  const db = readDatabase();

  if (!db.groups[groupId] || !db.groups[groupId].products || Object.keys(db.groups[groupId].products).length === 0) {
    return reply("Tidak ada produk yang bisa dihapus di grup ini.");
  }

  // Konfirmasi penghapusan semua list
  db.groups[groupId].products = {};
  saveDatabase(db);

  return reply("BERHASIL MENGAPUS SEMUA LIST DI GROUP INI.");
}
break

  case 'list':
case 'showlist': {
  if (!isGroup) return reply(groupOnly);

  const db = readDatabase();
  const groupData = db.groups[groupId];
  const products = groupData?.products || {};

  const productKeys = Object.keys(products);
  if (productKeys.length === 0) {
    return reply("BELUM ADA LIST YANG DITAMBAHKAN DI GROUP INI");
  }

  const tanggalFormat = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const listHeader = `╔══⟪ \`🛒LIST PRODUK\`
║👤 NAMA : *${userName}*
║👥 GROUP : *${groupMetadata.subject}*
║📆 TANGGAL : *${tanggalFormat}*\n`;

  const productLines = productKeys.map(k => `╠🛍️ *${k.toUpperCase()}*`).join('\n');
  const listFooter = `╚══⟪ *KETIK KEY DIATAS*`;

  const fullMessage = `${listHeader}\n${productLines}\n${listFooter}`;

  return raden.sendMessage(from, {
    text: fullMessage,
    mentions: [sender]
  }, { quoted: m });
}
break

case 'setwelcome': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly);
  if (!text) return reply("Contoh:\n\nsetwelcome HALO @user SELAMAT DATANG DI GROUP @group\n\n@user: MEMBER BARU\n@group: NAMA GROUP");

  db.groups[groupId].welcome = text;
  saveDatabase(db);

  reply("Pesan Welcome Berhasil Disimpan.");
  break;
}
    case 'viewwelcome': {
  if (!isGroup) return reply(groupOnly);

  const msg = db.groups[groupId]?.welcome
    ? db.groups[groupId].welcome
    : "Halo @user, Selamat Datang Di Grup @group!";

  reply(`Pesan welcome:\n${msg}`);
  break;
}

case 'setleave': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly);
  if (!text) return reply("Contoh:\n\nsetleave SAMPAI JUMPA @user DARI GROUP @group");

  db.groups[groupId].leave = text;
  saveDatabase(db);

  reply("Pesan leave berhasil disimpan.");
  break;
}

case 'viewleave': {
  if (!isGroup) return reply(groupOnly);

  const msg = db.groups[groupId]?.leave
    ? db.groups[groupId].leave
    : "@user telah meninggalkan grup @group.";

  reply(`Pesan leave:\n${msg}`);
  break;
}

case 'autowelcome': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly);
  if (!['on', 'off'].includes(text)) return reply("Contoh: autowelcome on / autowelcome off");

  db.groups[groupId].welcome_active = text === 'on';
  saveDatabase(db);

  reply(`Autowelcome telah *${text === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*.`);
  break;
}

case 'autoleave': {
  if (!isGroup) return reply(groupOnly);
  if (!isAdmin) return reply(adminOnly);
  if (!['on', 'off'].includes(text)) return reply("Contoh: autoleave on / autoleave off");

  db.groups[groupId].leave_active = text === 'on';
  saveDatabase(db);

  reply(`Autoleave telah *${text === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*.`);
  break;
}

case 'roomgemini': {
  if (!isPrivat) return reply(privatOnly);
  if (!['on', 'off'].includes(text)) return reply("Contoh: roomgemini1 on / off");

  db.settings.roomgemini1[sender] = text === 'on';
  saveDatabase(db);
  reply(`Fitur Room Gemini 1 telah *${text === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*.`);
  break;
}

case 'gemini': {
  if (!text) return reply("Contoh: gemini Apa itu AI?");

  const apiKey = 'AIzaSyCOcl5S6baSzVPV7wghK0wkms8y3Id_ue0'; // Ganti dengan API key Gemini kamu
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  reply("Tunggu sebentar, sedang dijawab oleh Gemini...");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text }]
          }
        ]
      })
    });

    const data = await response.json();

    if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return reply(data.candidates[0].content.parts[0].text);
    } else {
      console.error("Gemini Error:", data);
      return reply("Gagal mendapatkan jawaban dari Gemini.");
    }
  } catch (err) {
    console.error("Gemini Fetch Error:", err);
    return reply("Terjadi kesalahan saat menghubungi Gemini.");
  }
}
break;

case 'qwen':
case 'qwenai': {
  if (!text) return reply(`Contoh: ${command} Apa itu AI?`);

  const apiKey =
  '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';
  // Ganti dengan API key kamu dari openrouter.ai
  const endpoint = `https://openrouter.ai/api/v1/chat/completions`;

  reply("Tunggu sebentar, sedang dijawab oleh QwenAI...");

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-30b-a3b:free', // Ganti model di sini
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await res.json();
    const replyText = data?.choices?.[0]?.message?.content;

    if (replyText) {
      return reply(replyText);
    } else {
      console.error("OpenRouter Error:", data);
      return reply("Gagal mendapatkan jawaban dari QwenAI.");
    }
  } catch (err) {
    console.error("OpenRouter Fetch Error:", err);
    return reply("Terjadi kesalahan saat menghubungi QwenAI");
  }
}
break;

case 'deepseek':
case 'deepseekai': {
  if (!text) return reply(`Contoh: ${command} Apa itu AI?`);

  const apiKey =
  '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';
  // Ganti dengan API key kamu dari openrouter.ai
  const endpoint = `https://openrouter.ai/api/v1/chat/completions`;

  reply("Tunggu sebentar, sedang dijawab oleh DeepSeek AI...");

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free', // Ganti model di sini
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await res.json();
    const replyText = data?.choices?.[0]?.message?.content;

    if (replyText) {
      return reply(replyText);
    } else {
      console.error("OpenRouter Error:", data);
      return reply("Gagal mendapatkan jawaban dari DeepSeek AI.");
    }
  } catch (err) {
    console.error("OpenRouter Fetch Error:", err);
    return reply("Terjadi kesalahan saat menghubungi DeepSeek AI");
  }
}
break;


case 'anticall': {
  if (!isOwner) return reply(ownerOnly);
  if (!['on', 'off'].includes(text)) return reply("Contoh: anticall on / anticall off");

  db.settings.anticall = text === 'on';
  saveDatabase(db);

  reply(`AntiCall telah *${text === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*.`);
  break;
}

case 'autoread': {
  if (!isOwner) return reply(ownerOnly);
  if (!['on', 'off'].includes(text)) return reply("Contoh: autoread on / autoread off");

  db.settings.autoread = text === 'on';
  saveDatabase(db);

  reply(`AutoRead telah *${text === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*.`);
  break;
}

    default: {
  if (isGroup && body && body.trim().split(/\s+/).length === 1) {
    const key = body.trim().toLowerCase();
    const db = readDatabase();
    const product = db.groups[groupId]?.products?.[key];

    if (product) {
      if (product.type === "image") {
        const buffer = Buffer.from(product.data, "base64");
        return raden.sendMessage(from, {
          image: buffer,
          caption: product.caption
        }, { quoted: m });
      } else if (product.type === "text") {
        return reply(product.content);
      }
    }
  }
}
break
  }
  if (!isGroup && db.settings.roomgemini1[sender]) {
  if (!text) return;

  const apiKey = 'AIzaSyCOcl5S6baSzVPV7wghK0wkms8y3Id_ue0';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    await reply("Sebentar, sedang menjawab...");

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text }]
          }
        ]
      })
    });

    const data = await res.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (replyText) {
      return reply(replyText);
    } else {
      console.error("RoomGemini Error:", data);
      return reply("Gagal mendapatkan jawaban dari Gemini.");
    }
  } catch (err) {
    console.error("RoomGemini Fetch Error:", err);
    return reply("Terjadi kesalahan saat menghubungi Gemini.");
  }
}
  }
  
  module.exports = {
  handler,
  readDatabase,
  saveDatabase
};