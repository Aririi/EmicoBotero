'use strict';

const xkcd = require('xkcd');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const { color3 } = require('../config.json');

module.exports = {
	name: 'xkcd',
	description: 'Fetches XKCD comics. Provide \'latest\' to get the most recent, a specific number, or nothing to get a random one.',
	usage: '<latest/number>',
	execute(message, args) {
		let title;

		// checks if a number or 'latest' was provided, fetching each respectively
		if (!isNaN(args[0])) {return checkNum();}
		else if (args[0] === 'latest') {return getLatest();}
		// if no argument was provided, get a random comic
		getRandom();


		// gets the latest comic from XKCD
		function getLatest() {
			title = 'Latest:';
			return xkcd(function(comic) {sendEmbed(comic, title);});
		}
		// gets the most recent comic to determine the latest issue, then pick a random number using RNG to get a random comic
		function getRandom() {
			xkcd(function(comic, rng) {
				rng = Math.ceil(Math.random() * comic.num);
				if (rng > comic.num) {rng--;} title = 'Random XKCD:';
				xkcd(rng, function(comic2) {sendEmbed(comic2, title);});
			});
		}
		// checks the number of the comic provided for validity
		async function checkNum() {
			const check = await fetch(`https://xkcd.com/${args[0]}/`);
			if (check.status === 404) {return message.channel.send(`${message.author.username}: That isn't a valid comic number.`);}
			title = `#${args[0]}:`;
			return xkcd(args[0], function(comic) {sendEmbed(comic, title);},
			);
		}
		// sends the embed containing the resulting comic
		function sendEmbed(comic) {
			const comicEmbed = new Discord.MessageEmbed()
				.setColor(color3)
				.setTitle(`${title} ${comic.title}`)
				.attachFiles(['./icons/xkcd.jpg'])
				.setAuthor('XKCD Comic', 'attachment://xkcd.jpg', `https://xkcd.com/${comic.num}/`)
				.setDescription(comic.alt)
				.setImage(comic.img)
				.setTimestamp()
				.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);
			return message.channel.send(comicEmbed)
				.catch(console.error);
		}
	},
};
