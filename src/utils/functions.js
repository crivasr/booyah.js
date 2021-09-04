const apiv3 = require("./RestAPI");

function decodeBufferToJSON(buffer) {
	const json = buffer.toString("utf8");
	const jsonp = JSON.parse(json);
	return jsonp;
}

async function getUser(channel_id) {
	const json = await apiv3("GET", `channels/${channel_id}`);
	if (json.message) throw new Error(json.message)
	const user = { ...json.channel, ...json.user };
	return user;
}

module.exports = {decodeBufferToJSON, getUser}