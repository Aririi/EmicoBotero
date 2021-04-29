'use strict';

const fetch = require('node-fetch');
const Discord = require('discord.js');
const { name, color3 } = require('../config.json');
const Datastore = require('nedb');
const triviaDB = new Datastore({ filename: './databases/trivia.db' });
const fs = require('fs');
triviaDB.loadDatabase(function(err) {
	if (err) {return console.error(err);}
});

module.exports = {
	name: 'trivia',
	description: 'Gets a random trivia question from OpenTDB.',
	cooldown: 5,
	disabled: true,
	execute(message) {
		// NOTE: This command was pulled from another repo and requires rewriting.
		// More specifically, the answers need to be much more forgiving for punctuation and typos, and the cancel command needs to stop the collector
		let type; let difficulty; let attempts;
		let allAnswers = []; const incorrectAnswers = []; let correctNumber;
		let token;
		let buff; let base64;
		let index; let temp;
		let time; let text;

		// gets the token stored on last run, if none or invalid, will be fetched and stored for later use
		fs.readFile('./databases/trivia_token', (error, txtString) => {
			if (error) {console.error;}
			else {token = txtString.toString(); return getTrivia(token);}
		});

		// if token invalid (code 3 and 4), get new token and rerun triviaGet()
		async function getToken() {
			token = await fetch('https://opentdb.com/api_token.php?command=request')
				.then(response => response.json())
				.catch(console.error);
			token = token.token;
			fs.writeFile('./databases/trivia_token', token, (error) => {if (error) {throw error;} });
			getTrivia();
		}

		// gets the trivia information and starts the game if the token is valid, else gets a new one
		async function getTrivia() {
			const trivia = await fetch(`https://opentdb.com/api.php?amount=1&token=${token}&encode=base64`)
				.then(response => response.json())
				.catch(console.error);
			switch(trivia.response_code) {
			case 0: runTrivia(trivia.results[0]); break;
			case 1 || 2: message.channel.send('The trivia API reported an error.'); break;
			// case 2: message.channel.send('The trivia API reported an error.'); break;
			case 3 || 4: getToken(); console.log('Trivia API: Retrieving new token.'); break;
			// case 4: getToken(); console.log('Trivia API: No more questions. Retrieving new token.'); break;
			}
		}

		async function runTrivia(trivia) {
			// converts the base64 response to utf8
			base64 = trivia.category; buff = Buffer.from(base64, 'base64');
			const category = buff.toString('utf-8');
			base64 = trivia.type; buff = Buffer.from(base64, 'base64');
			type = buff.toString('utf-8');
			base64 = trivia.difficulty; buff = Buffer.from(base64, 'base64');
			difficulty = buff.toString('utf-8');
			base64 = trivia.question; buff = Buffer.from(base64, 'base64');
			const question = buff.toString('utf-8');
			base64 = trivia.correct_answer; buff = Buffer.from(base64, 'base64');
			const correctAnswer = buff.toString('utf-8').trim();
			trivia.incorrect_answers.forEach(answer => {
				base64 = answer; buff = Buffer.from(base64, 'base64');
				incorrectAnswers.push(buff.toString('utf-8'));
			});

			// conditional for question types so possibilities are treated correctly
			if (type === 'multiple') {
				// scrambles the answers for sending in the embed
				// correctNumber is the location of correctAnswer in the array, which is updated as it randomly cycled in a loop
				correctNumber = incorrectAnswers.push(correctAnswer); allAnswers = incorrectAnswers;
				index = Math.floor(Math.random() * (allAnswers.length - 1));
				while (index > 0) {
					index--; correctNumber--;
					temp = allAnswers.shift(); allAnswers.push(temp);
				}
				attempts = allAnswers.length - 2;
				// changes array into Discord formatted string list for the embed
				allAnswers.forEach((item, x) => {
					if (x != 0) {allAnswers = `${allAnswers}\n${x + 1}. – **${item}**`; }
					else {allAnswers = `${x + 1}. – **${item}**`;}
				});
			}
			else if (type === 'boolean') {
				if (correctAnswer == 'True') {
					allAnswers = `1. – **${correctAnswer}**\n2. – **${incorrectAnswers[0]}**`;
					correctNumber = 1;
				}
				else if (correctAnswer == 'False') {
					allAnswers = `1. – **${incorrectAnswers[0]}**\n2. – **${correctAnswer}**`;
					correctNumber = 2;
				}
				attempts = 1;
			}

			// changes decoded text for neatness in embed
			switch(difficulty) {
			case 'easy': difficulty = 'Easy'; break;
			case 'medium': difficulty = 'Medium'; break;
			case 'hard': difficulty = 'Hard'; break;
			}

			const triviaEmbed = new Discord.MessageEmbed()
				.setColor(color3)
				.setAuthor(`${name}'s Trivia Time`, 'attachment://icon64.png')
				.attachFiles(['./icons/icon64.png'])
				.setDescription(question)
				.addFields(
					{ name: 'Possibilities:', value: allAnswers, inline: false },
					{ name: 'Difficulty:', value: `\`${difficulty}\``, inline: true },
					{ name: 'Category:', value: `\`${category}\``, inline: true },
				)
				.setTimestamp()
				.setFooter(
					`${message.author.username}: You have 30 seconds and ${attempts} total attempt(s).`,
					`${message.author.displayAvatarURL({ dynamic:true })}?size=32`);
			await message.channel.send(triviaEmbed);


			// answer section
			// if not in a dm, make stealing possible
			if (message.channel.type != 'dm') {
				message.channel.send('Others may answer after 10 seconds.')
					.then(sentMessage => {
						sentMessage.delete({ timeout: 10 * 1000 });
						time = 0; setTimeout(function() { time = 10; }, 10 * 1000);
					})
					.catch(console.error);
			}

			// starts collector for messages, subtracting attempts as wrong answers are given
			const filter = m => !m.author.bot;
			const collector = message.channel.createMessageCollector(filter, { time: 30 * 1000 });
			let answered = false;
			collector.on('collect', m => {
				text = m.content;
				// once timeout completes, 10 seconds have passed, allowing others to answer
				if (time != 10 && m.author.id != message.author.id) {
					return message.channel.send(`${m.author.username}: Please wait before answering.`)
						.then(sentMessage => sentMessage.delete({ timeout: 3000 }))
						.catch(console.error);
				}
				else if (time === 10 || m.author.id === message.author.id) {
					const cancel = /cancel/gi;
					if (text.match(cancel)) {message.channel.send('Game terminated.'); return answered = true;}
					// one attempt is removed unless answer is correct; if no more attempts, exit the game
					if (answered === false) {
						if (attempts >= 1 && (text == correctAnswer || text == correctNumber)) {
							message.channel.send(`**${m.author.username}** has answered correctly!`); answered = true; return triviaAdd(m);
						}
						else {attempts--;}
						if (attempts >= 1 && text != correctAnswer && text != correctNumber) {
							return message.channel.send(`${m.author.username}: Incorrect answer, there are ${attempts} attempt(s) remaining to get the correct one.`);
						}
						else if (attempts === 0 && text != correctAnswer && text != correctNumber) {
							message.channel.send(`All attempts used. Ending game.\nThe correct answer was "${correctAnswer}" (${correctNumber})`); return answered = true;
						}
						else {return message.channel.send(`Unexpected conditions. Attempts: '${attempts}' Is Answered: '${answered}' Given '${text}' Must be: '${correctAnswer}' or ${correctNumber}`);}
					}
					else {return;}
				}
				else {message.channel.send(`${m.author.username}: Please wait the whole ten seconds.`);}
			});
			setTimeout(function() {
				collector.stop();
				if (answered != true) { return message.channel.send(`Time has run out.\nThe correct answer was "${correctAnswer}" (${correctNumber})`);}
				else {return;}
			}, 30 * 1000);
		}

		// answer correct section
		// adds the stat to the db if answer was correct
		function triviaAdd(m) {
			triviaDB.find({ _id: m.author.id }, function(err, docs) {
				if (err) {console.error;}
				// if no matches, create an entry in the db
				if (docs.length === 0) {
					console.log('Trivia DB: Failure to find a matching ID, creating a new entry...');
					triviaDB.insert([{ _id: m.author.id, easy: 0, medium: 0, hard: 0, multiple: 0, boolean: 0, name: m.author.username }], function(err) {
						if (err) {console.error;}
						else {triviaAdd(m);}
					});
				}
				// if a match was found, add a tally to the total for the relevant difficulty
				else {
					let triviaUpdate;
					switch(difficulty && type) {
					case 'Easy' && 'multiple': triviaUpdate = { easy: docs[0].easy + 1, multiple: docs[0].multiple + 1, name: m.author.username }; break;
					case 'Easy' && 'boolean': triviaUpdate = { easy: docs[0].easy + 1, boolean: docs[0].boolean + 1, name: m.author.username }; break;
					case 'Medium' && 'multiple': triviaUpdate = { medium: docs[0].medium + 1, multiple: docs[0].multiple + 1, name: m.author.username }; break;
					case 'Medium' && 'boolean': triviaUpdate = { medium: docs[0].medium + 1, boolean: docs[0].boolean + 1, name: m.author.username }; break;
					case 'Hard' && 'multiple': triviaUpdate = { hard: docs[0].hard + 1, multiple: docs[0].multiple + 1, name: m.author.username }; break;
					case 'Hard' && 'boolean': triviaUpdate = { hard: docs[0].hard + 1, boolean: docs[0].boolean + 1, name: m.author.username }; break;
					}
					triviaDB.update({ _id: m.author.id }, triviaUpdate, {}, function(err) {
						if (err) { message.channel.send('There was an error adding a point to the user.'); console.error; }
						else {return console.log(`Trivia DB: Success in adding 1 to ${difficulty} and ${type}`);}
					});
				}
			});
		}
	},
};
