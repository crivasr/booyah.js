const { v1: uuidv1 } = require("uuid");
const apiv3 = require("../utils/RestAPI");
const EventEmiter = require("events");
const { Connection, AnonConnection } = require("../connection");

class Client extends EventEmiter {
	constructor(session_key, user_id) {
		super();
		this.session_key = session_key;
		this.user_id = user_id;
		this.headers = {
			"booyah-session-key": session_key,
			"x-csrf-token": session_key,
			"content-type": "application/json",
			cookie: `session_key=${session_key}`,
		};
		this.device_id = uuidv1();
		this.connections = {};
	}

	sendMessage(channel, message) {
		if (typeof channel == "string" || typeof channel == "number") {
			const connection = this.connections[channel];
			if (!connection) throw new Error(`Not connected to channel ${channel}`);
			connection.sendMessage(message);
			return this;
		} else if (typeof channel == Connection) {
			channel.sendMessage(message);
			return this;
		}
		throw new Error("invalid channel");
	}

	sendSticker(channel, sticker_id) {
		if (typeof channel == String || typeof channel == Number) {
			const connection = this.connections[channel];
			if (!connection) throw new Error(`Not connected to channel ${channel}`);
			connection.sendSticker(sticker_id);
			return this;
		} else if (typeof channel == Connection) {
			channel.sendSticker(sticker_id);
			return this;
		}
		throw new Error("invalid channel");
	}

	async connectChannels(channels) {
		if (!this.session_key || !this.user_id) {
			console.log(
				"Missing autentication parameters, starting annonoymous connection"
			);
			this.connectChannelsAnon(channels);
			return;
		}
		const connections = [];
		channels.forEach((channel) => {
			const connection = new Connection(channel, this);
			this.connections[channel] = connection;
			connections.push(connection);
		});
		return connections;
	}

	async connectChannelsAnon(channels) {
		const connections = [];
		channels.forEach((channel) => {
			const connection = new AnonConnection(channel, this);
			this.connections[channel] = connection;
			connections.push(connection);
		});
		return connections;
	}

	async generateToken() {
		const json = await apiv3(
			"POST",
			`users/${this.user_id}/chat-tokens`,
			{ device_id: this.device_id },
			this.headers,
			this.channel_id
		);
		const token = json.token;
		return token;
	}
}

module.exports = Client;
