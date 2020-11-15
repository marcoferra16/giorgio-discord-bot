require('dotenv').config()
const Discord = require('discord.js');
const axios = require("axios");
const FormData = require("form-data");
const cheerio = require('cheerio');
const URL = require('url').URL;
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

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
            const connection = await msg.member.voice.channel.join();
            const dispatcher = connection.play(url);
            dispatcher.on("finish", () => connection.disconnect());
        } else {
            msg.reply("devi essere in un canale vocale!");
        }

    }
});

client.login(process.env.DISCORD_TOKEN);