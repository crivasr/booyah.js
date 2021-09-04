// see platform definition here: http://test.connect.booyah.live:9510/swagger/index.html
import "events";
import EventEmitter from "events";

export enum StreamingPlatform {
	booyah = 0,
	youtube = 1,
	facebook = 3,
}
export type Chatroom = {
	msgMode: Restriction;
	chatInterval: SlowMode;
	isDisableStickers: boolean;
	uid: number;
};

export type ChatMessage = {
	clientId: string;
	serverId: string;
	platform: StreamingPlatform;
	msgParam?: any;
	user: {
		nickname: string;
		uid: string | number; // this uid can be third party uid, so it can be string and number
	};
	text: string;
	badgeList: BadgeCode[];
	eventType: number;
	createdTime?: string;
};

export type BlockedPhrase = {
	id: number;
	word: string;
};

export type HotWord = {
	id: number;
	phrase: string;
};

export type ChatUser = {
	nickName: string;
	uid: number;
	thumbnail: string;
};
// see badge code definition here: http://test.connect.booyah.live:9510/swagger/index.html
export enum BadgeCode {
	redtv = 101,
	youtube = 102,
	facebook = 104,
	owner = 201,
	moderator = 202,
	staff = 301,
	contentCreator = 303,
	gifterTop1 = 401,
	gifterTop2 = 402,
	gifterTop3 = 403,
	gifterOthers = 404,
}

export enum MsgType {
	CHAT = 0,
	JOIN_ROOM = 1,
	LEAVE_ROOM = 2,
	LENGTH_LIMIT = 3,
	RATE_LIMIT = 4,
	YOU_ARE_TIMEOUTED = 5, // if user A is timed out, then he send a message, he will receive this event from server, other users will not..
	YOU_ARE_BANNED = 6, // if user A is banned, then he send a message, he will receive this event from server, other users will not.
	ADD_MODERATOR = 7,
	REMOVE_MODERATOR = 8,
	TIMEOUT_USER = 9, // if owner timeouted user A, All users in this chatroom will receive this event, including user A.
	BAN_USER = 10, // if owner banned user A, all users in this chatroom will receive this event, including user A.
	UNBAN_USER = 11, // if owner unbanned user A, all users in this chatroom will receive this event, including user A.
	ADD_STAFF = 12,
	REMOVE_STAFF = 13,
	KEYWORD_DETECTED = 14,
	NEW_FOLLOWER = 15,
	SEND_GIFT = 16,
	CURRENT_USER_BADGES = 17,
	FREEFIRE_PARTY_UP = 18, // triggered when links in https://admin.test.booyah.live/app/domain2game are sent
	SLOW_MODE_CHANGED = 19,
	MSG_MODE_CHANGED = 20, // follower/gifter only mode
	FOLLOWER_ONLY = 21,
	GIFTER_ONLY = 22,
	WIN_LUCKY_DRAW = 23,
	STICKER = 24,
	START_HOSTING = 25, // A start hosting B, then A will receive this message
	STOP_HOSTING = 26, // A stop hosting B, then A will receive this message
	FOLLOWER_ALERT = 27,
	LATEST_GIFTER = 28,
	NEW_HOSTER = 29, // A start hosting B, then B will receive this message
	GIFTER_RANK = 30,
	LUCKY_DRAW_START = 31,
	LUCKY_DRAW_CANCEL = 32,
	LUCKY_DRAW_FINISH = 33,
	ALERT_CUSTOM_CONFIG_MODIFY = 34,
	ALERT_CUSTOM_CONFIG_TEST = 35,
	STICKER_BLOCK_CHANGED = 36,
}

export enum SendMsgType {
	CHAT = 0,
	STICKER = 1,
}

export enum Restriction {
	off = 0,
	followerOnly = 1,
	gifterOnly = 2,
}

export enum SlowMode {
	normal = 0, // 3 msg per 15s
	s1 = 1, // 1 msg per 1s
	s5 = 5, // 1 msg per 5s
	s15 = 15, // 1 msg per 15s
	s30 = 30, // 1 msg per 30s
	s60 = 60, // 1 msg per 60s
	s120 = 120, // 1 msg per 120s
	s300 = 300, // 1 msg per 300s
	s600 = 600, // 1 msg per 600s
}

export enum HiddenBanner {
	all = 0,
	freeGift = 1,
	coinGift = 2,
	lootdrop = 3,
}

export enum ShownSystemMessage {
	all = 0,
	freeGift = 1,
	coinGift = 2,
	hosting = 3,
	lootdropWinner = 4,
	chatModeration = 5,
}

export enum DashboardMsgType {
	chatMessage = 0,
	systemMessage = 1,
}

export enum MuteTypes {
	temporal = 0,
	permanent = 1,
}

export type uid = string | number;

export type uuid = string;

export type token = string;

export class Connection {
	public constructor(channel_id: uid, parent: Client);
}

export class Client extends EventEmitter {
	public constructor(session_key: string, user_id: uid);
	public connectChannels(channels: Array<uid>);
	public sendMessage(channel: uid | Connection, message: string);
	public sendSticker(channel: uid | Connection, message: string);
	public generateToken(): token;
	public session_key: string;
	public user_id: uid;
	public headers: JSON;
	public device_id: uuid;
	public connections: Array<Connection>;
}
