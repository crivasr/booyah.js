const apiv3 = require("../utils/RestAPI");

class ApiController {
	constructor(session_key, user_id) {
		this.user_id = user_id;
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

	async getViewersCount(chatroom_id) {
		const json = await apiv3(
			"GET",
			`chatrooms/${chatroom_id}/audiences/count`,
			{},
			this.headers
		);

		return json.viewer_count || 0;
	}

	async getAudience(chatroom_id, channel_id) {
		const viewers_count = await this.getViewersCount(chatroom_id);
		const json = await apiv3(
			"GET",
			`chatrooms/${chatroom_id}/audiences?cursor=0&count=${viewers_count}`,
			{ channel_id: channel_id },
			this.headers
		);

		const viewers = {
			audience: json.audience_list,
			viewer_count: viewers_count,
		};

		return viewers;
	}

	async punishUser(chatroom_id, uid, type, reason, method = "POST") {
		const user = await this.getUser(uid);

		const body = {
			nickname: user.nickname,
			source: 0,
			type: type,
			uid: uid.toString(),
			message: reason,
		};

		apiv3(method, `chatrooms/${chatroom_id}/mutes`, body, this.headers);
	}

	async generateToken(device_id) {
		const json = await apiv3(
			"POST",
			`users/${this.user_id}/chat-tokens`,
			{ device_id: device_id },
			this.headers,
			this.user_id
		);
		const token = json.token;
		return token;
	}
}

module.exports = ApiController;
