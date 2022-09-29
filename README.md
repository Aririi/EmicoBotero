# EmicoBotero
A cooperative bot development effort for the [Emicord Discord server](https://discord.gg/Eh3Rw6sESd) using JavaScript.

## Setup
### Installation
[Install Node.js](https://nodejs.org/) version `16.9.0` or above.

[Set up your bot application](https://discord.com/developers/docs/getting-started#creating-an-app) and enable the `Message Content` intent in the bot menu. When inviting your bot enable the `bot` and `applications.commands` scopes, and give it the required permissions whose permissions number is `274878032896`. The bot will alert users if it's missing sufficient permissions to execute a command.

Download the repository, open a command line in it, and run `npm install` to download the required packages.

#### Database
~~[Install Redis](https://redis.io/docs/getting-started/)~~ WIP.

### Configuration
Create a file named `.env` and into it put:
```
DISCORD_TOKEN={token}
```
and replace the `{token}` with your bot's token.

If a `config.json` file is not found or if it's erroneous, it will be overwritten with default settings where applicable. It contains the following:
- `developerIds: String | Array<String>` - Who can use developer commands. If left empty, the bot owner and team members can use them.
- `testServer: String | Array<String>` - The IDs of the servers in which the test command will be registered as a guild command, if any is provided.
- `errorChannels: String | Array<String>` - Webhook link(s) to channel where the bot will output error messages, if any are provided.

### Running
Run `npm run prod` to start the bot.

#### Running with PM2

## Features
- [x] Command and event code reloading at runtime
- [ ] Logging error messages in discord channels

## To do list
- Expanding readme to have instructions for setup with PM2 or possibly other process managers
- Making webhook post a plaintext file that includes a stack trace
    - Making a wrapper for logging library to output to discord channels
        - Implementing logging library
- MyAnimeList.net integration
- Command that writes directly to command and event files to enable remote code editing
- Process manager detection in restart.js
- Temporary command disabling
- Maintenance mode
- Setting "custom" status type
- Cache for retaining recently used options in commands
- Updating command data in update.js

## Possible future additions
- Voice channel recording