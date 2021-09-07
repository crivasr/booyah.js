const { v1: uuidv1 } = require("uuid");
const EventEmiter = require("events");
const { Connection, AnonConnection } = require("../connection");
const ApiController = require("../api/Controller");

class Client extends EventEmiter {
	constructor(session_key, user_id) {
		super();
		this.user_id = user_id;
		this.device_id = uuidv1();
		this.controller = new ApiController(session_key, this.user_id);
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
				"Missing autentication parameters, starting anonoymous connection"
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
		const token = await this.controller.generateToken(this.device_id);
		return token;
	}
}

module.exports = Client;
