const apiv3 = require("../utils/RestAPI");
const EventEmiter = require("events");

class ApiController extends EventEmiter {
	constructor(session_key, user_id, device_id) {
		super();
		this.user_id = user_id;
		this.device_id = device_id;
		const headers = {
			"booyah-session-key": session_key,
			"x-csrf-token": session_key,
			"content-type": "application/json",
			cookie: `session_key=${session_key}`,
		};
		this.headers = headers;
	}

	async getUser(channel_id) {
		const json = await apiv3("GET", `channels/${channel_id}`);
		const user = { ...json.channel, ...json.user };
		return user;
	}

	async getAudience(channel_id) {
		const user = await this.getUser(channel_id);
		const json = await apiv3(
			"GET",
			`chatrooms/${user.chatroom_id}/audiences?cursor=0&count=100000000`, //I suppose that no one is gonna have more than 100M viewers xD
			{ channel_id: channel_id },
			this.headers
		);

		const viewers = {
			viewers: json.audience_list,
			viewers_count: json.audience_list.length,
			channel: user,
		};

		return viewers;
	}

	async punishUser(channel_id, target_id, type = 0, reason, method = "POST") {
		const target_user = await this.getUser(target_id);
		const channel = await this.getUser(channel_id);

		const body = {
			nickname: target_user.nickname,
			source: 0,
			type: type,
			uid: target_id.toString(),
			message: reason,
		};

		apiv3(method, `chatrooms/${channel.chatroom_id}/mutes`, body, this.headers);
		return { target: target_user, channel: channel };
	}

	async muteUser(channel_id, target_id) {
		return await this.punishUser(channel_id, target_id);
	}

	async banUser(channel_id, target_id, reason) {
		return await this.punishUser(channel_id, target_id, 1, reason);
	}

	async pardonUser(channel_id, target_id) {
		return await this.punishUser(channel_id, target_id, 1, "", "DELETE");
	}

	async generateToken() {
		const json = await apiv3(
			"POST",
			`users/${this.user_id}/chat-tokens`,
			{ device_id: this.device_id },
			this.headers,
			this.user_id
		);
		return json.token;
	}
}

module.exports = ApiController;
