const Connection = require("./Connection");

class AnonConnection extends Connection {
	constructor(channel_id, parent) {
		super(channel_id, parent);
		this.anon = true;
	}

	sendMessage() {
		throw new Error("You can't send messages on an anonymous connection");
	}

	sendSticker() {
		throw new Error("You can't send stickers on an anonymous connection");
	}

	punishUser() {
		throw new Error("You can't punish an user on an anonymous connection");
	}

	muteUser() {
		throw new Error("You can't punish an user on an anonymous connection");
	}

	banUser() {
		throw new Error("You can't punish an user on an anonymous connection");
	}

	pardonUser() {
		throw new Error("You can't punish an user on an anonymous connection");
	}

	async getWsUrl() {
		if (!this.channel) await this.getUpdatedChannelInfo();
		const url = `wss://chat.booyah.live:9511/ws/v2/chat/conns?room_id=${this.channel.chatroom_id}&uid=0&device_id=${this.parent.device_id}`;
		return url;
	}
}

module.exports = AnonConnection;
