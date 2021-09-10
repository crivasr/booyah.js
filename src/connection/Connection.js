const WebSocket = require("ws");
const ApiController = require("../api/Controller");
const { decodeBufferToJSON } = require("../utils/functions");
const {BadgeCode, msgTypes, maxMessageLength, sendMessageTypes} = require("../utils/constants");

class Connection extends ApiController {
	constructor(channel_id, parent) {
		super(parent.session_key, parent.user_id, parent.device_id);
		this.channel_id = channel_id;
		this.parent = parent;
		this.anon = false;
		this.reconnections = 0;
		this.join();
	}

	heartbeat() {
		this.webSocket.send(JSON.stringify({ msg: "" }));
	}

	sendMessage(message) {
		if (this.anon)
			throw new Error("You can't send messages on an anonymous connection");
		if (message.length > maxMessageLength)
			throw new Error(`Message too long, must be ${maxMessageLength} or fewer in length`);
		const json = { event: sendMessageTypes.message, data: { msg: message } };
		this.webSocket.send(JSON.stringify(json));
		return this;
	}

	sendSticker(sticker_id) {
		if (this.anon)
			throw new Error("You can't send stickers on an anonymous connection");
		const json = {
			event: sendMessageTypes.sticker,
			data: { sticker_id: sticker_id },
		};
		this.webSocket.send(JSON.stringify(json));
		return this;
	}

	async getWsUrl() {
		if (!this.channel) this.channel = await this.getUser(this.channel_id);
		this.token = await this.parent.generateToken();

		if (!this.token) throw new Error("Invalid session_id or user_id");
		const url = `wss://chat.booyah.live:9511/ws/v2/chat/conns?room_id=${this.channel.chatroom_id}&uid=${this.parent.user_id}&device_id=${this.parent.device_id}&token=${this.token}`;

		return url;
	}

	close() {
		this.webSocket.close();
		return this;
	}

	async join() {
		const url = await this.getWsUrl();
		const webSocket = new WebSocket(url);

		webSocket.on("open", () => {
			if (!this.reconnections)
				this.parent.emit("connected", this.channel, this);

			this.hearbeatInterval = setInterval(() => {
				this.heartbeat();
			}, 60 * 1000); //send an empty message every minute to prevent disconnection to the webSocket
		});

		webSocket.on("error", (error) => {
			console.log(`Error from ${this.channel_id}: ${error}`);
		});

		webSocket.on("close", (code) => {
			clearInterval(this.hearbeatInterval);
			if (code != 1006) {
				this.parent.emit("close", this.channel, this);
				delete this.parent.connections[this.channel_id];
				return;
			}

			this.reconnections++;
			this.join();
			this.parent.emit("reconnection", this.channel, this);
		});

		webSocket.on("message", async (buffer) => {
			const messages = decodeBufferToJSON(buffer);

			messages.forEach(async (message) => {
				const isOwner = message.data.badge_list.includes(BadgeCode.owner);

				const isModerator = message.data.badge_list.includes(BadgeCode.moderator) || isOwner;

				const msg = {
					data: message.data,
					event: message.event,
					isModerator: isModerator,
					isOwner: isOwner,
				};

				const self = message.data.uid == this.parent.user_id;

				this.parent.emit("message", msg, this.channel, this, self);
				this.parent.emit(msgTypes[message.event], msg, this.channel, this, self);
			});
		});

		this.webSocket = webSocket;
		return this;
	}
}

module.exports = Connection;
