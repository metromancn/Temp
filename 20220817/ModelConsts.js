
// Global Model Constants
//
// Note while server side supports ES6 class properties, the client
// side (CRA 2.0 + babel) does not have it enabled. Hence we have the
// constants and then the "get" methods act as constants within exportable
// grouping (class).
//

// -------------------------- SYSTEM GLOBALS -------------------------

// Set to 'true' to limit features for regular users
// See DISABLE_FEATURES_USER below
import Util from '../Util';

export const LIMIT_USER_FEATURES = false;

export const EMAIL_DOMAIN = 'gettr.com';

export const CACHE_LIST_NO_ITEMS = '-!n0ne$-';

// -------------------------- HARDCODED USERS -------------------------


export const USERID_ADMIN_SYS = '_sysadm_';
export const USERID_ADMIN_ACCT = 'acct_svc';
export const USERID_ADMIN_APP = 'getter_admin';
export const USERID_ADMIN_BYPASS = 'bypass_admin';

export const USERID_GUEST = '_guest';
export const USERID_ROBOT = '_bot';
export const USERID_TEMP = '_tmp';
export const USERID_NONE = '_none';

export const NICKNAME_GUEST = 'Guest';

export const TOKEN_GUEST = 'D032EF1093C3AD902A29EE';
export const TOKEN_ROBOT = '209A0D8AE39300178B81D1';
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{5,30}$/;

// -------------------------- LIVE STREAM -------------------------
export const HMAC_REGEX = /keyId="(\w+)",timestamp="(\d+)",signature="(\w+)"/;
// export const IDLE_STATUS = 'IDLE';
export const ENABLE_STATUS = 'enable';
export const START_LIVE_ACTION = 'start';
export const UPDATE_LIVE_ACTION = 'updateLive';
export const AUTOSTART_ACTION_WEBHOOK = 'autoStart';
export const SCHEDULE_LIVE_ACTION = 'schedule';
export const END_LIVE_ACTION = 'end';
export const RESET_LIVE_CHANNEL = 'reset_channel';
export const START_LIVE_TRANSCODER = 'start_transcoder';
export const STOP_LIVE_TRANSCODER = 'end_transcoder';
export const BAN_LIVE_USER_ACTION = 'ban';
export const DEL_RECORDED_ACTION = 'delete';
export const JOIN_STREAM_ACTION = 'join';
export const CUT_ACTION_WEBHOOK = 'cut';
export const ENABLE_CHAT_ACTION = 'enable';
export const DISABLE_CHAT_ACTION = 'disable';
export const ADD_CHANNEL_ACTION = 'addChannel';
export const DEL_CHANNEL_ACTION = 'rmChannel';
export const CONF_CHANNEL_ACTION = 'configChannel';
export const UPDATE_LIVEPOST_ACTION_WEBHOOK = 'updateLivePost';
export const HEALTH_CHECK = 'health';
export const LIVE_CHAT = 'livechat';
export const _ALGORITHM = 'sha256';

export const LIVE_CONFIG_STREAM_TYPE_MUX_MEDIA = 'MuxMedia';
export const LIVE_CONFIG_STREAM_TYPE_WOZ_MEDIA = 'WozMedia';
export const LIVE_CONFIG_RESOURCE_TYPE_WEB_RTC = 'WebRTC';

export const LIVE_CONFIG_STREAM_TYPES = [
  LIVE_CONFIG_STREAM_TYPE_MUX_MEDIA,
  LIVE_CONFIG_STREAM_TYPE_WOZ_MEDIA,
];

export const LIVE_CONFIG_RESOURCE_TYPES = [
  LIVE_CONFIG_RESOURCE_TYPE_WEB_RTC,
];

export const LIVE_CONFIG_REGION_US_CENTRAL_IOWA = 'us_central_iowa';
export const LIVE_CONFIG_REGION_US_EAST_S_CAROLINA = 'us_east_s_carolina';
export const LIVE_CONFIG_REGION_US_EAST_VIRGINIA = 'us_east_virginia';
export const LIVE_CONFIG_REGION_US_WEST_CALIFORNIA = 'us_west_california';
export const LIVE_CONFIG_REGION_US_WEST_OREGON = 'us_west_oregon';
export const LIVE_CONFIG_REGION_ASIA_PACIFIC_TAIWAN = 'asia_pacific_taiwan';
export const LIVE_CONFIG_REGION_ASIA_PACIFIC_AUSTRALIA = 'asia_pacific_australia';
export const LIVE_CONFIG_REGION_EU_BELGIUM = 'eu_belgium';
export const LIVE_CONFIG_REGION_EU_GERMANY = 'eu_germany';
export const LIVE_CONFIG_REGION_EU_IRELAND = 'eu_ireland';
export const LIVE_CONFIG_REGION_SOUTH_AMERICA_BRAZIL = 'south_america_brazil';

export const LIVE_CONFIG_RESOURCE_REGIONS = [
  LIVE_CONFIG_REGION_US_CENTRAL_IOWA,
  LIVE_CONFIG_REGION_US_EAST_S_CAROLINA,
  LIVE_CONFIG_REGION_US_EAST_VIRGINIA,
  LIVE_CONFIG_REGION_US_WEST_CALIFORNIA,
  LIVE_CONFIG_REGION_US_WEST_OREGON,
  LIVE_CONFIG_REGION_ASIA_PACIFIC_TAIWAN,
  LIVE_CONFIG_REGION_ASIA_PACIFIC_AUSTRALIA,
  LIVE_CONFIG_REGION_EU_BELGIUM,
  LIVE_CONFIG_REGION_EU_GERMANY,
  LIVE_CONFIG_REGION_EU_IRELAND,
  LIVE_CONFIG_REGION_SOUTH_AMERICA_BRAZIL,
];

export const LIVE_CONFIG_CATEGORY_HIGHLIGHTS = 'highlights';
export const LIVE_CONFIG_CATEGORY_NEWS = 'news';
export const LIVE_CONFIG_CATEGORY_INTERVIEW = 'interview';
export const LIVE_CONFIG_CATEGORY_POLITICS = 'politics';
export const LIVE_CONFIG_CATEGORY_ECONOMICS = 'economics';
export const LIVE_CONFIG_CATEGORY_EDUCATION = 'education';
export const LIVE_CONFIG_CATEGORY_HEALTH = 'health';

export const LIVE_CONFIG_CATEGORIES = [
  LIVE_CONFIG_CATEGORY_HIGHLIGHTS,
  LIVE_CONFIG_CATEGORY_NEWS,
  LIVE_CONFIG_CATEGORY_INTERVIEW,
  LIVE_CONFIG_CATEGORY_POLITICS,
  LIVE_CONFIG_CATEGORY_ECONOMICS,
  LIVE_CONFIG_CATEGORY_EDUCATION,
  LIVE_CONFIG_CATEGORY_HEALTH,
];


// -------------------------- SOCIAL SYNC -------------------------
export const SITE_TWITTER = 'twitter';
export const SITE_INSTAGRAM = 'instagram';

// ---------------------- HARDCODED TOPIC CATEGORIES -------------------

export const CATEGORY_POLITICS = 'politics';
export const CATEGORY_ECONOMY = 'economy';
export const CATEGORY_WHISTLE_BLOWER_MOVEMENT = 'whistleblower';
export const CATEGORY_NEWS = 'news';
export const CATEGORY_ENTERTAINMENT = 'entertainment';

export const TOPIC_CATEGORIES = [
  CATEGORY_POLITICS, CATEGORY_NEWS, CATEGORY_ENTERTAINMENT, CATEGORY_WHISTLE_BLOWER_MOVEMENT
];

// -------------------------- MODEL TYPE NAMES -------------------------

const TYPE_ACTIVITY_LOG = 'act_log';
const TYPE_BINARY = 'bin';
const TYPE_CONTRIB_STATS = 's_contrib';
const TYPE_COMMENT = 'cmt';
const TYPE_COMMENT_STATS = 's_cmst';
const TYPE_COMMENT_FEED = 'cmfd';
const TYPE_COMMENT_INFO = 'cinf';
const TYPE_COMMENT_ITEM = 'cmti';
const TYPE_CONTEXT = 'ctx';
const TYPE_GLOBAL_CONFIG_PROP = 'gcp';
const TYPE_ENCRYPTED = 'enc';
const TYPE_FACEBOOK_CRED = 'fbcrd';
const TYPE_FOLLOWS = 'fws';
const TYPE_FOLLOW = 'flw';
const TYPE_BLOCKS = 'blks';
const TYPE_MUTES = 'mts';
const TYPE_FOLLOWERS = 'fwr';
const TYPE_HASHTAGINFO = 'htinfo';
const TYPE_USERTAGINFO = 'utinfo';
const TYPE_LIKES = 'lks';
const TYPE_LIKED = 'lkd';
const TYPE_LIKE_COMMENT = 'lkc';
const TYPE_LIKES_COMMENT = 'lkscm';
const TYPE_LIKED_COMMENT = 'lkdcm';
const TYPE_LIKE_POST = 'lkp';
const TYPE_LIKES_POST = 'lks_post';
const TYPE_LIKED_POST = 'lkd_post';
const TYPE_NEWS_FEED = 'nfeed';
const TYPE_NEWS_ITEM = 'nfi';
const TYPE_NOTIFICATION = 'notif';
const TYPE_POST = 'post';
const TYPE_LIVE_POST = 'lv_pst';
const TYPE_POLL_VOTE = 'poll_vote';
const TYPE_CHAT_USER_KEY = 'ch_u_key';
const TYPE_CHAT_CONVERSATION_KEY = 'ch_c_key';
const TYPE_CHAT_TOKEN = 'ch_tkn';
const TYPE_VISION_POST = 'vi_pst';
const TYPE_POST_STATS = 's_pst';
const TYPE_POST_ITEM = 'psti';
const TYPE_POST_FEED = 'pstfd';
const TYPE_POST_INFO = 'pinf';
const TYPE_ROLE_DEFINITION = 'rdef';
const TYPE_FEATURE_DEFINITION = 'fdef';
const TYPE_REACTION = 'rct';
const TYPE_RENDER_STYLE = 'rdstyle';
const TYPE_SHARED = 'shrd';
const TYPE_SHARE_POST = 'shrp';
const TYPE_SHARED_POST = 'shrdpst';
const TYPE_SHARE_COMMENT = 'shrc';
const TYPE_SHARED_COMMENT = 'shrdcm';
const TYPE_SHARES = 'shrs';
const TYPE_SHARES_POST = 'shrspst';
const TYPE_SHARES_COMMENT = 'shrscm';
const TYPE_SOCIAL_INDEXABLE = 'socobj';
const TYPE_USER = 'u';
const TYPE_USER_STATS = 's_user';
const TYPE_USER_ALERT = 'ualrt';
const TYPE_USER_ALERTS = 'ualrts';
const TYPE_USER_AUTH = 'ua';
const TYPE_USER_CONFIRM = 'ucfm';
const TYPE_USER_FEEDBACK = 'fbk';
const TYPE_USER_REQUEST = 'ureq';
const TYPE_USER_INFO = 'uinf';
const TYPE_PRIV_USER_INFO = 'puinf';
const TYPE_WATCHES = 'watches';
const TYPE_WATCHED = 'watched';
const TYPE_WATCHES_COMMENT = 'wscm';
const TYPE_WATCHED_COMMENT = 'wdcm';
const TYPE_WATCH_COMMENT = 'wcm';
const TYPE_WATCHES_POST = 'wspst';
const TYPE_WATCHED_POST = 'wdpst';
const TYPE_WATCH_POST = 'wpst';
const TYPE_XMLIST = 'xmlst';
const TYPE_XRESULT_LIST = 'rslst';
const TYPE_XRESULT_MAP = 'rsmap';
const TYPE_XDIFF = 'df';
const TYPE_XDEEPDIFF = 'ddf';
const TYPE_XERROR = 'xerr';
const TYPE_XOBJECT = 'xobj';
const TYPE_XMOBJECT = 'xmobj';
const TYPE_XTEXT = 'xtxt';
const TYPE_VARDATA = 'vdta';
const TYPE_ADMIN_USER = 'admusr';
const TYPE_SYSCONFIG = 'sysconf';
const TYPE_RESERVED_ACCOUNT = 'ra';
const TYPE_AUTH_REQUEST_LOG = 'atr_log';
const TYPE_SOCIAL_SYNC = 'social_sync';
const TYPE_LIVE_CHAT = 'chat';
const TYPE_LIVE_CHAT_FEED = 'lvcfd';
const TYPE_DM_USERS = 'dmus';

// trending news
const TYPE_NEWS_INFO = 'ninf';

// moderation
const TYPE_MOD_CONFIGS = 'modconfs';
const TYPE_MOD_REASONS = 'modreasons';

// visions
const TYPE_VISION_ACCESSORY = 'viaccessory';
const TYPE_SOUND = 'sound';
const TYPE_STICKER = 'sticker';
const TYPE_SOUND_STATS = 's_sound';
const TYPE_STICKER_STATS = 's_sticker';

/**
 * Type constants for all registered model objects grouped
 * for simple single export
 */
export class ModelType {
  static get ACTIVITY_LOG() { return TYPE_ACTIVITY_LOG; }
  static get BINARY() { return TYPE_BINARY; }
  static get CONTRIB_STATS() { return TYPE_CONTRIB_STATS; }
  static get COMMENT() { return TYPE_COMMENT; }
  static get COMMENT_FEED() { return TYPE_COMMENT_FEED; }
  static get COMMENT_INFO() { return TYPE_COMMENT_INFO; }
  static get COMMENT_ITEM() { return TYPE_COMMENT_ITEM; }
  static get COMMENT_STATS() { return TYPE_COMMENT_STATS; }
  static get CONTEXT() { return TYPE_CONTEXT; }
  static get GLOBAL_CONFIG_PROP() { return TYPE_GLOBAL_CONFIG_PROP; }
  static get ENCRYPTED() { return TYPE_ENCRYPTED; }
  static get FACEBOOK_CRED() { return TYPE_FACEBOOK_CRED; }
  static get FOLLOW() { return TYPE_FOLLOW; }
  static get FOLLOWS() { return TYPE_FOLLOWS; }
  static get BLOCKS() { return TYPE_BLOCKS; }
  static get MUTES() { return TYPE_MUTES; }
  static get FOLLOWERS() { return TYPE_FOLLOWERS; }
  static get HASHTAGINFO() { return TYPE_HASHTAGINFO; }
  static get USERTAGINFO() { return TYPE_USERTAGINFO; }
  static get LIKES() { return TYPE_LIKES; }
  static get LIKED() { return TYPE_LIKED; }
  static get LIKE_COMMENT() { return TYPE_LIKE_COMMENT; }
  static get LIKES_COMMENT() { return TYPE_LIKES_COMMENT; }
  static get LIKED_COMMENT() { return TYPE_LIKED_COMMENT; }
  static get LIKE_POST() { return TYPE_LIKE_POST; }
  static get LIKES_POST() { return TYPE_LIKES_POST; }
  static get LIKED_POST() { return TYPE_LIKED_POST; }
  static get NEWS_FEED() { return TYPE_NEWS_FEED; }
  static get NEWS_ITEM() { return TYPE_NEWS_ITEM; }
  static get NOTIFICATION() { return TYPE_NOTIFICATION; }
  static get POST() { return TYPE_POST; }
  static get LIVE_POST() { return TYPE_LIVE_POST; }
  static get POST_FEED() { return TYPE_POST_FEED; }
  static get POST_INFO() { return TYPE_POST_INFO; }
  static get POST_ITEM() { return TYPE_POST_ITEM; }
  static get POST_STATS() { return TYPE_POST_STATS; }
  static get ROLE_DEFINITION() { return TYPE_ROLE_DEFINITION; }
  static get FEATURE_DEFINITION() { return TYPE_FEATURE_DEFINITION; }
  static get SOCIAL_INDEXABLE() { return TYPE_SOCIAL_INDEXABLE; }
  static get REACTION() { return TYPE_REACTION; }
  static get RENDER_STYLE() { return TYPE_RENDER_STYLE; }
  static get SHARED() { return TYPE_SHARED; }
  static get SHARE_POST() { return TYPE_SHARE_POST; }
  static get SHARED_POST() { return TYPE_SHARED_POST; }
  static get SHARE_COMMENT() { return TYPE_SHARE_COMMENT; }
  static get SHARED_COMMENT() { return TYPE_SHARED_COMMENT; }
  static get SHARES() { return TYPE_SHARES; }
  static get SHARES_POST() { return TYPE_SHARES_POST; }
  static get SHARES_COMMENT() { return TYPE_SHARES_COMMENT; }
  static get USER() { return TYPE_USER; }
  static get USER_STATS() { return TYPE_USER_STATS; }
  static get USER_ALERT() { return TYPE_USER_ALERT; }
  static get USER_ALERTS() { return TYPE_USER_ALERTS; }
  static get USER_AUTH() { return TYPE_USER_AUTH; }
  static get USER_CONFIRM() { return TYPE_USER_CONFIRM; }
  static get USER_FEEDBACK() { return TYPE_USER_FEEDBACK; }
  static get USER_REQUEST() { return TYPE_USER_REQUEST; }
  static get USER_INFO() { return TYPE_USER_INFO; }
  static get PRIV_USER_INFO() { return TYPE_PRIV_USER_INFO; }
  static get WATCHES() { return TYPE_WATCHES; }
  static get WATCHED() { return TYPE_WATCHED; }
  static get WATCHES_COMMENT() { return TYPE_WATCHES_COMMENT; }
  static get WATCHED_COMMENT() { return TYPE_WATCHED_COMMENT; }
  static get WATCH_COMMENT() { return TYPE_WATCH_COMMENT; }
  static get WATCHES_POST() { return TYPE_WATCHES_POST; }
  static get WATCHED_POST() { return TYPE_WATCHED_POST; }
  static get WATCH_POST() { return TYPE_WATCH_POST; }
  static get XMLIST() { return TYPE_XMLIST; }
  static get XRESULT_LIST() { return TYPE_XRESULT_LIST; }
  static get XRESULT_MAP() { return TYPE_XRESULT_MAP; }
  static get XDIFF() { return TYPE_XDIFF; }
  static get XDEEPDIFF() { return TYPE_XDEEPDIFF; }
  static get XERROR() { return TYPE_XERROR; }
  static get XMOBJECT() { return TYPE_XMOBJECT; }
  static get XOBJECT() { return TYPE_XOBJECT; }
  static get XTEXT() { return TYPE_XTEXT; }
  static get VARDATA() { return TYPE_VARDATA; }
  static get ADMIN_USER() { return TYPE_ADMIN_USER; }
  static get SYSCONFIG() { return TYPE_SYSCONFIG; }
  static get RESERVED_ACCOUNT() { return TYPE_RESERVED_ACCOUNT; }
  static get AUTH_REQUEST_LOG() { return TYPE_AUTH_REQUEST_LOG; }
  static get SOCIAL_SYNC() { return TYPE_SOCIAL_SYNC; }
  static get LIVE_CHAT() { return TYPE_LIVE_CHAT; }
  static get LIVE_CHAT_FEED() { return TYPE_LIVE_CHAT_FEED; }
  static get DM_USERS() { return TYPE_DM_USERS; }

  // Trending news
  static get NEWS_INFO() { return TYPE_NEWS_INFO; }

  // Moderation
  static get MODERATION_CONFIGS() { return TYPE_MOD_CONFIGS; }
  static get MODERATION_REASONS() { return TYPE_MOD_REASONS; }

  // chat
  static get CHAT_USER_KEY() { return TYPE_CHAT_USER_KEY; }
  static get CHAT_CONVERSATION_KEY() { return TYPE_CHAT_CONVERSATION_KEY; }
  static get CHAT_TOKEN() { return TYPE_CHAT_TOKEN; }

  // visions
  static get VISION_POST() { return TYPE_VISION_POST; }
  static get VISION_ACCESSORY() { return TYPE_VISION_ACCESSORY; }
  static get SOUND() { return TYPE_SOUND; }
  static get STICKER() { return TYPE_STICKER; }
  static get SOUND_STATS() { return TYPE_SOUND_STATS; }
  static get STICKER_STATS() { return TYPE_STICKER_STATS; }

  // poll
  static get POLL_VOTE() { return TYPE_POLL_VOTE; }
}

export class ObjectType extends ModelType {

  static get INFO_HELP() { return 'help'; }
  static get INFO_TOS_USER() { return 'tos_user'; }
  static get INFO_TOS_PUBLIC() { return 'tos_public'; }
  static get INFO_PRIVACY_PUBLIC() { return 'privacy_public'; }
  static get INFO_DMCA_NOTICE() { return 'dmca_notice'; }
  static get INFO_USER_GUIDELINES() { return 'user_guidelines'; }
  static get INFO_LEGAL_GUIDELINES() { return 'legal_guidelines'; }
  static get INFO_ABOUT_US() { return 'about_us'; }
  static get SURVEY_FEEDBACK() { return 'feedback'; }
  static get MYACCOUNT() { return 'myaccount'; }
  static get HOMEPAGE() { return 'homepage'; }
}

// --------------- MODEL FOLDER/COLLECTION NAMES -----------------------

const FOLDER_ACTIVITY_LOG = 'act_log';
const FOLDER_BINARY_DATA = 'binary';
const FOLDER_COMMENT = 'cm';
const FOLDER_COMMENT_STATS = 'cm_stats';
const FOLDER_CONTRIB_STATS = 'contrib_stats';
const FOLDER_ENCRYPTED_DATA = 'enc';
const FOLDER_FACEBOOK_CRED = 'fbcred';
const FOLDER_FOLLOW = 'follow';
const FOLDER_FOLLOWS = 'follows';
const FOLDER_FOLLOWERS = 'followers';
const FOLDER_LIKE_COMMENT = 'cm_like';
const FOLDER_LIKES_COMMENT = 'cm_likes';
const FOLDER_LIKED_COMMENT = 'cm_liked';
const FOLDER_LIKE_POST = 'post_like';
const FOLDER_LIKES_POST = 'post_likes';
const FOLDER_LIKED_POST = 'post_liked';
const FOLDER_NEWS_ITEM = 'news_items';
const FOLDER_NOT_APPLICABLE = '_na';
const FOLDER_NOTIFICATION = 'notif';
const FOLDER_POST = 'post';
const FOLDER_POSTED_ITEM = 'posted_items';
const FOLDER_POST_STATS = 'post_stats';
const FOLDER_LIVE_CHAT = 'chat';
const FOLDER_SHARE_POST = 'post_share';
const FOLDER_SHARED = 'shared'; // should not be used
const FOLDER_SHARED_POST = 'post_shared';
const FOLDER_SHARE_COMMENT = 'cm_share';
const FOLDER_SHARED_COMMENT = 'cm_shared';
const FOLDER_SHARES = 'shares'; // should not be used
const FOLDER_SHARES_POST = 'post_shares';
const FOLDER_SHARES_COMMENT = 'cm_shares';
const FOLDER_USER = 'user';
const FOLDER_USER_STATS = 'user_stats';
const FOLDER_USER_AUTH = 'user_auth';
const FOLDER_USER_CONFIRM = 'uconfirm';
const FOLDER_USER_FEEDBACK = 'feedback';
const FOLDER_USER_REQUEST = 'urequest';
const FOLDER_WATCH_COMMENT = 'cm_watch';
const FOLDER_WATCHES_COMMENT = 'cm_watches';
const FOLDER_WATCHED_COMMENT = 'cm_watched';
const FOLDER_WATCH_POST = 'post_watch';
const FOLDER_WATCHES_POST = 'post_watches';
const FOLDER_WATCHED_POST = 'post_watched';
const FOLDER_RESERVED_ACCOUNT = 'reserved_account';
const FOLDER_SOCIAL_SYNC = 'social_sync';

// chat
const FOLDER_CHAT_USER_KEY = 'chat_user_key';
const FOLDER_CHAT_CONVERSATION_KEY = 'chat_conversation_key';
const FOLDER_CHAT_TOKEN = 'chat_token';

// vision
const FOLDER_SOUND = 'sound';
const FOLDER_STICKER = 'sticker';
const FOLDER_SOUND_STATS = 'sound_stats';
const FOLDER_STICKER_STATS = 'sound_stats';

// global
const FOLDER_GLOBAL = 'global';

// poll
const FOLDER_POLL_VOTE = 'poll_vote';

/**
 * Type constants for all registered model objects grouped
 * for simple single export
 */
export class ModelFolder {
  static get NONE() { return null; }
  static get ACTIVITY_LOG() { return FOLDER_ACTIVITY_LOG; }
  static get BINARY_DATA() { return FOLDER_BINARY_DATA; }
  static get COMMENT() { return FOLDER_COMMENT; }
  static get COMMENT_STATS() { return FOLDER_COMMENT_STATS; }
  static get CONTRIB_STATS() { return FOLDER_CONTRIB_STATS; }
  static get ENCRYPTED_DATA() { return FOLDER_ENCRYPTED_DATA; }
  static get FACEBOOK_CRED() { return FOLDER_FACEBOOK_CRED; }
  static get FOLLOW() { return FOLDER_FOLLOW; }
  static get FOLLOWS() { return FOLDER_FOLLOWS; }
  static get FOLLOWERS() { return FOLDER_FOLLOWERS; }
  static get LIKE_COMMENT() { return FOLDER_LIKE_COMMENT; }
  static get LIKES_COMMENT() { return FOLDER_LIKES_COMMENT; }
  static get LIKED_COMMENT() { return FOLDER_LIKED_COMMENT; }
  static get LIKE_POST() { return FOLDER_LIKE_POST; }
  static get LIKES_POST() { return FOLDER_LIKES_POST; }
  static get LIKED_POST() { return FOLDER_LIKED_POST; }
  static get NEWS_ITEM() { return FOLDER_NEWS_ITEM; }
  static get NOT_APPLICABLE() { return FOLDER_NOT_APPLICABLE; }
  static get NOTIFICATION() { return FOLDER_NOTIFICATION; }
  static get POST() { return FOLDER_POST; }
  static get POST_STATS() { return FOLDER_POST_STATS; }
  static get LIVE_CHAT() { return FOLDER_LIVE_CHAT; }
  static get SHARED() { return FOLDER_SHARED; }
  static get SHARE_POST() { return FOLDER_SHARE_POST; }
  static get SHARED_POST() { return FOLDER_SHARED_POST; }
  static get SHARE_COMMENT() { return FOLDER_SHARE_COMMENT; }
  static get SHARED_COMMENT() { return FOLDER_SHARED_COMMENT; }
  static get SHARES() { return FOLDER_SHARES; }
  static get SHARES_POST() { return FOLDER_SHARES_POST; }
  static get SHARES_COMMENT() { return FOLDER_SHARES_COMMENT; }
  static get POST_ITEM() { return FOLDER_POSTED_ITEM; }
  static get USER() { return FOLDER_USER; }
  static get USER_AUTH() { return FOLDER_USER_AUTH; }
  static get USER_CONFIRM() { return FOLDER_USER_CONFIRM; }
  static get USER_FEEDBACK() { return FOLDER_USER_FEEDBACK; }
  static get USER_REQUEST() { return FOLDER_USER_REQUEST; }
  static get USER_STATS() { return FOLDER_USER_STATS; }
  static get WATCHES_COMMENT() { return FOLDER_WATCHES_COMMENT; }
  static get WATCHED_COMMENT() { return FOLDER_WATCHED_COMMENT; }
  static get WATCH_COMMENT() { return FOLDER_WATCH_COMMENT; }
  static get WATCHES_POST() { return FOLDER_WATCHES_POST; }
  static get WATCHED_POST() { return FOLDER_WATCHED_POST; }
  static get WATCH_POST() { return FOLDER_WATCH_POST; }
  static get RESERVED_ACCOUNT() { return FOLDER_RESERVED_ACCOUNT; }
  static get SOCIAL_SYNC() { return FOLDER_SOCIAL_SYNC; }

  // chat
  static get CHAT_USER_KEY() { return FOLDER_CHAT_USER_KEY;  }
  static get CHAT_CONVERSATION_KEY() { return FOLDER_CHAT_CONVERSATION_KEY;  }
  static get CHAT_TOKEN() { return FOLDER_CHAT_TOKEN;  }

  // visions
  static get SOUND() { return FOLDER_SOUND; }
  static get STICKER() { return FOLDER_STICKER; }
  static get SOUND_STATS() { return FOLDER_SOUND_STATS; }
  static get STICKER_STATS() { return FOLDER_STICKER_STATS; }

  // global
  static get GLOBAL() { return FOLDER_GLOBAL; }

  // poll
  static get POLL_VOTE() { return FOLDER_POLL_VOTE; }
}


// --------------------- PROPERTY LABEL CONSTANTS ---------------------------

export const PROP_ID = '_id';
const PROP_CREATED_DATE = 'cdate';
const PROP_UPDATED_DATE = 'udate';
const PROP_EDITED_DATE = 'edate';
const PROP_DELETED_DATE = 'ddate';
const PROP_PUBLISHED_DATE = 'pdate';
const PROP_CONFIRMED_DATE = 'cfdate';
const PROP_COMPLETED_DATE = 'donedate';
// const PROP_EXPIRATION_DATE = "expdate";
const PROP_DATA_SOURCE = 'ds';
const PROP_XVERSION = 'xversion';

export const PTYPE_STREAM = 'stream';
export const PTYPE_POLL = 'poll_pst';
export const PTYPES = [
  PTYPE_STREAM,
  PTYPE_POLL,
  TYPE_VISION_POST,
  TYPE_LIVE_POST,
];

export const VISTYPE_PUBLIC = 'p';
export const VISTYPE_GROUP = 'g';
export const VISTYPE_PRIVATE = 'v';
export const VISTYPE_SUSPENDED = 's';
export const VISTYPE_DELETED = 'd';
export const VISTYPES = [
  VISTYPE_PUBLIC, VISTYPE_GROUP, VISTYPE_PRIVATE, VISTYPE_SUSPENDED, VISTYPE_DELETED,
];

export const VERSION_TITLE = 'vttl';
export const VERSION_PREVIOUS = 'vprev';
export const VERSION_NEXT = 'vnext';
export const VERSION_STATUS = 'ver';

export const VSTAT_WORKING = 'wrk';
export const VSTAT_FROZEN = 'frz';
export const VSTATUS_TYPES = [
  VSTAT_FROZEN,
];


export const ICON_URL = 'ico';
export const CONTENT_WWW_URL = 'www';
export const CONTENT_TEXT_URL = 'txt';
export const CONTENT_VIDEO_URL = 'vid';
export const CONTENT_PLAY_VIDEO_URL = 'pvid';
export const CONTENT_NONMARK_VIDEO_URL = 'nmvid';
export const CONTENT_AUDIO_URL = 'aud';
export const CONTENT_IMAGE_URL = 'img';
export const CONTENT_BGIMAGE_URL = 'bgimg'; // must be static image only
export const CONTENT_VIDEO_DURATION = 'vid_dur';
export const CONTENT_VIDEO_WIDTH = 'vid_wid';
export const CONTENT_VIDEO_HEIGHT = 'vid_hgt';
export const CONTENT_BGCOLOR = 'bgcolor'; // must be static image only
export const CONTENT_FGCOLOR = 'fgcolor'; // must be static image only

export const TAGPROP_REL = 'rel';
export const TAGPROP_WWW = 'www';

export const PREFIX_POST_ID = 'p';
export const PREFIX_COMMENT_ID = 'c';
export const PREFIX_ACTIVITYLOG_ID = 'a';
export const PREFIX_REQUEST_LOG_ID = 'rl';
export const PREFIX_LIVE_CHAT_ID = 'lc';

// visions
export const PREFIX_SOUND_ID = 's';
export const PREFIX_STICKER_ID = 't';
/**
 * XObject level property labels
 */
export class XObjectProps {
  static get ID() { return '_id'; }
  static get TYPE() { return '_t'; }
  static get PARENT() { return '_p'; }
  static get STYPE() { return 'serial'; }
  static get MAIN_DATA() { return 'data'; }
  static get AUX_DATA() { return 'aux'; }
  static get AUX_DATA_STATS() { return 'stats'; }
  static get AUX_TAGMAP() { return 'tagMap'; }
  static get RATE_LIMIT() { return 'rateLimit'; }

  static get SNAP_DATA() { return 'snap_data'; }
  static get SNAP_DATE() { return 'snap_ts'; }
  static get CREATED_DATE() { return PROP_CREATED_DATE; }
  static get UPDATED_DATE() { return PROP_UPDATED_DATE; }
  static get DELETED_DATE() { return PROP_DELETED_DATE; }
  static get EDITED_DATE() { return PROP_EDITED_DATE; }
  static get PUBLISHED_DATE() { return PROP_PUBLISHED_DATE; }
  static get RESERVE_EXPIRATION_DATE() { return 'resv_exp_date'; }
  static get EXPIRATION_DATE() { return 'exp_date'; }
  static get DATA_SOURCE() { return PROP_DATA_SOURCE; }
  static get VISIBILITY() { return 'vis'; }
  static get XVERSION() { return PROP_XVERSION; }

  static get TITLE() { return 'ttl'; }
  static get DERIVED_TITLE() { return 'dttl'; }
  static get TITLE_FORMAT() { return 'ttlf'; }
  static get ORIG_TITLE() { return 'ottl'; }
  static get ORIG_LANG() { return 'olang'; }
  static get SUBTITLE() { return 'sttl'; }
  static get VERTITLE() { return 'vttl'; }
  static get DESC() { return 'dsc'; }
  static get ICON_URL() { return ICON_URL; }
  static get BGIMG_URL() { return 'bgimg'; }
  static get LOCATION() { return 'location'; }
  static get WEBSITE() { return 'website'; }
  static get BIRTHDATE() { return 'birthdate'; }
  static get BIRTHYEAR() { return 'birthyear'; }
  static get BIRTHMONTH() { return 'birthmonth'; }
  static get BIRTHDAY() { return 'birthday'; }

  static get CHAT_USER_ID() { return 'chat_id'; }
  static get CHAT_PERMISSION() { return 'permission'; }

  static get PTYPE_STREAM() { return PTYPE_STREAM; }
  static get PTYPES() { return PTYPES; }

  static get WWW_URL() { return CONTENT_WWW_URL; }
  static get TEXT_URL() { return CONTENT_TEXT_URL; }
  static get VIDEO_URL() { return CONTENT_VIDEO_URL; }
  static get PLAY_VIDEO_URL() { return CONTENT_PLAY_VIDEO_URL; }
  static get NONMARK_VIDEO_URL() { return CONTENT_NONMARK_VIDEO_URL; }
  static get AUDIO_URL() { return CONTENT_AUDIO_URL; }
  static get IMAGE_URL() { return CONTENT_IMAGE_URL; }
  static get BGIMAGE_URL() { return CONTENT_BGIMAGE_URL; }
  static get VIDEO_DURATION() { return CONTENT_VIDEO_DURATION; }
  static get VIDEO_WIDTH() { return CONTENT_VIDEO_WIDTH; }
  static get VIDEO_HEIGHT() { return CONTENT_VIDEO_HEIGHT; }
  static get BGCOLOR() { return CONTENT_BGCOLOR; }
  static get FGCOLOR() { return CONTENT_FGCOLOR; }

  static get VISTYPE_PUBLIC() { return VISTYPE_PUBLIC; }
  static get VISTYPE_GROUP() { return VISTYPE_GROUP; }
  static get VISTYPE_PRIVATE() { return VISTYPE_PRIVATE; }
  static get VISTYPE_DELETED() { return VISTYPE_DELETED; }
  static get VISTYPES() { return VISTYPES; }
}

/**
 * XMObject level property labels
 */
export class XMObjectProps extends XObjectProps {

  static get OWNERID() { return PROP_OWNER_ID; }
  static get CREATORID() { return 'cid'; }
  static get BASED_ON() { return 'based'; }
  static get ACL() { return 'acl'; }

  static get TAGS() { return 'tags'; }
  static get MENTIONS() { return 'mentions'; }
  static get RELTAGS() { return 'rel'; }
  static get SRCTAGS() { return 'src'; }
  static get VAREXPRS() { return 'var'; }
  static get PINPOSTS() { return 'pinpsts'; }
  static get MAX_PINPOSTS() { return 1; }

  static get TAGPROP_REL() { return TAGPROP_REL; }

  static get VERSION_TITLE() { return VERSION_TITLE; }
  static get VERSION_PREV() { return VERSION_PREVIOUS; }
  static get VERSION_NEXT() { return VERSION_NEXT; }
  static get VERSION_STATUS() { return VERSION_STATUS; }
}

// ------------------ LANGUAGE CODE ---------------------------

export class LanguageCodes {
  static get ALL() { return 'all'; }
  static get DEFAULT() { return 'en'; }
  static get ENGLISH() { return 'en'; }
  static get CHINESE_SIMPLIFIED() { return 'zh'; }
  static get CHINESE_TRADITIONAL() { return 'tw'; }
  static get CANTONESE() { return 'yue'; }
  static get SPANISH() { return 'es'; }
  static get FRENCH() { return 'fr'; }
  static get GERMAN() { return 'de'; }
  static get JAPANESE() { return 'ja'; }
  static get KOREAN() { return 'ko'; }
  static get ARABIC() { return 'ar'; }
  static get RUSSIAN() { return 'ru'; }
  static get Portuguese() { return 'pt'; }
  static get Italian() { return 'it'; }
  static get Magyar() { return 'hu'; }
  static get Hindi() { return 'hi'; }
  static get Hausa() { return 'ha'; }
  static get HEBREW() { return 'he'; }
  static get EUROPEAN_PORTUGUESE() { return 'pt-PT'; }

  static get CHINESE_ALL() { return [this.CHINESE_SIMPLIFIED, this.CHINESE_TRADITIONAL]; }

  static get SUPPORTED_LANGS() {
    return [
      this.ALL,
      this.ENGLISH,
      this.CHINESE_SIMPLIFIED,
      this.CHINESE_TRADITIONAL,
      this.SPANISH,
      this.FRENCH,
      this.GERMAN,
      this.JAPANESE,
      this.KOREAN,
      this.ARABIC,
      this.RUSSIAN,
      this.Portuguese,
      this.Italian,
      this.Magyar,
      this.Hindi,
      this.Hausa,
    ];
  }

  static get SUPPORTED_SUBTITLE_LANGS() {
    return ['en-US', 'zh-CN', 'zh-TW', 'pt-BR', 'fr-FR', 'de-DE', 'es-ES', this.GERMAN,
      this.FRENCH, this.CANTONESE, this.KOREAN, this.ARABIC, this.JAPANESE, this.RUSSIAN, this.SPANISH, this.HEBREW, this.Portuguese, this.EUROPEAN_PORTUGUESE];
  }
}


// -------------------- E-MAIL / SMS COMMUNICATIONS -----------------------

// Confirmation constants
export const CONFIRM_TYPE_EMAIL = 'email';
export const CONFIRM_TYPE_SMS = 'sms';
export const CONFIRM_TYPE_TOS = 'tos';
export const CONFIRM_TYPE_SYSTEM = 'sys';

const CONFIRM_TYPES = [CONFIRM_TYPE_EMAIL, CONFIRM_TYPE_SMS, CONFIRM_TYPE_TOS];
export const DEFAULT_CONFIRM_EXPIRATION = 60 * 10000; // unit is in millisecond

// account claim related request
export const REQUEST_TYPE_CLAIM = 'claim';
export const REQUEST_TYPE_LOGIN = 'login';
export const REQUEST_TYPE_CONNECT = 'connect';
export const REQUEST_CLAIM_SRC_TW = 'tw';
export const REQUEST_CLAIM_SRC_IG = 'ig';

// Request constants
const REQUEST_TYPE_OTPLOGIN = 'otplogin';
const REQUEST_TYPE_OTPVERIFY = 'otpverify';
const REQUEST_TYPE_BIND_EMAIL = 'email';
const REQUEST_TYPE_BIND_SMS = 'sms';
const REQUEST_TYPE_CHANGE_EMAIL = 'chgemail';
const REQUEST_TYPE_CHANGE_SMS = 'chgsms';
const REQUEST_TYPE_PWDCHG = 'pwdchg';
const REQUEST_TYPE_SIGNUP = 'signup';
const REQUEST_TYPE_PWDRESET = 'pwdreset';
const REQUEST_TYPE_UPGRADE = 'upgrade';
// Social request types
const REQUEST_SOCIAL_CONNECTION = 'soconn';

const REQUEST_TYPES = [REQUEST_TYPE_OTPVERIFY, REQUEST_TYPE_OTPLOGIN, REQUEST_TYPE_BIND_EMAIL, REQUEST_TYPE_BIND_SMS, REQUEST_TYPE_CHANGE_EMAIL, REQUEST_TYPE_CHANGE_SMS,
  REQUEST_TYPE_PWDCHG, REQUEST_TYPE_SIGNUP, REQUEST_TYPE_PWDRESET, REQUEST_TYPE_UPGRADE];
export const DEFAULT_REQUEST_EXPIRATION = 60 * 10000; // unit is in millisecond

// ----------------------- FEATURE ACCESS -------------------------

export const FEATURE_SUBMIT_POST = 'spst';
export const FEATURE_REPLY_POST = 'scm1';
export const FEATURE_REPLY_COMMENT = 'scm2';
export const FEATURE_FOLLOW_USER = 'fw';
export const FEATURE_FOLLOWED_BY = 'fwb';
export const FEATURE_LIKE = 'lk';
export const FEATURE_REPOST = 'rpst';
export const FEATURE_VIEW_REPLY_POST = 'vcm1';
export const FEATURE_VIEW_REPLY_COMMENT = 'vcm2';

export const FEATURE_AUTO_FOLLOW = 'fea_autoflw';
export const FEATURE_REMOVE_POST = 'rm_post';
export const FEATURE_REMOVE_SUSPEND_USER = 'sp_user';

// System-wide enable/disabling of features by user levels.
// These are affected by LIMIT_USER_FEATURES defined at the top.

export const ENABLED_FEATURES_USER = [];
export const DISABLED_FEATURES_USER = LIMIT_USER_FEATURES ? [
  FEATURE_SUBMIT_POST, FEATURE_REPOST,
  FEATURE_FOLLOW_USER, FEATURE_FOLLOWED_BY
] : [];

export const ENABLED_FEATURES_INFLUENCER_L1 = [];
export const ENABLED_FEATURES_INFLUENCER_L2 = [];
export const ENABLED_FEATURES_INFLUENCER_L3 = [];
export const ENABLED_FEATURES_INFLUENCER_L4 = [];
export const ENABLED_FEATURES_INFLUENCER_L5 = [FEATURE_AUTO_FOLLOW];
export const DISABLED_FEATURES_INFLUENCER_L1 = [];
export const DISABLED_FEATURES_INFLUENCER_L2 = [];
export const DISABLED_FEATURES_INFLUENCER_L3 = [];
export const DISABLED_FEATURES_INFLUENCER_L4 = [];
export const DISABLED_FEATURES_INFLUENCER_L5 = [];

// Array of all enabled user features. This must map to user level from 0 - 5
export const ENABLED_FEATURES = [
  ENABLED_FEATURES_USER,
  ENABLED_FEATURES_INFLUENCER_L1,
  ENABLED_FEATURES_INFLUENCER_L2,
  ENABLED_FEATURES_INFLUENCER_L3,
  ENABLED_FEATURES_INFLUENCER_L4,
  ENABLED_FEATURES_INFLUENCER_L5
];

// Array of all disabled user features. This must map to user level from 0 - 5
export const DISABLED_FEATURES = [
  DISABLED_FEATURES_USER,
  DISABLED_FEATURES_INFLUENCER_L1,
  DISABLED_FEATURES_INFLUENCER_L2,
  DISABLED_FEATURES_INFLUENCER_L3,
  DISABLED_FEATURES_INFLUENCER_L4,
  DISABLED_FEATURES_INFLUENCER_L5
];


/**
 * Constants related to features
 */
export class FeatureConsts {

  static get LIKE() { return 'f_lk'; }
  static get FOLLOW_USER() { return 'f_fwu'; }
  static get WATCH_POST() { return 'f_pst'; }

}


/**
 * Properties for XMUser, XUserInfo, XAuthInfo, etc.
 */
export class UserProps extends XMObjectProps {
  /** match object's ID (_id) */
  static get USER_ID() { return PROP_ID; }
  static get USER_ID_GTV() { return 'gtvid'; }

  static get USER_STATS() { return 's_user'; }
  static get USER_BIO() { return 'bio'; }
  static get FIRSTNAME() { return 'firstname'; }
  static get LASTNAME() { return 'lastname'; }
  static get NICKNAME() { return 'nickname'; }
  static get USERNAME() { return 'username'; }
  static get REDIRECT() { return 'redirect'; }
  static get UUID() { return 'uuid'; }
  static get ORIG_USERNAME() { return 'ousername'; }
  static get JOINT_DATE() { return 'joint_date'; }
  static get ACTIVATED_DATE() { return 'activated_date'; }
  static get BOUND_EMAIL_DATE() { return 'bind_email_date'; }
  static get BOUND_SMS_DATE() { return 'bind_sms_date'; }
  static get REACTIVATED_DATE() { return 'reactivated_date'; }
  static get DEACTIVATED_DATE() { return 'deactivated_date'; }
  static get SUSPENDED_DATE() { return 'suspended_date'; }
  static get RECOVER_SUSPEND_DATE() { return 'recover_suspend_date'; }
  static get RANK() { return 'rank'; }
  static get POPULARITY() { return 'popular'; }
  static get COUNTRY() { return 'country'; }
  static get LANGUAGE() { return 'lang'; }
  static get SCORE() { return 'score'; }
  static get BLOCK_LIST() { return SocialProps.BLOCKED; }
  static get MUTE_LIST() { return SocialProps.MUTED; }
  static get PREF_THEME() { return 'pref_theme'; }    // see THEME_*
  static get PREF_TOPICS() { return 'topics'; }
  static get DURATION() { return 'duration'; }

  // Social Claim
  static get CLAIM_SHOW_FOLLOW() { return 'claim_show_flw'; }
  static get CLAIM_SOURCE() { return 'claim_src'; }
  static get CLAIM_FOLLOWS() { return 'twt_flw'; }
  static get CLAIM_FOLLOWED() { return 'twt_flg'; }

  static get CLAIM_PROPS() {
    return [
      this.CLAIM_SOURCE,
      this.CLAIM_FOLLOWS,
      this.CLAIM_FOLLOWED,
      this.CLAIM_SHOW_FOLLOW,
      this.SOCIAL_SYNC_FOLLOWER_IMPORTED,
      this.SOCIAL_SYNC_CRAWL_FLAG,
      this.ICON_URL,
      this.BGIMG_URL
    ];
  }

  static get CLAIM_SOURCES() {
    return [
      'tw',
      'ig',
      // 'fb'
    ];
  }

  // Social Connect
  static get SOCIAL_SYNC_CONFIGS() { return 'socialsync_configs'; }
  static get SOCIAL_SYNC_SITENAME() { return 'sitename'; }
  static get SOCIAL_SYNC_ALLOWED() { return 'allowed'; }
  static get SOCIAL_SYNC_FLAG() { return 'sync_flag'; }
  static get SOCIAL_SYNC_VERIFY_PASS() { return 'verify_pass'; }
  static get SOCIAL_SYNC_UNINAME() { return 'uni_name'; }
  static get SOCIAL_SYNC_NICKNAME() { return 'nickname'; }
  static get SOCIAL_SYNC_CRAWL_FLAG() { return 'crawl_flag'; }
  static get SOCIAL_SYNC_FOLLOWER_IMPORTED() { return 'flw_impd'; }
  static get SOCIAL_SYNC_FOLLOWERS() { return 'socialsync_flr'; }
  static get SOCIAL_SYNC_FOLLOWING() { return 'socialsync_flg'; }
  static get SOCIAL_SYNC_SHOW_FOLLOW() { return 'socialsync_show_fl'; }
  static get TWITTER_SYNC_ALLOWED() { return 'twt_sync_allowed'; }
  static get TWITTER_SYNC_FLAG() { return 'twt_sync_flag'; }
  static get TWITTER_OAUTH_PASS() { return 'twt_oauth_pass'; }
  static get TWITTER_NAME() { return 'twt_name'; }
  static get TWITTER_SCREEN_NAME() { return 'twt_screen_name'; }

  static get SUPPORTED_SITENAMES() {
    return [
      SITE_TWITTER,
    ];
  }

  static get SUPPORTED_SITENAMES_CONNECT() {
    return [
      SITE_TWITTER, SITE_INSTAGRAM,
    ];
  }

  static get SOCIAL_SYNC_SITE_PROPS() {
    return [
      this.SOCIAL_SYNC_SITENAME,
      this.SOCIAL_SYNC_ALLOWED,
      this.SOCIAL_SYNC_FLAG,
      this.SOCIAL_SYNC_VERIFY_PASS,
      this.SOCIAL_SYNC_UNINAME,
      this.SOCIAL_SYNC_NICKNAME,
      this.SOCIAL_SYNC_CRAWL_FLAG,
      this.SOCIAL_SYNC_FOLLOWER_IMPORTED,
      this.SOCIAL_SYNC_FOLLOWERS,
      this.SOCIAL_SYNC_FOLLOWING,
      this.SOCIAL_SYNC_SHOW_FOLLOW,
    ];
  }

  // Invite Users
  static get INVITER() { return 'inviter'; }
  static get INVITATION_CODE() { return 'invitation_code'; }

  static get PUBLIC_PROPS() {
    return [
      this.ID,
      this.ICON_URL,
      this.BGIMG_URL,
      this.NICKNAME,
      this.USERNAME,
      this.ORIG_USERNAME,
      this.JOINT_DATE,
      this.USER_STATS,
      this.LANGUAGE,
      this.CLAIM_FOLLOWED,
      this.CLAIM_FOLLOWS,
      this.CLAIM_SHOW_FOLLOW,
      this.CLAIM_SOURCE,
      this.CREATED_DATE,
      this.ROLE_INFLUENCER,
      this.LIVE_POST,
      this.LIVE_SCHEDULE,
      this.LIVE_STREAMING,
    ];
  }

  static get PUBLIC_CHAT_PROPS() {
    return [
      this.ID,
      this.ICON_URL,
      this.NICKNAME,
      this.ORIG_USERNAME,
      this.ROLE_INFLUENCER,
    ];
  }
  static get TEST_LOADER() { return 'backend/testloader'; }
  static get META() { return 'meta'; }

  // chat props
  static get CHAT_CONFIGS() { return 'chat_configs'; }

  // livestream props
  static get LIVE_ACTION() { return 'action'; }
  static get LIVE_ROLE() { return 'role'; }
  static get LIVE_POSTID() { return 'postId'; }
  static get LIVE_POST() { return 'lv_pst'; }
  static get LIVE_HOSTID() { return 'lv_hstId'; }
  static get LIVE_ASSISTIDS() { return 'lv_astIds'; }
  static get LIVE_STREAMID() { return 'sid'; }
  static get LIVE_CONFIGS() { return 'lv_configs'; }
  static get LIVE_MAX_DURATION() { return 'max_dur'; }
  static get LIVE_ROLE_EXPIRE() { return 'lv_expire'; }
  static get AUTH_APP() { return 'auth_app'; }
  static get IS_FOLLOWING_HOST() { return 'flw_hst'; }
  static get SOURCE_ADDRESS() { return 'sourceAddress'; }
  static get IS_CHAT_MUTED() { return 'isMuted'; }
  static get LIVE_STREAMING() { return 'streaming'; }

  static get LIVE_ROLE_PROPS() {
    return [
      this.LIVE_MAX_DURATION,
      this.LIVE_ROLE_EXPIRE,
    ];
  }

  // schedule props
  static get LIVE_SCHEDULE() { return 'lv_schedule'; }
  static get SCHEDULE_ID() { return 'schedule_id'; } // userId + schedule_start
  static get SCHEDULE_POST_ID() { return 'schedule_post_id'; }
  static get SCHEDEULE_START() { return 'schedule_start'; }
  static get SCHEDEULE_DURATION() { return 'schedule_duration'; }
  static get SCHEDEULE_REOCCUR() { return 'schedule_reoccur'; }
  static get SCHEDEULE_REOCCUR_WEEK() { return 'schedule_reoccur_week'; } // day 1 - 7
  static get SCHEDEULE_REOCCUR_MONTH() { return 'schedule_reoccur_month'; } // day 1 - 31

  static get USER_LIVESTREAM_SCHEDULE_PROPS() {
    return [
      this.SCHEDEULE_START,
      this.SCHEDEULE_DURATION,
      // this.SCHEDEULE_REOCCUR,
      // this.SCHEDEULE_REOCCUR_WEEK,
      // this.SCHEDEULE_REOCCUR_MONTH,
    ];
  }

  // livestream config props
  static get LIVE_CONFIG_DEVICE() { return 'device'; }
  static get LIVE_CONFIG_IS_MUTED() { return 'isMuted'; }
  static get LIVE_CONFIG_FRONT_CAMERA() { return 'frontCamera'; }
  static get LIVE_CONFIG_CHAT_ENABLED() { return 'chatEnable'; }
  static get LIVE_CONFIG_LANDSCAPE() { return 'landscape'; }
  static get LIVE_CONFIG_HEIGHT() { return 'height'; }
  static get LIVE_CONFIG_WIDTH() { return 'width'; }
  static get LIVE_CONFIG_CUSTOMIZE() { return 'customize'; }
  static get LIVE_CONFIG_CHANNEL_CONFIGS() { return 'channelConfigs'; }
  static get LIVE_CONFIG_CHANNELID() { return 'channelId'; }
  static get LIVE_CONFIG_AUTOSTART() { return 'autoStart'; }
  static get LIVE_CONFIG_TITLE() { return XObjectProps.TITLE; }
  static get LIVE_CONFIG_DESCRIPTION() { return XObjectProps.DESC; }
  static get LIVE_CONFIG_COVER_IMAGE() { return XObjectProps.IMAGE_URL; }
  // static get LIVE_CONFIG_SUBTITLE_ENABLED() { return 'subEnabled'; }
  // static get LIVE_CONFIG_SUBTITLE_LANG() { return 'fromLang'; }
  static get LIVE_CONFIG_VERSION_TAG() { return 'versionTag'; }
  static get LIVE_CONFIG_VERSION() { return 'configVersion'; }
  static get LIVE_CONFIG_CHANNEL_NAME() { return 'channelName'; }
  static get LIVE_CONFIG_STREAM_TYPE() { return 'streamType'; }
  static get LIVE_CONFIG_RESOURCE_TYPE() { return 'resourceType'; }
  static get LIVE_CONFIG_REGION() { return 'region'; }
  static get LIVE_CONFIG_CATEGORIES() { return 'categories'; }

  static get START_LIVE_STREAM_PROPS() {
    return [
      this.LIVE_CONFIG_IS_MUTED,
      this.LIVE_CONFIG_FRONT_CAMERA,
      this.LIVE_CONFIG_CHAT_ENABLED,
      this.LIVE_CONFIG_LANDSCAPE,
      this.LIVE_CONFIG_HEIGHT,
      this.LIVE_CONFIG_WIDTH,
      this.LIVE_CONFIG_CUSTOMIZE,
    ];
  }

  static get LIVE_CONFIG_PROPS() {
    return [
      this.LIVE_HOSTID,
      this.LIVE_ASSISTIDS,
      this.LIVE_POST,
      this.LIVE_CONFIG_DEVICE,
      this.LIVE_CONFIG_IS_MUTED,
      this.LIVE_CONFIG_FRONT_CAMERA,
      this.LIVE_CONFIG_CHAT_ENABLED,
      this.LIVE_CONFIG_LANDSCAPE,
      this.LIVE_CONFIG_HEIGHT,
      this.LIVE_CONFIG_WIDTH,
      this.LIVE_CONFIG_CUSTOMIZE,
      this.LIVE_CONFIG_CHANNEL_CONFIGS,
    ];
  }

  static get USER_MUTABLE_LIVE_CONFIG_PROPS() {
    return [
      this.LIVE_CONFIG_DEVICE,
      this.LIVE_CONFIG_IS_MUTED,
      this.LIVE_CONFIG_FRONT_CAMERA,
      this.LIVE_CONFIG_CHAT_ENABLED,
      this.LIVE_CONFIG_LANDSCAPE,
      this.LIVE_CONFIG_HEIGHT,
      this.LIVE_CONFIG_WIDTH,
      this.LIVE_CONFIG_CUSTOMIZE,
      this.LIVE_CONFIG_CHANNEL_CONFIGS,
    ];
  }

  static get ADMIN_MUTABLE_LIVE_CONFIG_PROPS() {
    return [
      this.LIVE_CONFIG_IS_MUTED,
      this.LIVE_CONFIG_CHAT_ENABLED,
      this.LIVE_CONFIG_CHANNEL_CONFIGS,
      this.LIVE_CONFIG_CATEGORIES,
    ];
  }

  static get LIVE_CONFIG_PUBLIC_PROPS() {
    return [
      this.LIVE_HOSTID,
      this.LIVE_POST,
      this.LIVE_CONFIG_IS_MUTED,
      this.LIVE_CONFIG_CHAT_ENABLED,
    ];
  }

  static get USER_MUTABLE_CHANNEL_PROPS() {
    return [
      this.LIVE_CONFIG_AUTOSTART,
      this.LIVE_CONFIG_CHAT_ENABLED,
      this.LIVE_CONFIG_IS_MUTED,
      this.LIVE_CONFIG_CHANNEL_NAME,
      this.LIVE_CONFIG_TITLE,
      this.LIVE_CONFIG_DESCRIPTION,
      this.LIVE_CONFIG_COVER_IMAGE,

      // this.LIVE_CONFIG_SUBTITLE_ENABLED,
      // this.LIVE_CONFIG_SUBTITLE_LANG,
    ];
  }

  /**
   "resourceType": null,
   "streamType": "MuxMedia",
   #"region": null,
   "isMuted": false
   * @returns {(string|string)[]}
   * @constructor
   */
  static get USER_CHANNEL_PROPS() {
    return [
      this.LIVE_CONFIG_CHANNEL_NAME,
      this.LIVE_CONFIG_CHANNELID,
      this.LIVE_CONFIG_AUTOSTART,
      this.LIVE_CONFIG_VERSION_TAG,
      this.LIVE_CONFIG_TITLE,
      this.LIVE_CONFIG_DESCRIPTION,
      this.LIVE_CONFIG_COVER_IMAGE,
      this.LIVE_CONFIG_STREAM_TYPE,
      this.LIVE_CONFIG_RESOURCE_TYPE,
      this.LIVE_CONFIG_IS_MUTED,
      this.LIVE_CONFIG_CHAT_ENABLED,
    ];
  }

  // private props
  static get TOKEN() { return 'token'; }
  static get TOKEN_GVERSION() { return 't_gver'; }
  static get TOKEN_CVERSION() { return 't_cver'; }
  static get EMAIL() { return 'email'; }
  static get EMAIL_HISTORY() { return 'email_hist'; }
  static get USERNAME_HISTORY() { return 'username_hist'; }
  static get SMS() { return 'sms'; }
  static get SMS_HISTORY() { return 'sms_hist'; }
  static get COUNTRY_CODE() { return 'country_code'; }
  static get DEVICEID() { return 'deviceID'; }
  static get DEVICE_INFO() { return 'device'; }
  static get DIGEST() { return 'digest'; }
  static get VCODE() { return 'vcode'; }

  // NOTE: 2021-05-01: JoeC: removed LANGUAGE so it will show up in public user info. Need it in order to filter suggestions by language
  // and can be useful in other functions.
  static get PRIVATE_PROPS() {
    return [
      this.TOKEN,
      this.TOKEN_GVERSION,
      this.TOKEN_CVERSION,
      this.EMAIL,
      this.EMAIL_HISTORY,
      this.SMS,
      this.SMS_HISTORY,
      this.FIRSTNAME,
      this.LASTNAME,
      this.COUNTRY,
      this.RANK,
      this.POPULARITY,
      this.SCORE,
      this.BLOCK_LIST,
      this.MUTE_LIST,
      this.BIRTHYEAR,
      this.BIRTHMONTH,
      this.BIRTHDAY,
      this.BIRTHDATE,
      this.FEATURE_GROUP_APP,
      this.FEATURE_GROUP_APP_DISABLED,
      this.APPUSER_ROLES,
      this.LIVE_CONFIGS,
      this.SOCIAL_SYNC_CONFIGS,
      this.SOCIAL_SYNC_SITE_PROPS,
      this.INVITER,
      this.INVITATION_CODE,
      this.USERNAME_HISTORY,
      UserStatsProps.USER_INVITES,

      // Chat props
      this.CHAT_CONFIGS,

      // Social status
      this.AUTH_GOOGLE_ID,
      this.AUTH_APPLE_ID,
      this.AUTH_FB_ID,
    ];
  }
  /**
   * DO NOT CHANGE THIS  PART WITHOUT DOUBLE CONFIRM WITH FRONT_END AND TESTING!!!!
   */
  static get USER_PROFILE_UPDATABLE_PROPS() {
    return [
      this.ICON_URL,
      this.BGIMG_URL,
      this.NICKNAME,
      this.DESC,
      this.LANGUAGE,
      this.LOCATION,
      this.WEBSITE,
      this.BIRTHDATE,
    ];
  }
  /**
   * DO NOT CHANGE THIS PART WITHOUT DOUBLE CONFIRM WITH FRONT_END AND TESTING!!!!
   */
  static get CHAT_UPDATABLE_PROPS() {
    return [
      this.CHAT_USER_ID,
      this.CHAT_PERMISSION,
    ];
  }

  /**
   * DO NOT CHANGE THIS  PART WITHOUT DOUBLE CONFIRM WITH FRONT_END AND TESTING!!!!
   */
  static get LIVEPOST_UPDATABLE_PROPS() {
    return [
      this.TITLE,
      this.DESC,
      this.IMAGE_URL,
      this.LIVE_ACTION,
      this.IS_CHAT_MUTED,
    ];
  }

  static get USER_LIVESTREAM_PROPS() {
    return [
      this.ID,
      this.USERNAME,
      this.NICKNAME,
      this.ORIG_USERNAME,
      this.LANGUAGE,
      this.UUID,
      this.PROP_INFLUENCER_LEVEL,
      this.ROLE_INFLUENCER,
      this.ICON_URL,
      this.CREATED_DATE,
      this.ACTION,
      this.LIVE_POST,
      this.LIVE_SCHEDULE,
      this.LIVE_CONFIGS,
      UserStatsProps.FOLLOWED,
      UserStatsProps.FOLLOWS,
    ];
  }

  static get USER_SIGNUP_UPDATABLE_PROPS() {
    return [
      this.USERNAME,
      this.ORIG_USERNAME,
      this.NICKNAME,
      this.FIRSTNAME,
      this.LASTNAME,
      this.EMAIL,
      this.SMS,
      this.LANGUAGE,
      this.BIRTHYEAR,
      this.BIRTHMONTH,
      this.BIRTHDAY,
      this.INVITER,
    ];
  }

  static get USER_SIGNUP_FROM_IMPORT_UPDATABLE_PROPS() {
    return this.USER_SIGNUP_UPDATABLE_PROPS.concat([
      this.ROLE_INFLUENCER,
      this.CREATED_DATE,
      this.UPDATED_DATE,
      this.STATUS,   // TODO: temporary will be removed in the next fix
      this.CLAIM_FOLLOWS,
      this.CLAIM_FOLLOWED,
      this.CLAIM_SHOW_FOLLOW,
      this.CLAIM_SOURCE,
    ]);
  }

  static get USER_QUICK_SIGNUP_UPDATABLE_PROPS() {
    return [
      this.USERNAME,
      this.ORIG_USERNAME,
      this.NICKNAME,
      this.LANGUAGE,
      this.BIRTHYEAR,
      this.BIRTHMONTH,
      this.BIRTHDAY,
      this.DEVICEID,  // mobile only
      this.DIGEST,    // mobile only
      this.VCODE
    ];
  }

  static get USERINFO_FILL_FROM_USER_PROPS() {
    return [
      this.ID, this.TOKEN, this.NICKNAME,
      this.EMAIL, this.SMS, this.USERNAME, this.ORIG_USERNAME, this.USERNAME_HISTORY,
      this.DESC, this.TAGS, this.STATUS, this.POPULARITY, this.PINPOSTS, this.LIVE_POST, this.LIVE_SCHEDULE, this.LIVE_CONFIGS, this.LIVE_STREAMING,
      this.CREATED_DATE, this.UPDATED_DATE, this.LANGUAGE, this.RANK, this.SCORE,
      this.ROLE_INFLUENCER, this.META,
      this.ICON_URL, this.BGIMG_URL, this.LOCATION, this.WEBSITE,
      this.CLAIM_FOLLOWED, this.CLAIM_FOLLOWS, this.CLAIM_SHOW_FOLLOW, this.CLAIM_SOURCE,
      this.VISIBILITY, this.INVITER, this.SOCIAL_SYNC_CONFIGS, this.XVERSION,
      StatsProps.FOLLOWS, StatsProps.FOLLOWED, StatsProps.LIKES_POST, StatsProps.LIKES_COMMENT,
      StatsProps.SHARES_POST, StatsProps.VIEWS_FULL_POST, StatsProps.USER_INVITES,
      ...this.USER_GRANTABLE_FEATURE_GROUPS,

      // chat configs
      this.CHAT_CONFIGS,
      // social status
      this.AUTH_GOOGLE_ID, this.AUTH_APPLE_ID, this.AUTH_FB_ID,
    ];
  }

  static get USER_CREATE_FROM_USERINFO_PROPS() {
    return [
      this.ID, this.ICON_URL, this.TOKEN,
      this.EMAIL, this.SMS, this.NICKNAME,
      this.USERNAME, this.ORIG_USERNAME,
      this.BIRTHYEAR,
      this.BIRTHMONTH,
      this.BIRTHDAY,
      this.BIRTHDATE,
      this.DESC, this.TAGS, this.LANGUAGE,
      this.CREATED_DATE,
      this.ROLE_INFLUENCER,
      this.STATUS, this.RANK, this.POPULARITY, this.SCORE,
      this.CLAIM_FOLLOWS, this.CLAIM_FOLLOWED, this.CLAIM_SHOW_FOLLOW, this.CLAIM_SOURCE,
      this.DEVICEID, this.INVITER, this.SOCIAL_SYNC_CONFIGS,
    ];
  }

  static get AUTH_GETTER() { return 'gt'; }
  static get AUTH_FACEBOOK() { return 'fb'; }
  static get AUTH_GOOGLE() { return 'gg'; }
  static get AUTH_APPLE() { return 'ap'; }
  static get AUTH_TWITTER() { return 'tw'; }
  static get AUTH_OTHER() { return 'unknown'; }

  static get AUTH_INFO() { return 'auth_info'; }
  static get AUTH_PWD_ENC_OLD() { return 'fr_pwd'; }
  static get AUTH_PWD_ENC() { return 'pwd'; }
  static get AUTH_PWD_CLR() { return 'pwd'; }
  static get AUTH_PWD_CLR2() { return 'cpwd2'; }
  static get AUTH_PWD_HINT() { return 'pwd_hint'; }

  static get AUTH_TW_ID() { return 'tw_id'; }
  static get AUTH_TW_TOKEN() { return 'tw_token'; }
  static get AUTH_TW_TOKEN_EXP() { return 'twtoken_exp'; }

  static get AUTH_GOOGLE_ID() { return 'gg_id'; }
  static get AUTH_GOOGLE_TOKEN() { return 'gg_token'; }
  static get AUTH_GOOGLE_TOKEN_EXP() { return 'gg_token_exp'; }
  static get AUTH_GOOGLE_ACCESS_TOKEN() { return 'gg_a_token'; }
  static get AUTH_GOOGLE_REFRESH_TOKEN() { return 'gg_r_token'; }
  static get AUTH_APPLE_ID() { return 'ap_id'; }
  static get AUTH_APPLE_TOKEN() { return 'ap_token'; }
  static get AUTH_APPLE_TOKEN_EXP() { return 'ap_token_exp'; }
  static get AUTH_APPLE_ACCESS_TOKEN() { return 'ap_a_token'; }
  static get AUTH_APPLE_REFRESH_TOKEN() { return 'ap_r_token'; }
  static get AUTH_FB_ID() { return 'fb_id'; }
  static get AUTH_FB_TOKEN() { return 'fb_token'; }
  static get AUTH_FB_ACCESS_EXP() { return 'fb_access_exp'; }
  // @deprecated
  static get FB_ICON_URL() { return 'fb_ico'; }
  // @deprecated
  static get FB_EMAIL() { return 'fb_email'; }
  // @deprecated
  static get FB_NICKNAME() { return 'fb_name'; }

  static get CONN_FOLLOWS_USERS() { return 'followsUsers'; }
  static get CONN_FOLLOWERS_USERS() { return 'followersUsers'; }

  static get CONFIRM_ACTION_TYPE() { return 'action'; }
  static get CONFIRM_ACTION_TARGET() { return 'target'; }
  static get CONFIRM_ACTION_SOURCE() { return 'source'; }
  static get CONFIRMED_DATE() { return PROP_CONFIRMED_DATE; }
  static get CONFIRM_EMAIL() { return CONFIRM_TYPE_EMAIL; }
  static get CONFIRM_SMS() { return CONFIRM_TYPE_SMS; }
  static get CONFIRM_SYSTEM() { return CONFIRM_TYPE_SYSTEM; }
  static get CONFIRM_TOS() { return CONFIRM_TYPE_TOS; }
  static get CONFIRM_TYPES() { return CONFIRM_TYPES; }

  static get NOTIF_NEWS() { return 'nf_news'; }
  static get NOTIF_USER_FOLLOWED() { return 'nf_ufol'; }
  static get NOTIF_POST_WATCHED() { return 'nf_pwd'; }
  static get NOTIF_POST_LIKED() { return 'nf_plkd'; }
  static get NOTIF_POST_SHARED() { return 'nf_pshr'; }
  static get NOTIF_POST_COMMENTED() { return 'nf_pcmd'; }

  static get PASSWORD_MIN_LENGTH() { return 4; }

  static get REQUEST_ACTION_TYPE() { return 'action'; }
  static get REQUEST_ACTION_TARGET() { return 'target'; }
  static get REQUEST_ACTION_SOURCE() { return 'source'; }
  static get COMPLETED_BY() { return 'doneby'; }
  static get COMPLETED_DATE() { return PROP_COMPLETED_DATE; }
  static get REQUEST_BIND_EMAIL() { return REQUEST_TYPE_BIND_EMAIL; }
  static get REQUEST_BIND_SMS() { return REQUEST_TYPE_BIND_SMS; }
  static get REQUEST_CHANGE_EMAIL() { return REQUEST_TYPE_CHANGE_EMAIL; }
  static get REQUEST_CHANGE_SMS() { return REQUEST_TYPE_CHANGE_SMS; }
  static get REQUEST_PWDCHG() { return REQUEST_TYPE_PWDCHG; }
  static get REQUEST_PWDRESET() { return REQUEST_TYPE_PWDRESET; }
  static get REQUEST_SIGNUP() { return REQUEST_TYPE_SIGNUP; }
  static get REQUEST_UPGRADE() { return REQUEST_TYPE_UPGRADE; }
  static get REQUEST_OTPLOGIN() { return REQUEST_TYPE_OTPLOGIN; }
  static get REQUEST_OTPVERIFY() { return REQUEST_TYPE_OTPVERIFY; }
  static get REQUEST_TYPES() { return REQUEST_TYPES; }
  static get REQUEST_TYPES_MUSTAUTH() {
    return [
      this.REQUEST_UPGRADE,
      this.REQUEST_CHANGE_EMAIL,
      this.REQUEST_CHANGE_SMS,
      this.REQUEST_BIND_EMAIL,
      this.REQUEST_BIND_SMS,
    ];
  }

  // social auth request types
  static get REQUEST_SOCIAL_CONNECTION() { return REQUEST_SOCIAL_CONNECTION; }


  static get APPUSER_ROLES() { return 'roles'; }
  static get ROLE_ROOT() { return 'root'; }
  static get ROLE_ADMIN() { return 'adm'; }
  static get ROLE_SYSADM() { return 'sysadm'; }
  static get ROLE_MODERATOR() { return 'mod'; }
  static get ROLE_INFLUENCER() { return 'infl'; }
  static get ROLE_DATAADM() { return 'dataadm'; }
  static get ROLE_LIVEUSER() { return 'liveusr'; }
  static get ROLE_LIVEADM() { return 'liveadm'; }
  static get ROLE_LIVEMOD() { return 'livemod'; }
  static get ROLE_LIVEASSIST() { return 'liveassist'; }
  static get ROLE_OPERATOR() { return 'optor'; }

  static get USER_GRANTABLE_ROLES() {
    return [
      this.ROLE_ADMIN,
      this.ROLE_SYSADM,
      this.ROLE_MODERATOR,
      this.ROLE_INFLUENCER,
      this.ROLE_DATAADM,
      this.ROLE_OPERATOR,
      this.ROLE_LIVEADM,
      this.ROLE_LIVEMOD,
      this.ROLE_LIVEASSIST,
      this.ROLE_LIVEUSER,
    ];
  }

  static get ROLE_PROP_START() { return 'start'; }
  static get ROLE_PROP_EXPIRE() { return 'expiry'; }
  static get PROP_INFLUENCER_LEVEL() { return 'lvl'; }

  static get ROLE_PROPS() {
    return this.LIVE_ROLE_PROPS.concat([
      this.PROP_INFLUENCER_LEVEL,
      this.ROLE_PROP_START,
      this.ROLE_PROP_EXPIRE,
    ]);
  }

  static get INFLUENCER_LEVEL_NONE() { return 0; }
  static get INFLUENCER_LEVEL_MIN() { return 1; }
  static get INFLUENCER_LEVEL_2() { return 2; }
  static get INFLUENCER_LEVEL_3() { return 3; }
  static get INFLUENCER_LEVEL_4() { return 4; }
  static get INFLUENCER_LEVEL_MAX() { return 5; }

  static get FEATURE_GROUP_APP() { return 'fg_app'; }
  static get FEATURE_GROUP_APP_DISABLED() { return 'fg_app_disabled'; }
  static get FEATURE_PREVIEW() { return 'fea_preview'; }
  static get FEATURE_IMPORT_POST() { return 'fea_importp'; }
  static get FEATURE_IMPORT_USER() { return 'fea_importu'; }
  static get FEATURE_IMPORT_PROFILE() { return 'fea_importpf'; }
  static get FEATURE_MANAGE_CONTENT() { return 'fea_mancntt'; }

  static get FEATURE_GROUP_USER() { return 'fg_user'; }
  static get FEATURE_ACCESS_APP() { return 'access_app'; }
  static get FEATURE_SUBMIT_POST() { return 'submit_post'; }
  static get FEATURE_SUBMIT_COMMENT() { return 'submit_cm'; }
  static get FEATURE_SHARE_POST() { return 'share_post'; }
  static get FEATURE_SHARE_COMMENT() { return 'share_cm'; }
  static get FEATURE_USER_FOLLOWS() { return 'user_follows'; }
  static get FEATURE_USER_LIKES() { return 'user_likes'; }
  static get FEATURE_USER_REPOST() { return 'submit_repost'; }
  static get FEATURE_USER_HOST_LIVESTREAM() { return 'host_live'; }
  static get FEATURE_USER_JOIN_LIVESTREAM() { return 'join_live'; }
  static get FEATURE_USER_LIVESTREAM_CHAT() { return 'live_chat'; }

  static get FEATURE_GROUP_SUPER_INFLUENCER() { return 'fg_superv'; }
  static get FEATURE_AUTO_FOLLOW() { return 'fea_autoflw'; }

  static get FEATURE_SUSPEND_USER() { return FEATURE_REMOVE_SUSPEND_USER; }

  static get USER_GRANTABLE_FEATURE_GROUPS() {
    return [
      this.FEATURE_GROUP_APP,
      this.FEATURE_GROUP_APP_DISABLED,
      this.FEATURE_GROUP_USER,
      this.FEATURE_GROUP_SUPER_INFLUENCER
    ];
  }

  static get USER_GRANTABLE_FEATURES() {
    return [
      this.FEATURE_IMPORT_USER,
      this.FEATURE_IMPORT_POST,
      this.FEATURE_SUBMIT_POST,
      this.FEATURE_SHARE_POST,
      this.FEATURE_SHARE_COMMENT,
      this.FEATURE_SUBMIT_COMMENT,
      this.FEATURE_USER_FOLLOWS,
      this.FEATURE_USER_LIKES,
      this.FEATURE_USER_REPOST,
      this.FEATURE_AUTO_FOLLOW,
      this.FEATURE_IMPORT_PROFILE,
      this.FEATURE_ACCESS_APP,
    ];
  }

  static get USER_GRANTABLE_LIVESTREAM_FEATURES() {
    return [
      this.FEATURE_USER_HOST_LIVESTREAM,
      this.FEATURE_USER_JOIN_LIVESTREAM,
      this.FEATURE_USER_LIVESTREAM_CHAT,
    ];
  }

  static get FEATURE_PROP_START() { return 'start'; }
  static get FEATURE_PROP_EXPIRE() { return 'expiry'; }
  static get FEATURE_PROPS() {
    return [
      this.FEATURE_PROP_START,
      this.FEATURE_PROP_EXPIRE,
      this.LIVE_HOSTID,
      this.LIVE_STREAMID,
    ];
  }

  static get NICKNAME_GUEST() { return NICKNAME_GUEST; }
  static get NICKNAME_ROBOT() { return NICKNAME_GUEST; }

  static get SETTINGS_PROFILE() { return 'profile'; }
  static get SETTINGS_ACCOUNT() { return 'account'; }
  static get SETTINGS_FEEDS() { return 'feeds'; }
  static get SETTINGS_CONNECTIONS() { return 'conn'; }
  static get SETTINGS_NOTIFICATIONS() { return 'notif'; }
  static get SETTINGS_PRIVACY() { return 'privsec'; }
  static get SETTINGS_PREFERENCES() { return 'prefsec'; }
  static get SETTINGS_INTERESTS() { return 'prefintr'; }

  static get STATUS() { return 'status'; }
  static get STATUS_TS() { return 'ts_status'; }
  static get STATUS_QUICKSIGNUP() { return 'qs'; }
  static get STATUS_EXPRESSSIGNUP() { return 'es'; }
  static get STATUS_IMPORTED() { return 'ui'; }
  static get STATUS_UNVERIFIED() { return 'uv'; }
  static get STATUS_ACTIVE() { return 'a'; }
  static get STATUS_RESERVED() { return 'rv'; }
  static get STATUS_SUSPENDED() { return 's'; }
  static get STATUS_DELETED() { return 'd'; }
  static get STATUS_DEACTIVATED() { return 'da'; }
  static get STATUS_UNKNOWN() { return 'uk'; }
  static get STATUS_TYPES() {
    return [
      this.STATUS_QUICKSIGNUP,
      this.STATUS_EXPRESSSIGNUP,
      this.STATUS_UNVERIFIED,
      this.STATUS_ACTIVE,
      this.STATUS_DEACTIVATED,
      this.STATUS_DELETED,
      this.STATUS_SUSPENDED];
  }

  static get STATUS_ACTIVE_TYPES() {
    return [
      this.STATUS_QUICKSIGNUP,
      this.STATUS_EXPRESSSIGNUP,
      this.STATUS_ACTIVE,
      this.STATUS_UNVERIFIED,
      this.STATUS_IMPORTED,
      this.STATUS_RESERVED
    ];
  }

  static get TOKEN_GUEST() { return TOKEN_GUEST; }
  static get TOKEN_ROBOT() { return TOKEN_ROBOT; }

  static get THEME_LITE() { return 'lite'; }
  static get THEME_DARK() { return 'dark'; }

  static get USERNAME_MIN_LENGTH() { return 5; }
  static get USERNAME_MAX_LENGTH() { return 30; }
  static get NICKNAME_MIN_LENGTH() { return 1; }
  static get NICKNAME_MAX_LENGTH() { return 100; }
  static get PROFILE_DESC_MAX_LENGTH() { return 400; }
  static get PROFILE_LOCATION_MAX_LENGTH() { return 200; }
  static get PROFILE_LANG_MAX_LENGTH() { return 10; }
  static get PROFILE_META_MAX_LENGTH() { return 2048; }
  static get PROFILE_WEBSITE_MAX_LENGTH() { return 100; }
  static get PROFILE_REQ_MAX_LENGTH() { return 4096; }
  static get TAG_MAX_LENGTH() { return 200; }
  static get USERID_GUEST() { return USERID_GUEST; }
  static get USERID_ROBOT() { return USERID_ROBOT; }
  static get USERID_TEMP() { return USERID_TEMP; }
  static get USER_PASSWORD_LENGTH() { return 6; }

  static get VERIFIED_CONTACT() { return 'vc'; }
  static get VERIFIED_EMAIL_CFID() { return 'cfid_email'; }
  static get VERIFIED_SMS_CFID() { return 'cfid_sms'; }

  /**
   * Use USER_EDITABLE_PROPS instead to make it more generic
   */
  // static get PROFILE_UPDATE_FIELDS() {
  //   return [
  //     ICON_URL,
  //     'bgimg',
  //     'nickname',
  //     'dsc',
  //     'location',
  //     'website',
  //     'birthdate',
  //     'lang'
  //   ];
  // }
}

// ------------- ACTIVITY LOG / NOTIFICATION / ALERT MESSAGE / FEED -----------------

/**
 * Message type. Can be either notification,
 * initiator history, etc.
 */
const PROP_MSGTYPE = 'mtype';
const PROP_SORTBY = 'sortby';

export const API_TYPE_SYS = 'sys';
export const API_TYPE_USER = 'usr';
export const API_TYPE_API = 'api';
export const API_TYPE_WEBHOOK = 'webhook';
export const API_TYPE_SVC = 'svc';

const PROP_ACTION = 'action';
const PROP_TOPICS = 'topics';
const PROP_ACTION_STATUS = 'status';
const PROP_ACTION_START_TS = 'ts_start';
const PROP_ACTION_STOP_TS = 'ts_stop';
const PROP_ACTIVITY_ID = '_id';
const PROP_DEPTH_LEVEL = 'depth';
const PROP_INITIATOR_ID = 'init_id';
const PROP_INITIATOR_LEVEL = 'init_lvl';
const PROP_HAS_MEDIA = 'media';
const PROP_HAS_NOTIFIED = 'notified';
// const PROP_INVERSE_LOG_ID = "inv_id";
const PROP_LOGSRC = 'src';
const PROP_PARENT_LOG_ID = 'p_id';
const PROP_POST_ID = 'pstid';
const PROP_POST_TYPE = 'p_type';
const PROP_COMMENT_POST_ID = 'pid';
const PROP_USER_INFO = 'uinf';
const PROP_IMPORT_POST_ID = 'ipid';
const PROP_PARENT_COMMENT_ID = 'pcid';
const PROP_ORIG_POST_ID = 'opid';
const PROP_ORIG_POST_OWNER_ID = 'opuid';
const PROP_OWNER_ID = 'uid';
const PROP_PARENT_OWNER_ID = 'puid';
const PROP_SRC_TYPE = 'src_type';
const PROP_SRC_ID = 'src_id';
const PROP_SRC_OWNER_ID = 'src_oid';
const PROP_SRC_OBJECT = 'src_obj';
const PROP_TGT_TYPE = 'tgt_type';
const PROP_TGT_ID = 'tgt_id';
const PROP_TGT_OWNER_ID = 'tgt_oid';
const PROP_TGT_USER_LEVEL = 'tgt_lvl';
const PROP_TGT_OBJECT = 'tgt_obj';
const PROP_RPS_TYPE = 'rps_type';
const PROP_RPS_IDS = 'rpstIds';
const PROP_RPS_OWNER_IDS = 'rusrIds';
const PROP_USER_AGENT = 'agent';
const PROP_USER_HOST = 'user_host';
const PROP_API_NAME = 'api_name';
const PROP_API_TYPE = 'api_type';
const PROP_API_SPEC = 'api_spec';
const PROP_SVC_NAME = 'svc';
const PROP_API_ECODE = 'api_ecode';
const PROP_SVC_ECODE = 'svc_ecode';
const PROP_API_TIME = 'api_time';
const PROP_SVC_TIME = 'svc_time';

const PROP_SENDER_ID = 'sender_id';
const PROP_SENDER_IDS = 'sender_ids';
const PROP_RECEIVER_ID = 'receiver_id';
const PROP_SENT_TS = 'sent_ts';
const PROP_SENT_MEDIUM = 'sent_method';
const PROP_READ_TS = 'read_ts';
const PROP_READ_MEDIUM = 'read_medium';
const PROP_ACTIVITY = 'activity';
const PROP_DONE_TS = 'done_ts';
const PROP_DONE_METHOD = 'done_method';

/**
 * Fields within XMActivityLog that are useful and
 * can be specified in message template and MERGED
 * as information rendered for users (e.g., notification)
 */
export const PROPS_ACTIVITY = [
  PROP_ACTION, PROP_INITIATOR_ID, PROP_INITIATOR_LEVEL, PROP_RECEIVER_ID,
  PROP_ACTION_START_TS, PROP_ACTION_STOP_TS,
  PROP_SRC_ID, PROP_SRC_TYPE, PROP_SRC_OWNER_ID,
  PROP_TGT_ID, PROP_TGT_TYPE, PROP_TGT_OWNER_ID,
  PROP_RPS_IDS, PROP_RPS_TYPE, PROP_RPS_OWNER_IDS,
  PROP_READ_TS, PROP_READ_MEDIUM,
  PROP_DONE_TS, PROP_DONE_METHOD,
];

export const MEDIUM_EMAIL = 'email';
export const MEDIUM_SMS = 'sms';
export const MEDIUM_APP = 'app';

export const MSGTYPE_NOTIFICATION = 'n';
export const MSGTYPE_HISTORICAL = 'h';

export const SORTTYPE_NEWEST = 'new';
export const SORTTYPE_RELEVT = 'rel';
export const SORTTYPE_HOTEST = 'hot';
export const SORTTYPE_OLDEST = 'old';
export const SORTTYPE_LIKED = 'mlk';
export const SORTTYPE_FOLLOWED = 'mfw';
export const SORT_TYPES = [
  SORTTYPE_NEWEST, SORTTYPE_HOTEST, SORTTYPE_OLDEST, SORTTYPE_LIKED, SORTTYPE_FOLLOWED,
];

export const VIEW_LOCATION_MENU = 'menu';
export const VIEW_LOCATION_TIMELINE = 'timeline';
export const VIEW_LOCATION_404 = '404';
export const VIEW_LOCATIONS = [VIEW_LOCATION_MENU, VIEW_LOCATION_TIMELINE, VIEW_LOCATION_404];

/**
 * Properties from Activity log that is common for all types of
 * messages, emails, alerts, etc.
 */
const PROPS_COMMON = [
  PROP_ACTIVITY_ID,
  PROP_INITIATOR_ID,
  PROP_INITIATOR_LEVEL,
  PROP_SRC_ID,
  PROP_SRC_OWNER_ID,
  PROP_SRC_TYPE,
  PROP_ACTION,
  PROP_TGT_ID,
  PROP_TGT_OWNER_ID,
  PROP_TGT_TYPE,
  PROP_TGT_USER_LEVEL,
  PROP_RPS_TYPE,
  PROP_RPS_IDS,
  PROP_RPS_OWNER_IDS,
  PROP_UPDATED_DATE,
  PROP_DEPTH_LEVEL,
  PROP_USER_HOST,
  PROP_POST_ID,
  PROP_ORIG_POST_ID,
];

/**
 * Properties from Activity log that is common for all types of
 * messages, emails, alerts, etc.
 */
const PROPS_CACHED = [
  PROP_ACTIVITY_ID,
  PROP_INITIATOR_ID,
  PROP_INITIATOR_LEVEL,
  PROP_SRC_ID,
  PROP_SRC_OWNER_ID,
  PROP_SRC_TYPE,
  PROP_ACTION,
  PROP_TGT_ID,
  PROP_TGT_OWNER_ID,
  PROP_TGT_TYPE,
  PROP_TGT_USER_LEVEL,
  PROP_RPS_TYPE,
  PROP_RPS_IDS,
  PROP_RPS_OWNER_IDS,
  PROP_CREATED_DATE,
  PROP_UPDATED_DATE,
  PROP_POST_ID,
  PROP_POST_TYPE,
  PROP_OWNER_ID,
  PROP_ORIG_POST_ID,
  PROP_ORIG_POST_OWNER_ID,
  PROP_HAS_MEDIA,
];


export class MessageProps extends UserProps {
  static get VARDATA() { return 'vardata'; }
  static get VARMAP() { return 'var'; }
  static get COMPILED() { return 'compiled'; }

  /**
     * Message type: notification or historical
     */
  static get MSGTPL() { return PROP_MSGTYPE; }

  /**
     * Message type: notification or historical
     */
  static get MSGTYPE() { return PROP_MSGTYPE; }

  /**
     * Sort type for messages (see SORTTYPE_*)
     */
  static get SORTBY() { return PROP_SORTBY; }

  /**
     * Either web browser agent, mobile ID, or server ID?
     */
  static get USER_AGENT() { return PROP_USER_AGENT; }

  /**
     * Host that initated user action
     */
  static get USER_HOST() { return PROP_USER_HOST; }

  /**
     * user/system ID for the initiator of the message
     */
  static get INITIATOR_ID() { return PROP_INITIATOR_ID; }

  /**
   * user/system influence level for the initiator of the message
   */
  static get INITIATOR_LVL() { return PROP_INITIATOR_LEVEL; }

  static get ACTION() { return PROP_ACTION; }

  static get TOPICS() { return PROP_TOPICS; }

  /**
     * Status of the action taken (TBD)
     */
  static get ACTION_STATUS() { return PROP_ACTION_STATUS; }

  /**
     * Timestamp of when the action was started.
     */
  static get ACTION_START_TS() { return PROP_ACTION_START_TS; }

  /**
     * Timestamp of when the action was completed.
     */
  static get ACTION_STOP_TS() { return PROP_ACTION_STOP_TS; }

  /**
     * Source of the action (actioner). It can be a user, a group, or a system agent.
     */
  static get LOGSRC() { return PROP_LOGSRC; }

  /**
     * ID of the activity log
     */
  static get ACTIVITY_ID() { return PROP_ACTIVITY_ID; }

  /**
     * ID of the parent activity log, if the object records sub-activity.
     */
  static get PARENT_LOG_ID() { return PROP_PARENT_LOG_ID; }

  /**
     * Frequently a user activity have two ends, and there
     * may be an activity generated from the other side, which
     * equates to an "inverse".
     */
  static get INVERSE_LOG_ID() { return 'inv_id'; }

  /**
     * Direct reference to a post to remove guessing game
     * on whether source or target object.
     */
  static get POST_ID() { return PROP_POST_ID; }

  static get POST_TYPE() { return PROP_POST_TYPE; }

  /**
   * Direct reference to a post to remove guessing game
   * on whether source or target object.
   */
  static get COMMENT_POST_ID() { return PROP_COMMENT_POST_ID; }

  static get USER_INFO() { return PROP_USER_INFO; }

  /**
   * Direct reference to an imported post to remove guessing game
   * on whether source or target object.
   */
  static get IMPORT_POST_ID() { return PROP_IMPORT_POST_ID; }

  /**
   * Direct reference to a post to remove guessing game
   * on whether source or target object.
   */
  static get PARENT_COMMENT_ID() { return PROP_PARENT_COMMENT_ID; }

  /**
   * Direct reference to a post to remove guessing game
   * on whether source or target object.
   */
  static get PARENT_OWNER_ID() { return PROP_PARENT_OWNER_ID; }

  /**
     * Tracking of the original post's ID if the post in
     * question is a "repost"
     */
  static get ORIG_POST_ID() { return PROP_ORIG_POST_ID; }

  /**
   * Tracking of the original post's ID if the post in
   * question is a "repost"
   */
  static get ORIG_POST_OWNER_ID() { return PROP_ORIG_POST_OWNER_ID; }

  /**
     * Source side of action's object type. This goes
     * along with the object id.
     * @see ~FIELD_SRC_ID
     */
  static get SRC_TYPE() { return PROP_SRC_TYPE; }

  static get HAS_MEDIA() { return PROP_HAS_MEDIA; }

  static get HAS_NOTIFIED() { return PROP_HAS_NOTIFIED; }

  /**
     * Title of the source object. This is derived and require retrieval
     * of the actual object
     */
  static get SRC_TITLE() { return 'src_title'; }

  /**
     * Source object's owner ID. This is needed if the source
     * object is not a user, and require to lookup object's owner.
     */
  static get SRC_OWNER_ID() { return PROP_SRC_OWNER_ID; }

  /**
     * Source object's owner name. This is needed if the
     * source object is not a user, and require to lookup
     * object's owner and print the name.
     */
  static get SRC_OWNER_NAME() { return 'src_owner_name'; }

  /**
     * Source side of action's object id. This along
     * with the type allow us to retrieve the actual
     * data.
     * @see ~FIELD_SRC_TYPE
     */
  static get SRC_ID() { return PROP_SRC_ID; }

  static get SRC_OBJECT() { return PROP_SRC_OBJECT; }

  /**
     * Target side of action's object type. This goes
     * along with the object id.
     * @see ~FIELD_TGT_ID
     *
     */
  static get TGT_TYPE() { return PROP_TGT_TYPE; }

  static get TGT_TITLE() { return 'tgt_title'; }

  static get TGT_OWNER_NAME() { return 'tgt_owner_name'; }

  static get TGT_OWNER_ID() { return PROP_TGT_OWNER_ID; }

  static get TGT_OBJECT() { return PROP_TGT_OBJECT; }

  static get TGT_USER_LEVEL() { return PROP_TGT_USER_LEVEL; }

  static get VIEW_DUR() { return 'view_dur'; }

  static get PLAY_DUR() { return 'play_dur'; }

  static get ACT_TYPE() { return 'act_type'; }

  static get VIEW_LOCATION() { return 'view_location'; }

  /**
   * Repost side of action's object type. This goes
   * along with the object id.
   * @see ~FIELD_TGT_ID
   *
   */
  static get RPS_TYPE() { return PROP_RPS_TYPE; }

  static get RPS_OWNER_IDS() { return PROP_RPS_OWNER_IDS; }

  static get RPS_IDS() { return PROP_RPS_IDS; }

  /**
     * Target side of action's object id. This along
     * with the type allow us to retrieve the actual
     * data.
     * @see ~FIELD_TGT_TYPE
     */
  static get TGT_ID() { return PROP_TGT_ID; }

  static get SENDER_ID() { return PROP_SENDER_ID; }
  static get SENDER_IDS() { return PROP_SENDER_IDS; }
  static get RECEIVER_ID() { return PROP_RECEIVER_ID; }
  static get SENT_TS() { return PROP_SENT_TS; }
  static get SENT_MEDIUM() { return PROP_SENT_MEDIUM; }
  static get READ_TS() { return PROP_READ_TS; }
  static get READ_MEDIUM() { return PROP_READ_MEDIUM; }
  static get DONE_TS() { return PROP_DONE_TS; }
  static get DONE_METHOD() { return PROP_DONE_METHOD; }

  static get API_NAME() { return PROP_API_NAME; }
  static get API_TYPE() { return PROP_API_TYPE; }
  static get API_SPEC() { return PROP_API_SPEC; }
  static get SVC_NAME() { return PROP_SVC_NAME; }
  static get API_ECODE() { return PROP_API_ECODE; }
  static get SVC_ECODE() { return PROP_SVC_ECODE; }
  static get API_TIME() { return PROP_API_TIME; }
  static get SVC_TIME() { return PROP_SVC_TIME; }

  static get ACTIVITY() { return PROP_ACTIVITY; }

  static get MEDIUM_EMAIL() { return MEDIUM_EMAIL; }
  static get MEDIUM_SMS() { return MEDIUM_SMS; }
  static get MEDIUM_APP() { return MEDIUM_APP; }

  static get MSGTYPE_NOTIFICATION() { return MSGTYPE_NOTIFICATION; }
  static get MSGTYPE_HISTORICAL() { return MSGTYPE_HISTORICAL; }

  /**
     * @return {string[]} all relevant PROP_* labels for XMActivity
     */
  static get PROPS_ACTIVITY() { return PROPS_ACTIVITY; }

  static get PROPS_COMMON() { return PROPS_COMMON; }
  static get PROPS_CACHED() { return PROPS_CACHED; }

  static get PROPS_DEPTH_LEVEL() { return PROP_DEPTH_LEVEL; }

  /**
     * @return {string[]} all sort types
     */
  static get SORT_TYPES() { return SORT_TYPES; }
  static get SORT_NEWEST() { return SORTTYPE_NEWEST; }
  static get SORT_RELEVT() { return SORTTYPE_RELEVT; }
  static get SORT_HOTEST() { return SORTTYPE_HOTEST; }
  static get SORT_OLDEST() { return SORTTYPE_OLDEST; }
  static get SORT_LIKED() { return SORTTYPE_LIKED; }
  static get SORT_FOLLOWED() { return SORTTYPE_FOLLOWED; }
} // class MessageProp


// --------------- ACTIVITY LOG TYPE / ACTION NAMES -----------------------

export const VIEW_OVERVIEW = 'overview';     // includes title, stats
export const VIEW_DETAILS = 'detail';      //
export const VIEW_HEADLINE = 'headline';     // headline (or mentions)
export const VIEW_ALL = 'all';          // view everything (listing items)
export const VIEW_INITIAL = 'initial';      // initial page (e.g., feed)
export const VIEW_NEXT = 'next';         // fetch next page
export const VIEW_PREVIOUS = 'prev';     // fetch previous page
export const VIEW_LAST = 'end';         // last / end page

export const INFOACCESS_OVERVIEW = 'overview';
export const INFOACCESS_DETAILS = 'detail';
export const INFOACCESS_HEADLINE = 'headline';
export const INFOACCESS_ALL = 'all';
export const INFOACCESS_INITIAL = 'initial';   // initial page (e.g., feed)
export const INFOACCESS_NEXT = 'next';         // fetch next
export const INFOACCESS_PREVIOUS = 'prev';     // fetch previous
export const INFOACCESS_LAST = 'end';          // last / end page

const ACTIVITY_LOGIN = 'login';
const ACTIVITY_OTPLOGIN = 'otplogin';
const ACTIVITY_LOGOUT = 'logout';
const ACTIVITY_SIGNUP = 'signup';
const ACTIVITY_EXPRESS_SIGNUP = 'express_signup';
const ACTIVITY_UPLOAD_FCM = 'upload_fcm';

const ACTIVITY_FOLLOWS_USER = 'follows';
const ACTIVITY_FOLLOWEDBY_USER = 'followed_by';
const ACTIVITY_UNFOLLOWS_USER = 'unfollows';
const ACTIVITY_UNFOLLOWEDBY_USER = 'unfollowed_by';
const ACTIVITY_BLOCKS_USER = 'blocks';
const ACTIVITY_UNBLOCKS_USER = 'unblocks';
const ACTIVITY_MUTES_USER = 'mutes';
const ACTIVITY_UNMUTES_USER = 'unmutes';
const ACTIVITY_REPORTS_USER = 'reports_user';
const ACTIVITY_REPORTEDBY_USER = 'reported_by';
const ACTIVITY_REPORTS_POST = 'reports_post';
const ACTIVITY_UPDATES_PROFILE = 'updates_profile';
const ACTIVITY_SEARCHES_POST = 'searches_post';
const ACTIVITY_SEARCHES_USER = 'searches_user';
const ACTIVITY_BIND_EMAIL = 'bind_email';
const ACTIVITY_CHANGE_EMAIL = 'change_email';
const ACTIVITY_CHANGE_USERNAME = 'change_username';
const ACTIVITY_BIND_SMS = 'bind_sms';
const ACTIVITY_CHANGE_SMS = 'change_sms';

const ACTIVITY_CHANGE_POST_TEXT = 'change_post_text';
const ACTIVITY_CHANGE_VISION_TEXT_COVER = 'change_vision_text_cover';

const ACTIVITY_LIKES_POST = 'likes_pst';
const ACTIVITY_POST_LIKEDBY = 'pst_liked_by';
const ACTIVITY_UNLIKES_POST = 'unlikes_pst';
const ACTIVITY_POST_UNLIKEDBY = 'pst_unliked_by';

const ACTIVITY_PIN_POST = 'pin_pst';
const ACTIVITY_UNPIN_POST = 'unpin_pst';
const ACTIVITY_POST_PINNEDBY = 'pst_pinned_by';
const ACTIVITY_POST_UNPINNEDBY = 'pst_unpinned_by';

const ACTIVITY_WATCHES_POST = 'watches_pst';
const ACTIVITY_WATCHED_POST = 'watched_pst_by';
const ACTIVITY_UNWATCHES_POST = 'unwatches_pst';
const ACTIVITY_UNWATCHED_POST = 'unwatched_pst';

const ACTIVITY_SHARES_POST = 'shares_pst';
const ACTIVITY_POST_SHAREDBY = 'pst_sharedby';
const ACTIVITY_UNSHARES_POST = 'unshares_pst';
const ACTIVITY_POST_UNSHAREDBY = 'pst_unsharedby';

const ACTIVITY_LIKES_COMMENT = 'likes_cm';
const ACTIVITY_COMMENT_LIKEDBY = 'cm_liked_by';
const ACTIVITY_UNLIKES_COMMENT = 'unlikes_cm';
const ACTIVITY_COMMENT_UNLIKEDBY = 'cm_unliked_by';

const ACTIVITY_WATCHES_COMMENT = 'watches_cm';
const ACTIVITY_WATCHED_COMMENT = 'watched_cm_by';
const ACTIVITY_UNWATCHES_COMMENT = 'unwatches_cm';
const ACTIVITY_UNWATCHED_COMMENT = 'unwatched_cm';

const ACTIVITY_SHARES_COMMENT = 'shares_cm';
const ACTIVITY_COMMENT_SHAREDBY = 'cm_sharedby';
const ACTIVITY_UNSHARES_COMMENT = 'unshares_cm';
const ACTIVITY_COMMENT_UNSHAREDBY = 'cm_unsharedby';

const ACTIVITY_API_GETRES = 'getres';

const ACTIVITY_USER_VIEW = 'usr_view';
const ACTIVITY_USER_VIEW_USER = 'view_user';
const ACTIVITY_USER_VIEW_USER_FOLLOWINGS = 'view_user_follows';
const ACTIVITY_USER_VIEW_USER_FOLLOWERS = 'view_user_followers';
const ACTIVITY_USER_VIEW_HELP = 'view_help';
const ACTIVITY_USER_FEEDBACK = 'feedback';

const ACTIVITY_USER_MENTIONED_IN = 'usr_mentioned';

const ACTIVITY_USER_VIEW_POST = 'view_pst';
const ACTIVITY_USER_PUB_POST = 'pub_pst';
const ACTIVITY_POST_PUBLISHED = 'pub_pst_by';
const ACTIVITY_TAG_POST = 'tag_pst';

const ACTIVITY_USER_VIEW_COMMENT = 'view_cm';
const ACTIVITY_USER_PUB_COMMENT = 'pub_cm';
const ACTIVITY_COMMENT_PUBLISHED = 'pub_cm_by';
const ACTIVITY_TAG_COMMENT = 'tag_cm';

const ACTIVITY_USER_VIEW_TIMELINE = 'view_tl';
const ACTIVITY_USER_VIEW_TIMELINE_TRENDS = 'view_tl_trends';
const ACTIVITY_USER_VIEW_TIMELINE_LIVENOW = 'view_tl_livenow';
const ACTIVITY_USER_VIEW_USER_FEED = 'view_usr_feed';
const ACTIVITY_USER_VIEW_POST_FEED = 'view_pst_feed';
const ACTIVITY_USER_VIEW_POST_COMMENTS = 'view_pcm_feed';
const ACTIVITY_USER_VIEW_COMMENT_COMMENTS = 'view_ccm_feed';
const ACTIVITY_USER_VIEW_VISIONS = 'view_vi';

const ACTIVITY_USER_VIEW_TOS = 'view_tos';
const ACTIVITY_USER_VIEW_PRIVACY = 'view_privacy';
const ACTIVITY_USER_VIEW_DMCA = 'view_dmca';
const ACTIVITY_USER_VIEW_USER_GUIDELINES = 'view_user_guidelines';
const ACTIVITY_USER_VIEW_LEGAL_GUIDELINES = 'view_legal_guidelines';
const ACTIVITY_USER_VIEW_ABOUTUS = 'view_aboutus';
const ACTIVITY_USER_VIEW_FEEDBACK = 'view_feedback';
const ACTIVITY_USER_VIEW_HOMEPAGE = 'view_homepage';
const ACTIVITY_USER_VIEW_MYACCOUNT = 'view_myaccount';
const ACTIVITY_USER_DEACTIVATE_USER = 'deactivate_user';
const ACTIVITY_USER_REACTIVATE_USER = 'reactivate_user';
const ACTIVITY_USER_DELETE_USER = 'delete_user';
const ACTIVITY_USER_CHANGE_PASSWORD = 'user_change_password';
const ACTIVITY_USER_RESET_PASSWORD = 'user_reset_password';
const ACTIVITY_USER_CREATE_PASSWORD = 'user_create_password';
const ACTIVITY_USER_SEND_VCODE_EMAIL = 'user_send_vcode_email';
const ACTIVITY_USER_SEND_CLAIM_EMAIL = 'user_send_claim_email';
const ACTIVITY_USER_SEND_VCODE_SMS = 'user_send_vcode_sms';

const ACTIVITY_USER_GET_CONF_PROPS = 'get_sysconf_props';
const ACTIVITY_SYS_SET_CONF_PROPS = 'set_sysconf_props';
const ACTIVITY_SUSPEND_USER = 'suspend_user';
const ACTIVITY_RECOVERY_SUSPENDED_USER = 'recovery_suspended_user';
const ACTIVITY_SYNC_USERS_TO_MAILCHIMP = 'sync_users_to_mailchimp';
const ACTIVITY_DELETE_SUSPENDED_USER = 'delete_suspended_user';
const ACTIVITY_SOFT_DELETE_USER = 'soft_delete_user';
const ACTIVITY_HARD_DELETE_DEPRECATED_USER = 'hard_delete_deprecated_user';
const ACTIVITY_RESET_USER_TOKEN = 'reset_user_token';
const ACTIVITY_QUERY_USERS = 'query_users';
const ACTIVITY_QUERY_RESERVED_USERS = 'query_reserved_users';
const ACTIVITY_QUERY_DELETED_POSTS = 'query_deleted_posts';

const ACTIVITY_ADD_ROLE = 'add_role';
const ACTIVITY_REMOVE_ROLE = 'remove_role';

const ACTIVITY_ADD_FEATURE = 'add_feature';
const ACTIVITY_REMOVE_FEATURE = 'remove_feature';

const ACTIVITY_ADD_SET_PARAMETERS = 'add_set_parameters';
const ACTIVITY_REMOVE_SET_PARAMETERS = 'remove_set_parameters';

const ACTIVITY_UPDATE_GLOBAL_PARAMETERS = 'update_global_parameters';

const ACTIVITY_UPDATE_TRENDING_HASHTAGS = 'update_trending_hashtags';
const ACTIVITY_REORDER_TRENDING_HASHTAGS = 'reorder_trending_hashtags';
const ACTIVITY_DELETE_TRENDING_HASHTAGS = 'delete_trending_hashtags';

const ACTIVITY_ADMIN_UPDATE_USER_PROFILE = 'admin_update_user_profile';
const ACTIVITY_ADMIN_UPDATE_USER_TWITTER_STATS = 'admin_update_user_twitter_stats';
const ACTIVITY_ADMIN_UPDATE_USER_LIVE_CONFIGS = 'admin_update_user_live_configs';
const ACTIVITY_ADMIN_CHANGE_USER_PASSWORD = 'admin_change_user_password';
const ACTIVITY_ADMIN_CHANGE_USER_EMAIL = 'admin_change_user_email';
const ACTIVITY_ADMIN_BAN_UGC = 'admin_ban_ugc';
const ACTIVITY_ADMIN_FIX_USER_FOLLOWS = 'admin_fix_user_follows';

const ACTIVITY_USER_DELETES_NOTIFICATION = 'user_delete_notif';
const ACTIVITY_USER_SUBSCRIBE_USER = 'user_subscribe_user';
const ACTIVITY_USER_UPDATES_NOTIF_SETTINGS = 'user_updates_notif_settings';

/**
 * Grouping of all log type constants in a class for single export
 */
export class ActivityLogProps extends MessageProps {
  static get API_TYPE_SYS() { return API_TYPE_SYS; }
  static get API_TYPE_USER() { return API_TYPE_USER; }
  static get API_TYPE_API() { return API_TYPE_API; }
  static get API_TYPE_WEBHOOK() { return API_TYPE_WEBHOOK; }
  static get API_TYPE_SVC() { return API_TYPE_SVC; }

  static get VIEW_OVERVIEW() { return VIEW_OVERVIEW; }
  static get VIEW_DETAILS() { return VIEW_DETAILS; }
  static get VIEW_HEADLINE() { return VIEW_HEADLINE; }
  static get VIEW_ALL() { return VIEW_ALL; }
  static get VIEW_INITIAL() { return VIEW_INITIAL; }
  static get VIEW_NEXT() { return VIEW_NEXT; }
  static get VIEW_PREVIOUS() { return VIEW_PREVIOUS; }
  static get VIEW_LAST() { return VIEW_LAST; }

  static get INFOACCESS_OVERVIEW() { return INFOACCESS_OVERVIEW; }
  static get INFOACCESS_DETAILS() { return INFOACCESS_DETAILS; }
  static get INFOACCESS_HEADLINE() { return INFOACCESS_HEADLINE; }
  static get INFOACCESS_ALL() { return INFOACCESS_ALL; }
  static get INFOACCESS_INITIAL() { return INFOACCESS_INITIAL; }
  static get INFOACCESS_NEXT() { return INFOACCESS_NEXT; }
  static get INFOACCESS_PREVIOUS() { return INFOACCESS_PREVIOUS; }
  static get INFOACCESS_LAST() { return INFOACCESS_LAST; }

  static get LOGIN() { return ACTIVITY_LOGIN; }
  static get OTPLOGIN() { return ACTIVITY_OTPLOGIN; }
  static get LOGOUT() { return ACTIVITY_LOGOUT; }
  static get SIGNUP() { return ACTIVITY_SIGNUP; }
  static get EXPRESS_SIGNUP() { return ACTIVITY_EXPRESS_SIGNUP; }
  static get UPLOAD_FCM() { return ACTIVITY_UPLOAD_FCM; }

  static get FOLLOWS_USER() { return ACTIVITY_FOLLOWS_USER; }
  static get FOLLOWEDBY_USER() { return ACTIVITY_FOLLOWEDBY_USER; }
  static get UNFOLLOWS_USER() { return ACTIVITY_UNFOLLOWS_USER; }
  static get UNFOLLOWEDBY_USER() { return ACTIVITY_UNFOLLOWEDBY_USER; }
  static get BLOCKS_USER() { return ACTIVITY_BLOCKS_USER; }
  static get UNBLOCKS_USER() { return ACTIVITY_UNBLOCKS_USER; }
  static get MUTES_USER() { return ACTIVITY_MUTES_USER; }
  static get UNMUTES_USER() { return ACTIVITY_UNMUTES_USER; }
  static get REPORTS_USER() { return ACTIVITY_REPORTS_USER; }
  static get REPORTS_POST() { return ACTIVITY_REPORTS_POST; }
  static get REPORTEDBY_USER() { return ACTIVITY_REPORTEDBY_USER; }
  static get UPDATES_PROFILE() { return ACTIVITY_UPDATES_PROFILE; }
  static get SEARCHES_POST() { return ACTIVITY_SEARCHES_POST; }
  static get SEARCHES_USER() { return ACTIVITY_SEARCHES_USER; }
  static get BIND_EMAIL() { return ACTIVITY_BIND_EMAIL; }
  static get CHANGE_EMAIL() { return ACTIVITY_CHANGE_EMAIL; }
  static get CHANGE_USERNAME() { return ACTIVITY_CHANGE_USERNAME; }
  static get BIND_SMS() { return ACTIVITY_BIND_SMS; }
  static get CHANGE_SMS() { return ACTIVITY_CHANGE_SMS; }

  static get CHANGE_POST_TEXT() { return ACTIVITY_CHANGE_POST_TEXT; }
  static get CHANGE_VISION_TEXT_COVER() { return ACTIVITY_CHANGE_VISION_TEXT_COVER; }

  static get LIKES_POST() { return ACTIVITY_LIKES_POST; }
  static get POST_LIKEDBY() { return ACTIVITY_POST_LIKEDBY; }
  static get UNLIKES_POST() { return ACTIVITY_UNLIKES_POST; }
  static get POST_UNLIKEDBY() { return ACTIVITY_POST_UNLIKEDBY; }

  static get PIN_POST() { return ACTIVITY_PIN_POST; }
  static get UNPIN_POST() { return ACTIVITY_UNPIN_POST; }
  static get POST_PINNEDBY() { return ACTIVITY_POST_PINNEDBY; }
  static get POST_UNPINNEDBY() { return ACTIVITY_POST_UNPINNEDBY; }

  static get WATCHES_POST() { return ACTIVITY_WATCHES_POST; }
  static get WATCHED_POST() { return ACTIVITY_WATCHED_POST; }
  static get UNWATCHES_POST() { return ACTIVITY_UNWATCHES_POST; }
  static get UNWATCHED_POST() { return ACTIVITY_UNWATCHED_POST; }

  static get SHARES_POST() { return ACTIVITY_SHARES_POST; }
  static get POST_SHAREDBY() { return ACTIVITY_POST_SHAREDBY; }
  static get UNSHARES_POST() { return ACTIVITY_UNSHARES_POST; }
  static get POST_UNSHAREDBY() { return ACTIVITY_POST_UNSHAREDBY; }

  static get LIKES_COMMENT() { return ACTIVITY_LIKES_COMMENT; }
  static get COMMENT_LIKEDBY() { return ACTIVITY_COMMENT_LIKEDBY; }
  static get UNLIKES_COMMENT() { return ACTIVITY_UNLIKES_COMMENT; }
  static get COMMENT_UNLIKEDBY() { return ACTIVITY_COMMENT_UNLIKEDBY; }

  static get WATCHES_COMMENT() { return ACTIVITY_WATCHES_COMMENT; }
  static get WATCHED_COMMENT() { return ACTIVITY_WATCHED_COMMENT; }
  static get UNWATCHES_COMMENT() { return ACTIVITY_UNWATCHES_COMMENT; }
  static get UNWATCHED_COMMENT() { return ACTIVITY_UNWATCHED_COMMENT; }

  static get SHARES_COMMENT() { return ACTIVITY_SHARES_COMMENT; }
  static get COMMENT_SHAREDBY() { return ACTIVITY_COMMENT_SHAREDBY; }
  static get UNSHARES_COMMENT() { return ACTIVITY_UNSHARES_COMMENT; }
  static get COMMENT_UNSHAREDBY() { return ACTIVITY_COMMENT_UNSHAREDBY; }

  static get API_GETRES() { return ACTIVITY_API_GETRES; }
  static get USER_VIEW() { return ACTIVITY_USER_VIEW; }
  static get USER_VIEW_USER() { return ACTIVITY_USER_VIEW_USER; }
  static get USER_VIEW_USER_FOLLOWINGS() { return ACTIVITY_USER_VIEW_USER_FOLLOWINGS; }
  static get USER_VIEW_USER_FOLLOWERS() { return ACTIVITY_USER_VIEW_USER_FOLLOWERS; }
  static get USER_VIEW_HELP() { return ACTIVITY_USER_VIEW_HELP; }

  static get USER_VIEW_COMMENT() { return ACTIVITY_USER_VIEW_COMMENT; }
  static get USER_PUB_COMMENT() { return ACTIVITY_USER_PUB_COMMENT; }
  static get USER_UPDATES_COMMENT() { return 'upd_cm'; }
  static get USER_DELETES_COMMENT() { return 'del_cmv'; }

  static get COMMENT_PUBLISHEDBY() { return ACTIVITY_COMMENT_PUBLISHED; }
  static get COMMENT_UPDATEDBY() { return 'upd_cmby'; }
  static get COMMENT_DELETEDBY() { return 'del_cmby'; }

  static get USER_PUB_POST() { return ACTIVITY_USER_PUB_POST; }
  static get USER_UPDATES_POST() { return 'upd_pst'; }
  static get USER_DELETES_POST() { return 'del_pstv'; }
  static get ADMIN_DELETES_POST() { return 'admin_del_pstv'; }
  static get ADMIN_ROLLBACK_DELETE_POST() { return 'admin_rollback_del_pstv'; }
  static get USER_TRANSLATES_POST() { return 'transl_pstv'; }
  static get USER_START_LIVESTREAM() { return 'go_live'; }
  static get LIVESTREAM_STARTEDBY() { return 'live_started_by'; }
  static get USER_SCHEDULE_LIVESTREAM() { return 'schedule_live'; }
  static get LIVESTREAM_SCHEDULEDBY() { return 'live_scheduled_by'; }
  static get USER_CANCEL_LIVESTREAM_SCHEDULE() { return 'cancel_schedule'; }
  static get LIVESTREAM_SCHEDULE_CANCELEDBY() { return 'scheduled_canceledby'; }
  static get USER_END_LIVESTREAM() { return 'end_live'; }
  static get ADMIN_END_LIVESTREAM() { return 'admin_end_live'; }
  static get LIVESTREAM_ENDEDBY() { return 'live_ended_by'; }
  static get USER_DELETES_STREAMVIDEO() { return 'del_stream_vid'; }
  static get STREAMVIDEO_DELETEDBY() { return 'stream_vid_deletedby'; }
  static get USER_JOIN_LIVESTREAM() { return 'join_live'; }
  static get LIVESVC_CUT_WEBHOOK() { return 'live_svc_cutlive'; }
  static get LIVESVC_AUTOSTART_WEBHOOK() { return 'live_svc_autostart'; }
  static get LIVESVC_UPDATEPOST_WEBHOOK() { return 'live_svc_updatepost'; }
  static get USER_BANS_LIVEUSER() { return 'ban_liveuser'; }
  static get LIVEUSER_BANNEDBY() { return 'liveuser_bannedby'; }
  static get ADMIN_BANS_LIVEUSER() { return 'admin_ban_liveuser'; }
  static get USER_EXECS_LIVECHAT() { return 'exec_chat'; }
  static get ADMIN_EXECS_LIVECHAT() { return 'admin_exec_chat'; }
  static get USER_SENDS_MSG() { return 'send_msg'; }
  static get USER_DELETES_MSG() { return 'del_msg'; }
  static get ADMIN_DELETES_MSG() { return 'admin_del_msg'; }
  static get USER_EXECS_LIVECHANNEL() { return 'exec_channel'; }
  static get USER_UPDATE_LIVECONFIGS() { return 'update_live_configs'; }
  static get USER_UPDATE_LIVESTREAM() { return 'update_live_stream'; }
  static get USER_SENDS_LIVE_CHAT_MSG() { return 'send_live_chat_msg'; }
  static get DELETE_LIVE_CHATS() { return 'del_live_chats'; }

  static get POST_PUBLISHEDBY() { return ACTIVITY_POST_PUBLISHED; }
  static get POST_UPDATEDBY() { return 'upd_pstby'; }
  static get POST_DELETEDBY() { return 'del_pstby'; }
  static get TAG_POST() { return ACTIVITY_TAG_POST; }
  static get TAG_COMMENT() { return ACTIVITY_TAG_COMMENT; }

  static get USER_VIEW_TIMELINE() { return ACTIVITY_USER_VIEW_TIMELINE; }
  static get USER_VIEW_VISIONS() { return ACTIVITY_USER_VIEW_VISIONS; }
  static get USER_VIEW_TIMELINE_TRENDS() { return ACTIVITY_USER_VIEW_TIMELINE_TRENDS; }
  static get USER_VIEW_TIMELINE_LIVENOW() { return ACTIVITY_USER_VIEW_TIMELINE_LIVENOW; }
  static get USER_VIEW_USER_FEED() { return ACTIVITY_USER_VIEW_USER_FEED; }
  static get USER_VIEW_POST_FEED() { return ACTIVITY_USER_VIEW_POST_FEED; }
  static get USER_VIEW_POST() { return ACTIVITY_USER_VIEW_POST; }
  static get USER_VIEW_POST_COMMENTS() { return ACTIVITY_USER_VIEW_POST_COMMENTS; }
  static get USER_VIEW_COMMENT_COMMENTS() { return ACTIVITY_USER_VIEW_COMMENT_COMMENTS; }
  static get USER_VIEW_ABOUTUS() { return ACTIVITY_USER_VIEW_ABOUTUS; }
  static get USER_VIEW_TOS() { return ACTIVITY_USER_VIEW_TOS; }
  static get USER_VIEW_PRIVACY() { return ACTIVITY_USER_VIEW_PRIVACY; }
  static get USER_VIEW_DMCA() { return ACTIVITY_USER_VIEW_DMCA; }
  static get USER_VIEW_USER_GUIDELINES() { return ACTIVITY_USER_VIEW_USER_GUIDELINES; }
  static get USER_VIEW_LEGAL_GUIDELINES() { return ACTIVITY_USER_VIEW_LEGAL_GUIDELINES; }
  static get USER_VIEW_FEEDBACK() { return ACTIVITY_USER_VIEW_FEEDBACK; }
  static get USER_VIEW_HOMEPAGE() { return ACTIVITY_USER_VIEW_HOMEPAGE; }
  static get USER_VIEW_MYACCOUNT() { return ACTIVITY_USER_VIEW_MYACCOUNT; }
  static get USER_FEEDBACK() { return ACTIVITY_USER_FEEDBACK; }
  static get USER_CHANGE_PASSWORD() { return ACTIVITY_USER_CHANGE_PASSWORD; }
  static get USER_RESET_PASSWORD() { return ACTIVITY_USER_RESET_PASSWORD; }
  static get USER_CREATE_PASSWORD() { return ACTIVITY_USER_CREATE_PASSWORD; }
  static get USER_SEND_VCODE_EMAIL() { return ACTIVITY_USER_SEND_VCODE_EMAIL; }
  static get USER_SEND_VCODE_SMS() { return ACTIVITY_USER_SEND_VCODE_SMS; }
  static get USER_SEND_CLAIM_EMAIL() { return ACTIVITY_USER_SEND_CLAIM_EMAIL; }

  static get USER_MENTIONED_IN() { return ACTIVITY_USER_MENTIONED_IN; }

  static get USER_DEACTIVATE_USER() { return ACTIVITY_USER_DEACTIVATE_USER; }
  static get USER_REACTIVATE_USER() { return ACTIVITY_USER_REACTIVATE_USER; }
  static get USER_DELETE_USER() { return ACTIVITY_USER_DELETE_USER; }

  static get USER_GET_CONF_PROPS() { return ACTIVITY_USER_GET_CONF_PROPS; }
  static get SYS_SET_CONF_PROPS() { return ACTIVITY_SYS_SET_CONF_PROPS; }
  static get SUSPEND_USER() { return ACTIVITY_SUSPEND_USER; }
  static get RECOVERY_SUSPENDED_USER() { return ACTIVITY_RECOVERY_SUSPENDED_USER; }
  static get DELETE_SUSPENDED_USER() { return ACTIVITY_DELETE_SUSPENDED_USER; }
  static get SOFT_DELETE_USER() { return ACTIVITY_SOFT_DELETE_USER; }
  static get HARD_DELETE_DEPRECATED_USER() { return ACTIVITY_HARD_DELETE_DEPRECATED_USER; }
  static get RESET_USER_TOKEN() { return ACTIVITY_RESET_USER_TOKEN; }
  static get QUERY_USERS() { return ACTIVITY_QUERY_USERS; }
  static get QUERY_DELETED_POSTS() { return ACTIVITY_QUERY_DELETED_POSTS; }
  static get QUERY_RESERVED_USERS() { return ACTIVITY_QUERY_RESERVED_USERS; }
  static get ADD_ROLE() { return ACTIVITY_ADD_ROLE; }
  static get REMOVE_ROLE() { return ACTIVITY_REMOVE_ROLE; }
  static get ADD_FEATURE() { return ACTIVITY_ADD_FEATURE; }
  static get REMOVE_FEATURE() { return ACTIVITY_REMOVE_FEATURE; }

  static get UPDATE_TRENDING_HASHTAGS() { return ACTIVITY_UPDATE_TRENDING_HASHTAGS; }
  static get REORDER_TRENDING_HASHTAGS() { return ACTIVITY_REORDER_TRENDING_HASHTAGS; }
  static get DELETE_TRENDING_HASHTAGS() { return ACTIVITY_DELETE_TRENDING_HASHTAGS; }

  static get ADD_SET_PARAMETERS() { return ACTIVITY_ADD_SET_PARAMETERS; }
  static get REMOVE_SET_PARAMETERS() { return ACTIVITY_REMOVE_SET_PARAMETERS; }

  static get UPDATE_GLOBAL_PARAMETERS() { return ACTIVITY_UPDATE_GLOBAL_PARAMETERS; }

  static get ADMIN_UPDATE_USER_PROFILE() { return ACTIVITY_ADMIN_UPDATE_USER_PROFILE; }
  static get ADMIN_UPDATE_USER_TWITTER_STATS() { return ACTIVITY_ADMIN_UPDATE_USER_TWITTER_STATS; }
  static get ADMIN_UPDATE_USER_LIVE_CONFIGS() { return ACTIVITY_ADMIN_UPDATE_USER_LIVE_CONFIGS; }
  static get ADMIN_CHANGE_USER_PASSWORD() { return ACTIVITY_ADMIN_CHANGE_USER_PASSWORD; }
  static get ADMIN_CHANGE_USER_EMAIL() { return ACTIVITY_ADMIN_CHANGE_USER_EMAIL; }
  static get ADMIN_BAN_UGC() { return ACTIVITY_ADMIN_BAN_UGC; }
  static get ADMIN_FIX_USER_FOLLOWS() { return ACTIVITY_ADMIN_FIX_USER_FOLLOWS; }

  // Notification 2.0
  static get USER_DELETES_NOTIFICATION() { return ACTIVITY_USER_DELETES_NOTIFICATION; }
  static get USER_UPDATES_NOTIF_SETTINGS() { return ACTIVITY_USER_UPDATES_NOTIF_SETTINGS; }
  static get USER_SUBSCRIBE_USER() { return ACTIVITY_USER_SUBSCRIBE_USER; }

  // MailChimp
  static get ADMIN_SYNC_USERS_MAILCHIMP() { return ACTIVITY_SYNC_USERS_TO_MAILCHIMP; }

  // gVision
  static get ADMIN_ADD_SOUND() { return 'admin_add_sound'; }
  static get ADMIN_REMOVE_SOUND() { return 'admin_remove_sound'; }
  static get ADMIN_REFRESH_GLOBAL_SOUND_LIST_CDN() { return 'admin_refresh_global_sound_list_cdn'; }
  static get ADMIN_RELOAD_GLOBAL_SOUND_LIST() { return 'admin_reload_global_sound_list'; }

  static get ADMIN_ADD_STICKER() { return 'admin_add_sticker'; }
  static get ADMIN_REMOVE_STICKER() { return 'admin_remove_sticker'; }
  static get ADMIN_REFRESH_GLOBAL_STICKER_LIST_CDN() { return 'admin_refresh_global_sticker_list_cdn'; }
  static get ADMIN_RELOAD_GLOBAL_STICKER_LIST() { return 'admin_reload_global_sticker_list'; }
}


/**
 * Grouping of gateway request log type in a class for single export
 */
export class AtrLoggerProps {
  static get PATH() { return 'path'; }
  static get ENDPOINT() { return 'endpoint'; }
  static get TRACE_ID() { return 'traceId'; }
  static get PARAMETERS() { return 'parameters'; }
  static get USER_ID() { return 'user_id'; }
  static get UUID() { return 'uuid'; }
  static get REFERER() { return 'referer'; }
  static get REQUEST_METHOD() { return 'request_method'; }
  static get HTTP_VERSION() { return 'http_version'; }
  static get ACCEPT() { return 'accept'; }
  static get ACCEPT_LANGUAGE() { return 'accept_language'; }
  static get LANGUAGE_PREF() { return 'language_pref'; }
  static get ASN() { return 'asn'; }
  static get BGP() { return 'bgp'; }
  static get USER_AGENT() { return 'user_agent'; }
  static get BROWSER() { return 'browser'; }
  static get DEVICE() { return 'device'; }
  static get ENGINE() { return 'engine'; }
  static get OS() { return 'os'; }
  static get IP_ADDRESS() { return 'ip_address'; }
  static get GEO() { return 'geo'; }
  static get TIMEZONE() { return 'timezone'; }
  static get SSL_FINGERPRINT() { return 'ssl_fingerprint'; }
  static get TCP_FINGERPRINT() { return 'tcp_fingerprint'; }
  static get WEB_VERSION() { return 'web_version'; }
  static get APP_VERSION() { return 'app_version'; }
  static get APP_BUILD() { return 'app_build'; }
  static get PT() { return 'pt'; }
  static get BODY() { return 'body'; }
  static get STATUS_CODE() { return 'status_code'; }
  static get ERR_RESPONSE() { return 'err_response'; }
  static get TIMESTAMP() { return 'timestamp'; }
  static get SIGNALS() { return 'signals'; }
  static get META() { return 'meta'; }
  static get DURATION() { return 'duration'; }
}

// --------------------- SOCIAL / CONNECTIONS  --------------------

export const PROP_LIKE = 'like';
export const PROP_SHARE = 'share';
export const PROP_WATCH = 'watch';
export const PROP_ACCEPTED = 'accepted';
export const PROP_ACCEPTED_DATES = 'accepteddates';
export const PROP_PENDING = 'pending';
export const PROP_BLOCKED = 'blocked';
export const PROP_UNBLOCKED = 'unblocked';
export const PROP_MUTED = 'muted';
export const PROP_BLOCKFlAG = 'isBlocked';
export const PROP_MUTEFLAG = 'isMuted';
export const PROP_FLWFLAG = 'isFollowing';

export const STATUS_WATCHED = 'y';
export const STATUS_NOT_WATCHED = 'n';
export const STATUS_UNKNOWN = 'u';

export const STATUS_BLOCKED = 'y';
export const STATUS_MUTED = 'y';

/**
 * Properties for social connections.
 *
 * NOTE: currently properties for XMFollows/XMFollowers
 * are not moved here from their classes.
 */
export class SocialProps extends XObjectProps {

  static get LIKE() { return PROP_LIKE; }
  static get SHARE() { return PROP_SHARE; }
  static get WATCH() { return PROP_WATCH; }
  static get ACCEPTED() { return PROP_ACCEPTED; }
  static get ACCEPTED_DATES() { return PROP_ACCEPTED_DATES; }
  static get PENDING() { return PROP_PENDING; }
  static get BLOCKED() { return PROP_BLOCKED; }
  static get UNBLOCKED() { return PROP_UNBLOCKED; }
  static get MUTED() { return PROP_MUTED; }
  static get BLOCKFLAG() { return PROP_BLOCKFlAG; }
  static get MUTEFLAG() { return PROP_MUTEFLAG; }
  static get FLWFLAG() { return PROP_FLWFLAG; }

  static get STATUS_WATCHED() { return STATUS_WATCHED; }
  static get STATUS_NOT_WATCHED() { return STATUS_NOT_WATCHED; }
  static get STATUS_UNKNOWN() { return STATUS_UNKNOWN; }

} // Class SocialProps

export class SocialAuthProps extends XObjectProps {
  static get PROVIDER_KEY() { return 'pvr_key'; }
  static get VERSION() { return 'ver'; }
}
// --------------------- CHAT  --------------------

/**
 * Properties for the chat user key
 */
export class ChatUserKeyProps {
  static get ID() { return '_id'; }
  static get USER_ID() { return 'user_id'; }
} // Class ChatUserKeyProps

/**
 * Properties for the chat conversation key
 */
export class ChatConversationKeyProps {
  static get ID() { return '_id'; }
  static get MEMBERS() { return 'members'; }
} // Class ChatConversationKeyProps

/**
 * Properties for the chat tokens
 */
export class ChatTokenKeyProps {
  static get USER_ID() { return '_id'; }
  static get TOKENS() { return 'tokens'; }
} // Class ChatTokenKeyProps

// ------------------ Stats --------------------


/**
 * Class that holds properties and utilities related to stats
 */
export class StatsProps extends XObjectProps {
  static get FOLLOWS() { return 'flw'; }
  static get FOLLOWED() { return 'flg'; }
  static get COMMENTS() { return 'cm'; }
  static get COMMENT_SHAREDBY() { return 'shbcm'; }
  static get LIKES_COMMENT() { return 'lkscm'; }
  static get LIKEDBY_COMMENT() { return 'lkbcm'; }
  static get LIKE_POST_EXTRA_STATUS() { return 'lkpstexst'; }
  static get LIKES_POST() { return 'lkspst'; }
  static get LIKEDBY_POST() { return 'lkbpst'; }
  static get TWT_LIKEDBY_POST() { return 'twt_lkbpst'; }
  static get LIKES_GIVEN() { return 'lksgiv'; }
  static get LIKES_RECEIVED() { return 'lksrcv'; }
  static get POSTED_COMMENT() { return 'pscm'; }
  static get POSTED_POST() { return 'pspst'; }
  static get REFERRED_USERS() { return 'rfus'; }
  static get SHARES_COMMENT() { return 'shscm'; }
  static get SHARES_POST() { return 'shspst'; }
  static get POST_SHAREDBY() { return 'shbpst'; }
  static get TWT_POST_SHAREDBY() { return 'twt_shbpst'; }
  static get VIEWS_FULL_COMMENT() { return 'vfcm'; }
  static get VIEWS_HEADLINE_COMMENT() { return 'vhcm'; }
  static get VIEWS_FULL_POST() { return 'vfpst'; }
  static get VIEWS_HEADLINE_POST() { return 'vhpst'; }
  static get VIEWS_FEED_POST() { return 'ifpst'; }
  static get VIEWS_SHARED_POST() { return 'vspst'; }
  static get VIEWS_FULL_USER() { return 'vfusr'; }
  static get VIEWS_HEADLINE_USER() { return 'vhusr'; }
  static get VIEWS_FEED_USER() { return 'ifusr'; }
  static get WATCHES_COMMENT() { return 'wscm'; }
  static get WATCHED_COMMENT() { return 'wbcm'; }
  static get WATCHES_POST() { return 'wspst'; }
  static get WATCHED_POST() { return 'wbpst'; }
  static get USER_INVITES() { return 'inv'; }

  // visions
  static get VISION_ACCESSORY_USED() { return 'vaused'; }
  static get VISION_ACCESSORY_FAVED() { return 'vafaved'; }

  /**
   * Specify stats that can be recalculated based on data in DB.
   */
  static get REFRESHABLE_STATS() {
    return {
      [ModelFolder.USER_STATS]: [
        this.FOLLOWS,
        this.FOLLOWED,
        this.LIKES_POST,
        this.LIKES_COMMENT,
        this.SHARES_POST,
        this.SHARES_COMMENT,
      ],
      [ModelFolder.USER]: [
        this.FOLLOWS,
        this.FOLLOWED,
        // Below stats have no use case for now, commented to improve performance
        // this.LIKES_POST,
        // this.LIKES_COMMENT,
        // this.SHARES_POST,
        // this.SHARES_COMMENT,
      ],
      [ModelFolder.POST_STATS]: [
        this.LIKEDBY_POST,
        this.COMMENTS,
        this.POST_SHAREDBY,
        // this.VIEWS_FULL_POST,
      ],
      [ModelFolder.COMMENT_STATS]: [
        this.LIKEDBY_COMMENT,
        this.COMMENTS,
        this.COMMENT_SHAREDBY,
        // this.VIEWS_FULL_COMMENT,
      ],
    };
  }
}

export class UserStatsProps extends StatsProps {
  // static get SCORE() { return 'scr'; }
}


export class PostStatsProps extends StatsProps {
  static get POSTID() { return 'postId'; }
}

export class CommentStatsProps extends StatsProps {
  static get COMMENTID() { return 'commentId'; }

}

export class SocialSyncProps {
  static get SITENAME() { return UserProps.SOCIAL_SYNC_SITENAME; }
  static get UNI_NAME() { return UserProps.SOCIAL_SYNC_UNINAME; }
  static get NICKNAME() { return UserProps.SOCIAL_SYNC_NICKNAME; }
  static get ALLOWED() { return UserProps.SOCIAL_SYNC_ALLOWED; }
  static get VERIFY_PASS() { return UserProps.SOCIAL_SYNC_VERIFY_PASS; }
  static get SYNC_FLAG() { return UserProps.SOCIAL_SYNC_FLAG; }
  static get CRAWL_FLAG() { return UserProps.SOCIAL_SYNC_CRAWL_FLAG; }
  static get FOLLOWER_IMPORTED() { return UserProps.SOCIAL_SYNC_FOLLOWER_IMPORTED; }
  static get SITENAME_TWITTER() { return SITE_TWITTER; }
}

export class TrendingNewsProps {
  static get NEWS_KEY() { return 'newsKey'; }
  static get HASHTAGS() { return 'hashtags'; }
  static get TITLE() { return 'title'; }
  static get TOPIC() { return 'topic'; }
  static get CATEGORY() { return 'category'; }
  static get DESCRIPTION() { return 'description'; }
  static get ICON() { return 'iconURL'; }
  static get POST_ID() { return 'postId'; }
  static get LIVE_URL() { return 'liveURL'; }

  static get TRENDING_NEWS_PROPS() {
    return [
      TrendingNewsProps.NEWS_KEY,
      TrendingNewsProps.HASHTAGS,
      TrendingNewsProps.TITLE,
      TrendingNewsProps.TOPIC,
      TrendingNewsProps.CATEGORY,
      TrendingNewsProps.DESCRIPTION,
      TrendingNewsProps.ICON,
      TrendingNewsProps.POST_ID,
      TrendingNewsProps.LIVE_URL,
    ];
  }
}

export default ModelType;
