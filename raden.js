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
  const thumMenu = fs.readFileSync("./media/raden.png")
  const databasePath = path.join(__dirname, './database/database.json');
  moment.tz.setDefault('Asia/Jakarta');
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
    

    
    
    
    switch (command) {
      
      // OWNER MENU
      
      case 'anticall':
  if (!isOwner) return conn.sendMessage(from, { text: 'Fitur ini hanya untuk owner!' }, { quoted: m });

  if (!text) return conn.sendMessage(from, { text: `Ketik *anticall on* untuk aktif atau *anticall off* untuk nonaktif.` }, { quoted: m });

  const setting = readDatabase().settings || {};
  if (text.toLowerCase() === 'on') {
    setting.anticall = true;
    saveDatabase();
    conn.sendMessage(from, { text: '✅ Fitur Anti Call telah *AKTIF*' }, { quoted: m });
  } else if (text.toLowerCase() === 'off') {
    setting.anticall = false;
    saveDatabase();
    conn.sendMessage(from, { text: '❌ Fitur Anti Call telah *NONAKTIF*' }, { quoted: m });
  } else {
    conn.sendMessage(from, { text: 'Format salah! Ketik *anticall on* atau *anticall off*' }, { quoted: m });
  }
  break;
  
  // BOT MENU
  
      case 'halo':
      case 'hai':
        case: 'p': {
          reply(`*Halo kak ${userName}, Selamat Datang di Raden Store*\n> Ketik
          \`raden\` untuk menampilkan menu produk kami\n> Ketik \`help\` untuk panduan menggunakan bot`)
        }
case 'raden':
  case 'menu': {
  reply(`╔═════ \`RADEN MENU\` ═════
║ *DATE* : \`\`\`${tanggalHari}\`\`\`
║ *TIME* : \`\`\`${time} WIB\`\`\`

╔════ \`TOPUP GAME\` ══
║
║ *FREEFIRE*
║ *MOBILELEGEND*
║ *PUBGMOBILE*
║ *HOK*
║
╠══ \`APLIKASI PREM\` ═══
║
║ *ALIGHTMOTION*
║ *CAPCUT*
║ *CANVA*
║ *NETFLIX*
║ *SPOTIFY*
║ *CHATGPT*
║ *BLACKBOXAI*
║ *DISNEY*
║ *YOUTUBE*
║ *BSTATION*
║ *VISION+*
║
╠══ \`MENU PULSA\` ═══
║
║ *PULSATELKOMSEL*
║ *PULSASMARTFREN*
║ *PULSAINDOSAT*
║ *PULSAAXIS*
║ *PULSABYU*
║ *PULSAXL*
║
╠══ \`MENU DATA\` ═══
║
║ *DATATELKOMSEL*
║ *DATASMARTFREN*
║ *DATAINDOSAT*
║ *DATAAXIS*
║ *DATABYU*
║ *DATAXL*
║
╚═══ ⟪ ©𝑹𝒂𝒅𝒆𝒏 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓`)
}
break

//  MENU TOP UP

case 'freefire':
  case 'ff':
    case 'epep':
      case 'topupff':
        case 'topupfreefire': {
          reply(`
╔════ \`MENU FREE FIRE\` ══
║
║ *💎50 = Rp. 7.500*
║ *💎70 = Rp. 10.000*
║ *💎100 = Rp. 14.500*
║ *💎140 = Rp. 18.500*
║ *💎210 = Rp. 29.000*
║ *💎300 = Rp. 40.000*
║ *💎355 =  Rp. 45.500*
║ *💎400 = Rp. 52.500*
║ *💎500 = Rp. 63.000*
║ *💎645 = Rp. 80.000*
║ *💎720 = Rp. 88.000*
║ *💎925 = Rp. 115.000*
║ *💎1000 = Rp. 125.000*
║ *💎1440 = Rp. 178.000*
║ *💎2000 = Rp. 245.000*
║ *💎3000 = Rp. 365.000*
║ *💎4000 = Rp. 490.000*
║ *💎5500 = Rp. 680.000*
║ *💎6000 = Rp. 745.000*
║ *💎7290 = Rp. 888.000*
║ 
║ *MemberMingguan = 29.000*
║ *MemberBulanan = Rp. 81.500*
║
╚═══ ⟪ ©𝑹𝒂𝒅𝒆𝒏 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓`)
        }
        break
        case 'mobilelegend':
  case 'mobile legend':
    case 'ml':
      case 'mlbb':
        case 'topupml': {
          reply(`cooming soon`)
        }
        break 
    default: {
      
    }
break
  }
  
  }
  
  module.exports = {
  handler,
  readDatabase,
  saveDatabase
};