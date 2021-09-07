const { v1: uuidv1 } = require("uuid");
const { Connection, AnonConnection } = require("../connection");
const ApiController = require("../api/Controller");

class Client extends ApiController {
	constructor(session_key, user_id) {
		const device_id = uuidv1();
		super(session_key, user_id, device_id);
		this.session_key = session_key;
		this.user_id = user_id;
		this.device_id = device_id;
		this.connections = {};
	}

	sendMessage(channel, message) {
		const connection = this.connections[channel];
		if (!connection) throw new Error(`Not connected to channel ${channel}`);
		connection.sendMessage(message);
		return connection;
	}

	sendSticker(channel, sticker_id) {
		const connection = this.connections[channel];
		if (!connection) throw new Error(`Not connected to channel ${channel}`);
		connection.sendSticker(sticker_id);
		return connection;
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
}

module.exports = Client;
