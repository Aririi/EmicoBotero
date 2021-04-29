const moment = require('moment');
const { timezone } = require('../config.json');

module.exports = {
	name: 'remindme',
	description: 'Reminds you you with a message, given a certain time after sending it.',
	aliases: ['reminder', 'setreminder'],
	usage: '<relative time (ddhhmm)> <reminder>',
	args: true,
	execute(message, args, client, timeDB) {
		// this command will be improved
		let timeNow = Date.now(); const timeRegex = /d|h|m/g;

		// if the first arg contains d, h, or m, then split it apart; otherwise say its invalid
		if (args[0].search(timeRegex) != -1) {
			let dLoc;
			let hSplice;	let hLoc;
			let mSplice;	let mLoc;
			let days = 0; let hours = 0; let minutes = 0;

			// check if day given, if so store it
			if (args[0].includes('d') === true) {
				dLoc = args[0].search('d'); days = args[0].slice(0, dLoc);
				if (days > 365 * 2) {return message.channel.send('Sorry, reminders are limited up to two years from now.');}
			}
			else {dLoc = null;}
			// if there was a day (d) then change where to slice for m, else keep it 0
			if (dLoc != null) {hSplice = dLoc + 1;}
			else {hSplice = 0;}

			// checks for hours and stores
			if (args[0].includes('h') === true) {
				hLoc = args[0].search('h'); hours = args[0].slice(hSplice, hLoc);
				if (hours > 365 * 2 * 24) {return message.channel.send('Sorry, reminders are limited up to two years from now.');}
			}
			else {hLoc = null;}
			// if there was hours (h) then change where to slice for m, else keep it 0
			if (hLoc != null) {mSplice = hLoc + 1;}
			else {mSplice = 0;}

			// check for minutes and store
			if (args[0].includes('m') === true) {
				mLoc = args[0].search('m'); minutes = args[0].slice(mSplice, mLoc);
				if (minutes > 365 * 2 * 24 * 60) {return message.channel.send('Sorry, reminders are limited up to two years from now.');}
				if (minutes <= 1) {return message.channel.send(`${message.author.username} seems to have a short memory... (Reminders must be greater than one minute.)`);}
			}
			else {mLoc = null;}

			// converts the time into ms and adds them together
			days = days * 24 * 60 * 60 * 1000; hours = hours * 60 * 60 * 1000; minutes = parseFloat(minutes).toPrecision(9) * 60 * 1000;
			const timeToAdd = days + hours + minutes; const timeToRemind = timeNow + timeToAdd;
			// adds the reminder to the database with time, ID, and message
			let reminderText = args.shift(); reminderText = args.join(' ');
			let remindDate = moment(timeToRemind).format('LLLL'); remindDate += ` (${timezone})`;
			const reminder = { userID: message.author.id, channelID: message.channel.id, time: timeToRemind, text: reminderText };
			timeDB.insert(reminder, function(err) {
				if (err) {return console.error;}
				else {message.channel.send(`${message.author.username}: I'll remind you about "${reminderText}" on ${remindDate}`); setTimeout(sendReminder, timeToAdd - 1);}
			});
		}
		else {return message.channel.send('Invalid time. See the usage for more info. (Example: 16d32h128m)');}

		// sends reminder once timeout complete
		function sendReminder() {
			timeNow = Math.round(Date.now() / 1000);
			// looks for a matching reminder with time under within 2 seconds in case of rounding
			timeDB.find({ time: { $gte: timeNow - 2 } }, function(err, docs) {
				if (err) {return console.error;}
				// if a reminder was found for that time, send it in the channel it was created
				if (docs[0] != undefined) {
					const reminderToSend = `<@!${docs[0].userID}>: Reminder – ${docs[0].text}`;
					message.channel.send(reminderToSend);
					// removes the reminder from the database, so a match isn't found again
					timeDB.remove({ _id: docs[0]._id }, {}, function(err) {
						if (err) {return console.error;}
					});
				}
			});
		}
	},
};
