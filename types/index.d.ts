// see platform definition here: http://test.connect.booyah.live:9510/swagger/index.html
import "events";
import EventEmitter from "events";

export class ApiController extends EventEmitter {
	public constructor(session_key: string, user_id: string, device_id: string);

	public getUser(channel_id: string | number): Promise<FullUser>;
	public getAudience(channel_id: string | number): Promise<{
		viewers: Array<ChatUser>;
		viewers_count: number;
		channel: FullUser;
	}>;

	private generateToken(): Promise<string>;

	private punishUser(
		channel_id: string | number,
		target_id: string | number,
		type: 0 | 1,
		reason: string,
		method: "POST" | "DELETE"
	): Promise<{ target: FullUser; channel: FullUser }>;

	public muteUser(
		channel_id: string | number,
		target_id: string | number
	): Promise<{ target: FullUser; channel: FullUser }>;

	public banUser(
		channel_id: string | number,
		target_id: string | number,
		reason?: string
	): Promise<{ target: FullUser; channel: FullUser }>;

	public pardonUser(
		channel_id: string | number,
		target_id: string | number
	): Promise<{ target: FullUser; channel: FullUser }>;

	public getStream(channel_id: string | number): Promise<Stream>;
	public getVods(channel_id: string | number): Promise<Array<Playback>>;
	public getUptime(channel_id: string | number): Promise<number>;
	public getMonthUptime(channel_id: string | number): Promise<number>;
}

export class Connection extends ApiController {
	public constructor(channel_id: uid, parent: Client);
	public close(): this;
	private getWsUrl(): string;
	public sendMessage(message: string): this;
	public sendSticker(sticker_id: string | number): this;

	public channel_id: string | number;
	public parent: Client;
	public headers: JSON;
	public anon: Boolean;
	public reconnections: number;
	public channel: FullUser;
}
export class AnonConnection extends Connection {
	public constructor(channel_id: uid, parent: Client);
}

export class Client extends ApiController {
	public constructor(session_key: string, user_id: string | number);

	public connectChannels(
		channels: Array<string | number>
	): Promise<Array<Connection>>;
	public sendMessage(
		channel: string | number | Connection,
		message: string
	): this;
	public sendSticker(
		channel: string | number | Connection,
		sticker_id: string | number
	): this;

	public session_key: string;
	public user_id: string | number;
	public headers: JSON;
	public device_id: string;
	public connections: Array<Connection>;

	on(
		event: "close",
		listener: (this: Client, context: FullUser, connection: Connection) => void
	): this;
	on(
		event: "message",
		listener: (
			this: Client,
			msg: ChatMessage,
			context: FullUser,
			connection: Connection,
			self: Boolean
		) => void
	): this;
	on(
		event: "connected",
		listener: (this: Client, context: FullUser, connection: Connection) => void
	): this;
	on(
		event: "reconnection",
		listener: (this: Client, context: FullUser, connection: Connection) => void
	): this;
}

export enum StreamingPlatform {
	booyah = 0,
	youtube = 1,
	facebook = 3,
}
export type Chatroom = {
	uid: number;
	notify: number;
	chat_mode: Restriction;
	chat_interval: SlowMode;
	is_disable_stickers: boolean;
	rule: string;
	rule_update_time: number;
	uid: number;
	moderator_list: ChatUser[];
	staff_list: ChatUser[];
	hot_phrase_list: HotWord[];
};

export type ChatMessage = {
	data: {
		uid: string;
		sticker_id: number;
		srv_msg_id: string;
		platform: StreamingPlatform;
		msg: string;
		msgParam?: any;
		nickname: string;
		msg: string;
		badgeList: BadgeCode[];
		clt_msg_id: string;
	};
	event: MsgType;
	isModerator: boolean;
	isOwner: boolean;
	createdTime?: string;
};
export type SocialLink = {
	channel_id: number;
	platform: string;
	link: string;
};
export type FullUser = {
	channel_id: number;
	chatroom_id: number;
	title: string;
	streaming_lang: string;
	description: string;
	flag: number;
	offline_pic: string;
	thumbnail: string;
	create_time: number;
	share_url: string;
	is_streaming: boolean;
	is_verified_streamer: boolean;
	is_content_creator: boolean;
	is_enable_vod: boolean;
	is_enable_download_vod: boolean;
	is_enable_long_clip: boolean;
	is_enable_lucky_draw: boolean;
	is_enable_vote: boolean;
	social_links: SocialLink[];
	uid: number;
	nickname: string;
	thumbnail: string;
	follow_time: number;
	follower_count: number;
	following_count: number;
	notification: 0 | 1;
	nickname_next_update_time: number;
	clan_id?: number;
	gender: UserGender;
	gender_next_update_time: number;
	birthday: number;
	age: number;
	platform: LoginPlatform;
};

export enum LoginPlatform {
	none = 0,
	facebook = 3,
	vk = 5,
	line = 6,
	google = 8,
	apple = 10,
	twitter = 11,
}

export enum UserGender {
	NotSet = 0,
	Male = 1,
	Female = 2,
	Others = 3,
	KeepSecret = 4,
}

export type BlockedPhrase = {
	id: number;
	word: string;
};

export type HotWord = {
	id: number;
	phrase: string;
	create_time: string;
};

export type ChatUser = {
	nickName: string;
	uid: number;
	thumbnail?: string;
	create_time: number;
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

export type Stream = {
	gameBuildId: number;
	snapshot: string;
	streamAddrList: Resolution[];
	mirrorList: Mirror[];
	defaultMirror: string;
	viewerCount: number;
	encoder?: string;
	lootdropInfo?: Lootdrop;
	luckyDrawInfo?: LuckyDrawInfo;
	viewerCountInfo: ViewerCount[];
	createTime: number;
	sourceStreamUrlPath: string;
};

export type PlaybackEndpoint = {
	bitrate: number;
	downloadUrl: string;
	resolution: number;
	streamUrl: string;
};

export type Playback = {
	channelId: number;
	createTimeMs: number;
	duration: number;
	name: string;
	description: string;
	endpointList: PlaybackEndpoint[];
	snapshotUrl: string; // generated by system
	thumbnailUrl: string; // uploaded by user, thumbnail has higher priority than snapshot
	uuid: string;
	views: number;
	shareUrl: string;
	gameBuildId: number;
	likeTime: number;
	likes: number;
	lang: string;
	type: VideoFilterType;
	clipCampaign?: ActiveClipCampaign;
	tagUniqList: string[];
	displayType: number;
};
