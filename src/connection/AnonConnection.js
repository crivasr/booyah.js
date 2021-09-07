const Connection = require("./Connection");

class AnonConnection extends Connection {
	constructor(channel_id, parent) {
		super(channel_id, parent);
		this.anon = true;
	}

	async getWsUrl() {
		if (!this.channel) this.channel = await this.getUser(this.channel_id);
		const url = `wss://chat.booyah.live:9511/ws/v2/chat/conns?room_id=${this.channel.chatroom_id}&uid=0&device_id=${this.parent.device_id}`;
		return url;
	}
}

module.exports = AnonConnection;
