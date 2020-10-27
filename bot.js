const Discord = require('discord.js-selfbot');
const cleverbot = require("cleverbot-free");
const client = new Discord.Client();
var fs = require('fs')
var ini = require('ini')

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

var busy = false; // anti-async

client.on('raw', input => { // raw allows me to intercept group chat messages, however no way to send back
    if (input.t == 'MESSAGE_CREATE' && input.d.channel_id == config.channel_id && busy == false) {
        if (input.d.author.id != client.user.id) {
            busy = true;
            var msgContextArray = new Array();
            const channel = client.channels.cache.get(config.channel_id);
            channel.messages.fetch({
                limit: 5
            }).then(messages => {
                messages.forEach(message => msgContextArray.push(message.content)); // gives cleverbot some context!
            })
            channel.startTyping();
            cleverbot(`${input.d.content}`, msgContextArray).then(response => {
                sleep(225 * response.length);
                if ( Math.floor(Math.random() * 100) + 1 < 10 ) { // sometimes just don't respond
                  return;
                } else {
                channel.send(`${response.toLowerCase()}`);
              }
            });
            channel.stopTyping();
            busy = false;
        }
    }
});

client.login(config.token);
