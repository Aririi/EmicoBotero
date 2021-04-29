'use strict';

const Discord = require('discord.js');
const { color3, name } = require('../config.json');
const sfwClient = require('nekos.life');
const { sfw } = new sfwClient;

module.exports = {
	name: 'random',
	description: 'Uses a few APIs to get random media of the argument given (see usage list).',
	usage: '<avatar/icon/pfp, cat/meow, dog/woof, foxgirl, goose, gecg, kemonomimi, neko/nyan, nekogif/nyangif, waifu] [#(opt)>',
	args: true,
	execute(message, args) {

		randomTypeCheck();
		// checks what argument was specified, if not valid, fail
		function randomTypeCheck() {
			if (args[0] === 'avatar' || args[0] === 'icon' || args[0] === 'pfp') {randomAvatar();}
			else if (args[0] === 'cat' || args[0] === 'meow') {randomCat();}
			else if (args[0] === 'dog' || args[0] === 'woof') {randomDog();}
			else if (args[0] === 'goose' || args[0] === 'geese') {randomGoose();}
			else if (args[0] === 'foxgirl') {randomFoxgirl();}
			else if (args[0] === 'gecg' || args[0] === 'gmo') {randomGECG();}
			else if (args[0] === 'holo') {randomHolo();}
			else if (args[0] === 'kemonomimi') {randomKemonomimi();}
			else if (args[0] === 'lizard') {randomLizard();}
			else if (args[0] === 'neko' || args[0] === 'nyan' || args[0] === 'catgirl') {randomNeko();}
			else if (args[0] === 'nekogif' || args[0] === 'nyangif' || args[0] === 'catgirlgif') {randomNekoGIF();}
			else if (args[0] === 'waifu') {randomWaifu();}
			else if (args[0] === 'wallpaper') {randomWallpaper();}
			else if (args[0] === 'fact') {randomFact();}
			else {message.channel.send(`${message.author.username}: Not a valid kind of media to retrieve.`);}
		}

		// async functions to be executed based on the argument given
		async function randomAvatar() {
			const description = 'Here\'s a random avatar.';
			await sfw.avatar()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomCat() {
			const description = 'Here\'s a random cat.';
			await sfw.meow()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomDog() {
			const description = 'Here\'s a random dog.';
			await sfw.woof()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomFoxgirl() {
			const description = 'Here\'s a random foxgirl.';
			await sfw.foxGirl()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomGoose() {
			const description = 'Here\'s a random goose.';
			await sfw.goose()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomGECG() {
			const description = 'Here\'s a random genetically engineered catgirl.';
			await sfw.gecg()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomHolo() {
			const description = 'Here\'s a random foxgirl.';
			await sfw.holo()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomKemonomimi() {
			const description = 'Here\'s a random kemonomimi.';
			await sfw.kemonomimi()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomLizard() {
			const description = 'Here\'s a random lizard.';
			await sfw.lizard()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomNeko() {
			const description = 'Here\'s a random neko.';
			await sfw.neko()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomNekoGIF() {
			const description = 'Here\'s a random neko GIF.';
			await sfw.nekoGif()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomWaifu() {
			const description = 'Here\'s a random waifu.';
			await sfw.waifu()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomWallpaper() {
			const description = 'Here\'s a random wallpaper.';
			await sfw.wallpaper()
				.then(result => sendEmbed(description, result.url))
				.catch(console.error);
		}
		async function randomFact() {
			await sfw.fact()
				.then(result => message.channel.send(`${message.author.username}: ${result.fact}.`))
				.catch(console.error);
		}

		// sends embed once async resolves with image URL
		function sendEmbed(description, result) {
			const randomMediaEmbed = new Discord.MessageEmbed()
				.setColor(color3)
				.setTitle(`${name}'s Database`)
				.setDescription(description)
				// .addFields({ name: 'Source:', value: result })
				.setImage(result)
				.setTimestamp()
				.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);
			return message.channel.send(randomMediaEmbed)
				.catch(console.error);
		}
	},
};
