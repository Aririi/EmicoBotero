'use strict';

const choiceResponses1 = [
	'No, maybe tomorrow.',
	'Are you sure? Well alright.',
	'Oh yes, definitely!',
	'Ah... well, I\'d say wait an hour.',
	'Oh, I\'ve heard about that. You\'ll want to wait until tomorrow.',
	'Boo! No!',
	'Why would you do that when you could do something else instead?',
	'Yes! Do it now!',
	'Hm, yeah okay.',
	'Hm. I can\'t choose. Ask me again in a couple of minutes.',
];
const choiceResponses2 = [
	'Why would you do either of those when you could do something else instead?',
	'Why not both? — Okay, fine: [].',
	'Out of these two choices? I\'d say [].',
];
const choiceResponses = [
	'Why would you do any of those when you could do something else instead?',
	'[] doesn\'t really seem like a good idea right now.',
	'Hm. I can\'t choose. Ask me again in a couple of minutes.',
	'I don\'t think I\'ve heard of [], so probably not.',
	'I\'d advise against [] right now.',
	'Some [] sounds nice.',
	'I\'m 40% for [].',
	'You *could* do [], I guess.',
	'I sense some [] in your future!',
	'[] is for cool kids!',
	'If I had a gold nugget for every time someone asked me about [], I\'d had a have a lot of gold nuggets.',
	'The proof is in the pudding — definitely []. Now please, get it out of my pudding.',
	'I received a message from future you, who said to go with [].',
	'I saw that [] is the best choice in a vision.',
	'You\'ll want to go with [].',
	'It\'s elementary my dear Watson, [] is the obvious choice! Quite a simple deduction, try to keep up.',
	'My grandfather always told me that [] is the way to go!',
	'If I\'ve learned anything in life it\'s that you always pick [].',
	'Once you get a taste of [] you can\'t stop.',
	'Somebody once told me to roll with [].',
	'I heard [] is in these days.',
	'I spy with my robotic eye something beginning with []!',
	'Haven\'t you always gone with []? Hmm, maybe not.',
	'I have a pamphlet that says never to engage in [], so you should definitely do it!',
	'Pretty sure I\'d want you to go with []!',
	'The sands of time whisper to me... they\'re saying [].',
	'I tried reading my tea leaves this morning. There was something about death and doom. Anyways, go with [].',
	'Eeny, meeny, miny, [].',
	'[]\'os, the best choice for a complete breakfast!',
	'Try [], now with 30% fewer deaths caused by negligence!',
	'Hold on tightly! [] is a wild ride!',
	'A wizard is never late, and sometimes engages in some [].',
	'I received a telegram from a long lost relative that just reads []. Weird.',
	'Wait, what was the question again? Uhh... []?',
	'I want a divorce. I\'m taking half the [].',
	'Is it a bird?! Is it a plane?! No, it\'s []!',
];

module.exports = {
	name: 'choose',
	description: 'Chooses between choices using RNG.',
	aliases: ['pick', 'decide'],
	usage: '<a choice>, <more choices, (optional)>',
	args: true,
	cooldown: 1,
	execute(message, args) {

		// determine how many choices there are
		const choices = whatChoices();
		// if there is more than one choice, i.e. it's not a yes/no/maybe question, then choose one of them, else just say yes/no/maybe
		if (choices.length === 1) {return decide();}
		const chosen = makeChoice();
		// chooses a phrase to go along with the choice, depending on how many there were initially, passes that on to make the final response
		if (choices.length === 2) {
			const x = Math.floor(Math.random() * choiceResponses2.length);
			const y = choiceResponses2[x];
			const response = insertChosen(y);
			message.channel.send(`${message.author.username}: ${response}}`);
		}
		else {
			const x = Math.floor(Math.random() * choiceResponses.length);
			const y = choiceResponses[x];
			const response = insertChosen(y);
			message.channel.send(`${message.author.username}: ${response}`);
		}

		// functions
		function whatChoices() {
			let x = args.join(' ');
			x = x.replace('?', '');
			x = x.split(/, or |, | or /gi);
			return x;
		}
		// makes a decision based off of one choice given, then sends the message with that phrase
		function decide() {
			const chosenPhraseNumber = Math.floor(Math.random() * choiceResponses1.length);
			const chosenPhrase = choiceResponses1[chosenPhraseNumber];
			return message.channel.send(`${message.author.username}: ${chosenPhrase}`);
		}
		// picks a random number to select from the array of choices
		function makeChoice() {
			const choiceNumber = Math.floor(Math.random() * choices.length);
			const y = choices[choiceNumber];
			return y;
		}
		// replaces the placeholder 'choice' in the string with the actual choice made by RNG previously
		function insertChosen(z) {
			z = z.replace('[]', chosen);
			return z;
		}
	},

};
