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
case 'list':
  reply("List akan segera diperbaiki, mohon menunggu")

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