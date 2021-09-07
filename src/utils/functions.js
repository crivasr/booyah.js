function decodeBufferToJSON(buffer) {
	const json = buffer.toString("utf8");
	const jsonp = JSON.parse(json);
	return jsonp;
}

module.exports = { decodeBufferToJSON };
