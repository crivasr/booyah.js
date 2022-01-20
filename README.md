# booyah.js
This is a work in progress npm module for interacting with the booyah API and chat.

### Getting Started

## Instalation
Install using npm:
```sh
npm install booyah.js
```

## Connect with account

You first need to get your session_key:
<br>
Go to [booyah](https://booyah.live/) and open the DevTool (press `F12`)
<br>
Then go to `Application > Cookies > https://booyah.live/` and search for `session_key`. If you press it, it will show you the full token
<br>
<br>
<img src="https://imgur.com/66gbxMS.png">
<br>
Just copy that and replace `"YOUR_SESSION_KEY"` with that token.
<br>
`"YOUR_USER_ID"` is the id that shows when you got to your [studio](https://booyah.live/mystudio) under your name.

```js
const { Client } = require("booyah.js");

// start the bot with your credentials
const client = new Client("YOUR_SESSION_KEY", "YOUR_USER_ID");

client.connectChannels(["CHANNEL_ID"]);

client.on("chat", async (message, context, connection, self) => {
  //ignore messages sended by the bot
  if (self) return;
  
  const msg = message.data.msg;
  const name = message.data.nickname;
  
  if (msg.toLowerCase() == "hi"){
    connection.sendMessage(`Hello ${name}!`);
    // you can also do:
    // client.sendMessage(context.channel_id, `Hello ${name}!`);
  }
});
```

an other way to get a chat message is this: 

```js
const { Client, Constants } = require("booyah.js");

client.on("message", async (message, context, connection, self) => {
  if (self) return;

  if(Constants.msgTypes[message.event] != "chat") return;
  // TODO
});
```

## Anonymous connection

You can also connect to a chat without those credentials, you can get the messages but you can't send them. Also, some API endpoints requires you to have a session, just like `GET CHATROOMS/${user_id}/AUDIENCES*`.
<br>
<br>
Instead of 

```js
const { Client } = require("booyah.js");

const client = new Client();

client.connectChannels(["CHANNEL_ID"]);
```
use 

```js
const { Client } = require("booyah.js");

const client = new Client();

client.connectChannelsAnon(["CHANNEL_ID"]);
```
If you use the other function it would still work but you'll have this alert when you connect `Missing autentication parameters, starting anonoymous connection`

## Simple command handler

```js
client.on("chat", async (message, context, connection, self) => {
  if (self) return;
  const msg = message.data.msg;

  const args = msg.split(" ");
  const commandName = args.shift();
  
  if (commandName == "!say"){
    connection.sendMessage(`${message.data.nickname} you said: ${args.join(" ")}`);
  }
})
```
More commands
```js
  const isModerator = message.isModerator;

  // ban user by id 
  if (commandName == "!ban" && isModerator) {
    const target = args.shift();
    const reason = args.join(" ");

    connection.banUser(context.channel_id, target, reason).then((ban) => {
      // the banUser function bans an user and it returns a promise with the banned user and the channel where he got banned 
      // same for muteUser and pardonUser
      connection.sendMessage(`${ban.target.nickname} was banned, reason: ${reason}`);
    });
  }

  // unban an user by id
  if (commandName == "!pardon" && isModerator) {
    connection.pardonUser(context.channel_id, args[0]);
  }

  // ban for 10 minutes by id
  if (commandName == "!mute" && isModerator) {
    connection.muteUser(context.channel_id, args[0]);
  }
```














