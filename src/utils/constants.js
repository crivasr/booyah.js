const msgTypes = [
	"chat",
	"join_room",
	"leave_room",
	"length_limit",
	"rate_limit",
	"you_are_timeouted",
	"add_moderator",
	"remove_moderator",
	"timeout_user",
	"ban_user",
	"unban_user",
	"add_staff",
	"remove_staff",
	"keyword_detected",
	"new_follower",
	"send_gift",
	"current_user_badges",
	"freefire_party_up", 
	"slow_mode_changed",
	"msg_mode_changed",
	"follower_only",
	"gifter_only",
	"win_lucky_draw",
	"sticker",
	"start_hosting", 
	"stop_hosting",
	"follower_alert",
	"latest_gifter",
	"new_hoster", 
	"gifter_rank",
	"lucky_draw_start",
	"lucky_draw_cancel",
	"lucky_draw_finish",
	"alert_custom_config_modify",
	"alert_custom_config_test",
	"sticker_block_changed",
];

const sendMessageTypes = {
	message: 0,
	sticker: 1
}
const maxMessageLength = 144;

const BadgeCode = {
	redtv: 101,
	youtube: 102,
	facebook: 104,
	owner: 201,
	moderator: 202,
	staff: 301,
	contentCreator: 303,
	gifterTop1: 401,
	gifterTop2: 402,
	gifterTop3: 403,
	gifterOthers: 404,
}
module.exports = {maxMessageLength, msgTypes, sendMessageTypes, BadgeCode}