const WebSocket = require("ws");
const { decodeBufferToJSON } = require("../utils/functions");

class Connection {
	constructor(channel_id, parent) {
		this.channel_id = channel_id;
		this.parent = parent;
		this.anon = false;
		this.reconnections = 0;
		this.controller = parent.controller;
		this.join();
	}

	heartbeat() {
		this.webSocket.send(JSON.stringify({ msg: "" }));
	}

	async getUpdatedChannelInfo() {
		this.channel = await this.controller.getUser(this.channel_id);
		return this.channel;
	}

	async getViewersCount() {
		const response = await this.controller.getViewersCount(
			this.channel.chatroom_id
		);
		return response;
	}

	async getAudience() {
		const response = await this.controller.getAudience(
			this.channel.chatroom_id,
			this.channel_id
		);
		return response;
	}

	sendMessage(message) {
		if (message.length > 144)
			throw new Error("Message too long, must be 144 or fewer in length");
		const json = { event: 0, data: { msg: message } };
		this.webSocket.send(JSON.stringify(json));
		return this;
	}

	sendSticker(sticker_id) {
		const json = {
			event: 1,
			data: { sticker_id: sticker_id },
		};
		this.webSocket.send(JSON.stringify(json));
		return this;
	}

	punishUser(uid, type, reason, method = "POST") {
		this.controller.punishUser(
			this.channel.chatroom_id,
			method,
			uid,
			type,
			reason
		);
	}

	muteUser(uid) {
		this.punishUser("POST", uid, 0);
		return this;
	}

	banUser(uid, reason) {
		this.punishUser("POST", uid, 1, reason);
		return this;
	}

	pardonUser(uid) {
		this.punishUser("DELETE", uid, 1);
		return this;
	}

	async getWsUrl() {
		if (!this.channel) await this.getUpdatedChannelInfo();
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
			}, 60 * 1000); //heartbeat every minute to prevent disconnection to the webSocket
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
			await this.getUpdatedChannelInfo();
			const messages = decodeBufferToJSON(buffer);
			messages.forEach(async (message) => {
				const user =
					message.data.uid && message.data.plat == 0
						? await this.controller.getUser(message.data.uid)
						: null;
				const isOwner = message.data.badge_list.includes(201);

				const isModerator = message.data.badge_list.includes(202) || isOwner;

				const msg = {
					data: message.data,
					event: message.event,
					isModerator: isModerator,
					isOwner: isOwner,
					user: user,
				};

				const self = message.data.uid == this.parent.user_id;

				this.parent.emit("message", msg, this.channel, this, self);
			});
		});

		this.webSocket = webSocket;
		await this.getUpdatedChannelInfo();
		return this;
	}
}

module.exports = Connection;
