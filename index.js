const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const pino = require("pino")
const chalk = require("chalk")
const readline = require("readline");

const usePairingCode = true

async function question(params) {
process.stdout.write(params)
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
})

return new Promise((resolve) => rl.question("", (ans) => {
rl.close()
resolve(ans)
}))
}

function blinkTextStable(text, times = 6, interval = 500) {
  let count = 0;
  const blink = setInterval(() => {
    process.stdout.write('\x1B[2K\r'); // Clear baris saat ini
    if (count % 2 === 0) {
      process.stdout.write(chalk.cyan(text));
    }
    count++;
    if (count >= times) {
      clearInterval(blink);
      process.stdout.write('\x1B[2K\r' + chalk.cyan(text) + '\n'); // Cetak final
    }
  }, interval);
}

async function connectToWhatsApp() {
console.log(chalk.blueBright.bold("🔗 Memulai Koneksi Ke WhatsApp"))

const { state, saveCreds } = await useMultiFileAuthState("./radendev")
const { version } = await fetchLatestBaileysVersion()

const raden = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: !usePairingCode,
auth: state,
browser: ["Ubuntu", "Chrome", "20.0.04"],
version
})

raden.ev.on("creds.update", saveCreds)

const { handler, readDatabase, saveDatabase } = require("./raden")
const originalSendMessage = raden.sendMessage.bind(raden);

raden.sendMessage = async function (jid, content, options) {
  const timeStr = new Date().toLocaleString();
  let msgText = "";

  // Ambil isi pesan teks
  if (content.text) {
    msgText = content.text;
  } else if (content.caption) {
    msgText = content.caption;
  } else if (content.image) {
    msgText = "[Gambar]";
  } else if (content.video) {
    msgText = "[Video]";
  } else {
    msgText = "[Tipe Pesan Tidak Dikenal]";
  }

  // Cetak log PESAN BOT
  console.log(chalk.magenta.bold("PESAN BOT :"), chalk.white(msgText), chalk.gray(`(${timeStr})`));

  return await originalSendMessage(jid, content, options);
}
raden.ev.on("messages.upsert", async ({ messages, type }) => {
  const m = messages[0];
  const from = m?.key?.remoteJid || '';

  // Filter pesan sistem/broadcast dan pesan dari bot sendiri
  const isUserChat = from.endsWith('@s.whatsapp.net') || from.endsWith('@g.us');
  if (!m.message || m.key.fromMe || !isUserChat) return;

  // Ambil waktu pesan
  const timestampSeconds = m.messageTimestamp || (m.messageTimestampLow || Math.floor(Date.now() / 1000));
  const time = new Date(timestampSeconds * 1000);
  const timeStr = time.toLocaleString();

  // Ambil isi pesan
  const messageText = m.message.conversation 
    || m.message.extendedTextMessage?.text 
    || "[Tipe pesan lain]";

  // Log dengan warna dan format baru
  console.log(chalk.blueBright.bold("PESAN DARI :"), chalk.cyan(from));
  console.log(chalk.green.bold("ISI PESAN :"), chalk.white(messageText), chalk.gray(`(${timeStr})`));

  try {
    await handler(raden, m);
  } catch (err) {
    console.error("Handler Error:", err);
  }
});

raden.ev.on("connection.update", (update) => {
const { connection } = update
if (connection === "close") {
console.log(chalk.red.bold("❌ Koneksi Terputus, mencoba menyambung ulang..."))
connectToWhatsApp()} else if (connection === "open") {
  console.log(chalk.green.bold("✔️ Bot Terhubung ke WhatsApp"));
  setTimeout(() => {
    console.log(chalk.white(`
   ___          __           ___          
  / _ \\___ ____/ /__ ___    / _ \\___ _  __
 / , _/ _ \`/ _  / -_) _ \\  / // / -_) |/ /
/_/|_|\\_,_/\\_,_/\\__/_//_/ /____/\\__/|___/ 
                                          
`));
blinkTextStable("Memindai Pesan Baru");
  }, 1500); // Delay ini bagus
}

})

if (usePairingCode && !raden.authState.creds.registered) {
console.log(chalk.green.bold("📞 Masukan Nomor Bot 62xxx"))
const phoneNumber = await question("> ")
const code = await raden.requestPairingCode(phoneNumber.trim())
console.log(chalk.cyan.bold(`👾 Kode Pairing: ${code}`))
}

raden.ev.on("group-participants.update", async (update) => {
  try {
    const { id, participants, action } = update;

    const db = readDatabase();
    const groupMetadata = await raden.groupMetadata(id);

    // === WELCOME ===
    if (action === 'add') {
  if (!db.groups || !db.groups[id]) return;

  for (let user of participants) {
    const tag = `@${user.split("@")[0]}`;
    const rawMsg = db.groups[id].welcome
      ? db.groups[id].welcome
      : `Halo @user, Selamat Datang Di Grup @group!`;

    const msg = rawMsg
      .replace(/@user/gi, tag)
      .replace(/@group/gi, groupMetadata.subject);

    await raden.sendMessage(id, {
      text: msg,
      mentions: [user]
    }, {
      quoted: {
        key: {
          fromMe: false,
          remoteJid: id,
          participant: user
        },
        message: {
          extendedTextMessage: {
            text: `@${tag} telah bergabung`,
            contextInfo: {
              mentionedJid: [user]
            }
          }
        }
      }
    });
  }
}

    // === LEAVE ===
    if (action === 'remove') {
  if (!db.groups || !db.groups[id]) return;

  for (let user of participants) {
    const tag = `@${user.split("@")[0]}`;
    const rawMsg = db.groups[id].leave
      ? db.groups[id].leave
      : `@user Telah Meninggalkan Grup @group.`;

    const msg = rawMsg
      .replace(/@user/gi, tag)
      .replace(/@group/gi, groupMetadata.subject);

    await raden.sendMessage(id, {
      text: msg,
      mentions: [user]
    }, {
      quoted: {
        key: {
          fromMe: false,
          remoteJid: id,
          participant: user
        },
        message: {
          extendedTextMessage: {
            text: `@${tag} telah keluar`,
            contextInfo: {
              mentionedJid: [user]
            }
          }
        }
      }
    });
  }
}

  } catch (err) {
    console.error("[GROUP PARTICIPANTS UPDATE ERROR]", err);
  }
});

raden.ev.on('call', async (calls) => {
  try {
    const db = readDatabase();
    if (!db.settings) db.settings = { anticall: false };
    if (!db.settings.anticall) return;

    for (const call of calls) {
      const caller = call.from;
      if (call.status === 'offer') {
        // Tolak panggilan
        await raden.rejectCall(call.id, caller);

        // Kirim pesan peringatan
        await raden.sendMessage(caller, {
          text: `\`\`\`DILARANG MENELPON NOMOR INI, SILAHKAN KETIK DAN KIRIM\`\`\` *HELP* \`\`\`ATAU\`\`\` *OWNER* \`\`\`UNTUK MENGHUBUNGI OWNER\`\`\`\n\`\`\`JIKA URGENT SILAHKAN HUBUNGI OWNER\`\`\``
        });
      }
    }
  } catch (err) {
    console.error("[ANTICALL ERROR]", err);
  }
});

}

connectToWhatsApp()