const { getUser } = require("./utils/functions");
module.exports = {
	Client: require("./client/Client"),
	ApiController: require("./api/Controller"),
	getUser,
};
