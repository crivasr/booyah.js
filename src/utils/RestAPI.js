const fetch = require("node-fetch");
const baseUrl = "https://booyah.live";

async function apiv3(method, src, data = {}, headers, referrer_id) {
	const url = `${baseUrl}/api/v3/${src}`;
	const referrer = `${baseUrl}/channels/${referrer_id}`;

	const params = {
		headers: headers,
		referrer: referrer,
		method: method,
	};

	if (method != "GET") {
		params.body = JSON.stringify(data);
	}

	const response = await fetch(url, params);

	const json = await response.json();
	if (json.code >= 300) {
		const error = `${json.message} on ${src}`;
		throw new Error(error);
	}

	return json;
}
module.exports = apiv3;
