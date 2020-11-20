require('dotenv').config()
const Discord = require('discord.js');
const axios = require("axios");
const FormData = require("form-data");
const cheerio = require('cheerio');
const URL = require('url').URL;
const Queue = require('promise-queue');
const client = new Discord.Client();

client.on('guildCreate', server => {
    const embed = new Discord.MessageEmbed()
        .setColor('#e1e6ed')
        .setTitle('Giorgio Bot')
        .setDescription('Con questo bot puoi aggiengere un simpatco TTS nei canali vocali, divertiti ;)')
        .addFields({ name: 'Istruzioni', value: 'per usare il bot usa il comando !giorgio seguito dalla frase che vuoi far ripetere' });

    const channel = server.channels.cache.filter(channel => channel.type === 'text').first();
    if (channel)
        channel.send(embed);
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const queue = new Queue(1, Infinity);
let connection = null;

async function playAudio(channel, url) {
    if (!connection)
        connection = await channel.join();

    return new Promise((resolve, reject) => {
        const dispatcher = connection.play(url);
        dispatcher.on("finish", () => {
            if (queue.getQueueLength() === 0) {
                connection.disconnect();
                connection = null;
            }
            resolve();
        });
        dispatcher.on("error", reject);
    });
}

client.on('message', async msg => {
    if (msg.content.startsWith('!giorgio')) {
        const testo = msg.content.substr(8).trim();
        console.log(testo);

        if (testo === '') {
            msg.reply("devi inserire un testo!");
            return;
        }

        const form = new FormData();
        form.append("but", "Invia");
        form.append("but1", testo);

        const risposta = await axios.post("https://readloud.net/italian/22-voce-maschile-giorgio.html", form, { headers: form.getHeaders() });
        const $ = cheerio.load(risposta.data);
        const src = $("#dle-content > article > div.text > center > audio > source").attr("src");

        const url = new URL(src, 'https://readloud.net/').href;
        console.log(url);

        if (msg.member.voice.channel) {
            queue.add(() => playAudio(msg.member.voice.channel, url));
        } else {
            msg.reply("devi essere in un canale vocale!");
        }

        if (msg.deletable)
            msg.delete();
    }
});

client.login(process.env.DISCORD_TOKEN);