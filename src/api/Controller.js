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

	async getStream(channel_id) {
		const response = await apiv3(
			"GET",
			`channels/${channel_id}/streams`,
			{},
			this.headers
		);
		return response;
	}

	async getVods(channel_id) {
		const response = await apiv3(
			"GET",
			`playbacks?channel_id=${channel_id}&type=1&sort_method=1`,
			{},
			this.headers
		);
		return response;
	}

	async getUptime(channel_id) {
		const stream = await this.getStream(channel_id);
		const create_time = stream.create_time;

		if (!create_time) return 0;
		const now = Date.now() / 1000;
		const uptime = now - parseInt(create_time);

		return uptime;
	}

	async getMonthUptime(channel_id) {
		const vods = await this.getVods(channel_id);
		const uptime = await this.getUptime(channel_id);

		let time = uptime || 0;
		vods.forEach((vod) => {
			const create_time = vod.playback.create_time_ms;
			const date = new Date(create_time);
			const now = new Date();

			if (date.getMonth() == now.getMonth()) {
				// sometimes during a stream, a portion of the current stream is added as a vod
				// if the channel is live we check if the vod is older than the stream or not
				// if its not older than the stream it means that its a portion of the current stream
				// so we don't have to add him to the time counter
				// uptime is in seconds and create_time in miliseconds, so we have to multiply the uptime
				// by 1000
				if (!uptime || create_time < now.getTime() - uptime * 1000)
					time += vod.playback.duration;
			}
		});

		return uptime;
	}
}

module.exports = ApiController;
