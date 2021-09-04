const fetch = require("node-fetch");
const baseUrl = "https://booyah.live";

async function apiv3(method, src, data = {}, headers, user_id) {
	const url = `${baseUrl}/api/v3/${src}`;
	const referrer = `${baseUrl}/channels/${user_id}`;
	let params;
	if (method == "GET") {
		params = {
			headers: headers,
			referrer: referrer,
			method: method,
		};
	} else {
		params = {
			headers: headers,
			referrer: referrer,
			body: JSON.stringify(data),
			method: method,
		};
	}
	const response = await fetch(url, params);

	const json = await response.json();
	return json;
}
module.exports = apiv3;
