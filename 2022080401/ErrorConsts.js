

export const SYS_NOTIMPL = 'E_SYS_NOTIMPL';
export const SYS_DB_CONN = 'E_SYS_DB_CONN';    // no database connection
export const SYS_DB_REQ = 'E_SYS_DB_REQ';

export const SYS_BAD_ARGS = 'E_BAD_ARGS';
export const SYS_BAD_DATA = 'E_BAD_DATA';
export const SYS_INVALID_DATA = 'E_INVALID_DATA';
export const SYS_INIT = 'E_INIT';
export const SYS_NETERR = 'E_NETERR';
export const SYS_ERR = 'E_SYSERR';

export const API_OK = 'OK';
export const API_NO_OP = 'W_NO_OP';
export const API_LOCKED = 'E_API_LOCKED';
export const API_ERROR = 'E_API_ERROR';
export const API_BAD_PARAMS = 'E_BAD_PARAMS';
export const API_BAD_DATA = 'E_BAD_DATA';
export const API_CAPTCHA_ERROR = 'E_CAPTCHA_ERROR';
export const API_INVALID_ACTION = 'E_BAD_ACTION';   // action already done, can't do it again
export const API_TAG_NOTFOUND = 'E_TAG_NOTFOUND';
export const API_POST_NOTFOUND = 'E_POST_NOTFOUND';
export const API_COMMENT_NOTFOUND = 'E_COMMENT_NOTFOUND';
export const API_CONFIRMED_ALREADY = 'E_CFRM_PRV';
export const API_COMPLETED_ALREADY = 'E_DONE_PRV';
export const API_APP_CAPTCHA_ERROR = 'APP_CAPTCHA_ERROR';
export const API_BAD_PARAMS_EMAIL = 'E_BAD_EMAIL';
export const API_BAD_PARAMS_SMS = 'E_BAD_SMS';
export const API_CONDITION_UNSATISFIED = 'E_CONDITION_UNSATISFIED';
export const API_SEND_SMS_FAIL = 'E_API_SEND_SMS_FAIL';

export const SVC_ERROR = 'E_SVC_ERROR';

export const USER_EXISTS = 'E_USER_EXISTS';
export const USER_EMAIL_EXISTS = 'E_EMAIL_EXISTS';
export const USER_BOUND_EMAIL = 'E_USER_BOUND_EMAIL';
export const EMAIL_NOTFOUND = 'E_EMAIL_NOTFOUND';
export const USER_SMS_EXISTS = 'E_SMS_EXISTS';
export const USER_BOUND_SMS = 'E_USER_BOUND_SMS';
export const USER_INVALID = 'E_USER_INVALID';
export const USER_BLOCKED = 'E_USER_BLOCKED';
export const USER_SUSPENDED = 'E_USER_SUSPENDED';
export const USER_NOTFOUND = 'E_USER_NOTFOUND';
export const USER_DELETED = 'E_USER_DELETED'; // Deleted is different than not found as there is still a record in database
export const USER_DEACTIVATED = 'E_USER_DEACTIVATED';
export const USER_UPGRADE_REQUIRED = 'E_USER_UPGRADE_REQUIRED';
export const USER_BANNED = 'E_USER_BANNED';
export const USER_BANNED_LOGIN = 'E_USER_BANNED_LOGIN';
export const USER_BAD_INPUT = 'E_BAD_INPUT';
export const USER_BAD_TOKEN = 'E_BAD_TOKEN';
export const USER_BAD_V_TOKEN = 'E_BAD_V_TOKEN';
export const USER_BAD_REQUEST = 'E_BAD_REQ';
export const USER_BAD_AUTH = 'E_AUTH';
export const USER_NOT_ALLOWED = 'E_NOT_ALLOWED';
export const USER_NOT_CONFIGURED = 'E_NOT_CONFIGURED';
export const USER_OVER_LIMIT = 'E_METER_LIMIT_EXCEEDED';
export const USER_BAD_USERNAME = 'E_BAD_USERNAME';
export const USER_BAD_DEVICEID = 'E_BAD_DEVICEID';
export const USER_BAD_DIGEST = 'E_BAD_DIGEST';
export const USER_BAD_VCODE = 'E_BAD_VCODE';
export const USER_EXPIRED_VCODE = 'E_EXPIRED_VCODE';
export const USER_OVERLIMIT_VCODE = 'E_OVERLIMIT_VCODE';
export const USER_RESERVED = 'E_USER_RESERVED';
export const USER_OAUTH_ERROR = 'USER_OAUTH_ERROR';
export const USER_UNSUPPORTED = 'E_USER_UNSUPPORTED';

export const POST_EMPTY_CONTENT = 'E_POST_EMPTY_CONTENT';
export const POST_OWNER_NO_MATCH = 'E_POST_OWNER_NO_MATCH';
export const POST_NO_VISION_CONTENT = 'E_POST_NO_VISION_CONTENT';
export const POST_CONTENT_EXCEEDING_LIMIT = 'E_POST_CONTENT_EXCEEDING_LIMIT';
export const POST_CONTENT_MODERATION_FAIL = 'E_W1'; // E_POST_CONTENT_MODERATION_FAIL
export const PRE_MODERATION_FAIL          = 'E_W2'; // E_PRE_MODERATION_FAIL
export const MODERATION_SERVICE_EXCEPTION = 'E_W3'; // E_MODERATION_EXCEPTION

export const POST_DELETED = 'E_POST_DELETED';
export const COMMENT_DELETED = 'E_COMMENT_DELETED';

export const CHAT_INVALID_PARAMS = 'E_CHAT_INVALID_PARAMS';
export const CHAT_REQUEST_CONFLICT = 'E_CHAT_REQUEST_CONFLICT';
export const CHAT_FORBIDDEN = 'E_CHAT_FORBIDDEN';
export const CHAT_GRANT_TOKEN_FAILED = 'E_CHAT_GRANT_TOKEN_FAILED';
export const CHAT_REVOKE_TOKEN_FAILED = 'E_CHAT_REVOKE_TOKEN_FAILED';
export const CHAT_UPDATE_FAILED = 'E_CHAT_UPDATE_FAILED';
export const CHAT_EXCEED_RATE_LIMITS = 'E_CHAT_EXCEED_RATE_LIMITS';
export const CHAT_SYNC_INVALID_USER = 'E_CHAT_SYNC_INVALID_USER';

export const SOCIALSYNC_BAD_SITE = 'E_SS_BAD_SITE';
export const SOCIALSYNC_TWT_BAD_AUTH = 'E_SS_TWT_BAD_AUTH';
export const SOCIALSYNC_TWT_ALREADY_CONNECTED = 'E_SS_TWT_CONNECTED';

export const EMAIL_PROVIDER_BLACKLISTED = 'E_EMAIL_PROVIDER_BLACKLISTED';

// Internal Service
export const SERVICE_NOT_ALLOWED = 'E_SERVICE_NOT_ALLOWED';

export const PASS_BAD_PWD = 'E_PWD_BAD';
export const PASS_TOO_SHORT = 'E_PWD_SHORT';
export const PASS_BAD_CHARS = 'E_PWD_CHARS';
export const PASS_INCL_NAME = 'E_PWD_ICLDN';
export const PASS_NONE = 'E_PWD_NONE';

export const RES_NOTFOUND = 'E_RES_NOTFOUND';
export const RES_NOACCESS = 'E_RES_NOACCESS';
export const RES_OVERLIMIT = 'E_RES_OVERLIMIT';
export const RES_ERROR = 'E_RES_ERROR';

export const HTTP_OK = 200;
export const HTTP_OK_1 = 201;
export const HTTP_CLIENT_ERROR = 400;
export const HTTP_CLIENT_AUTH = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_TIMEOUT = 408;
export const HTTP_CONFLICT = 409;
export const HTTP_RESOURCE_GONE = 410;
export const HTTP_CLIENT_NOTFOUND = 404;
export const HTTP_LOCKED = 423;
export const HTTP_TOO_MANY_REQUESTS = 429;
export const HTTP_SERVER_ERROR = 500;   // internal server error
export const HTTP_SERVER_NOTIMPL = 501;   // not implemented
export const HTTP_SERVER_NOTAVL = 503;   // service unavailable

// QR Code
export const QRCODE_EXPIRED = 'E_QR_EXPIRED';
export const QRCODE_AUTH_TIMEOUT = 'E_QR_AUTH_TIMEOUT';

// Live Chat
export const LIVECHAT_LIVE_ENDED = 'E_LIVECHAT_LIVE_ENDED';

// Poll
export const POST_NOT_POLL = 'E_POST_NOT_POLL';
export const POST_EXPIRED = 'E_POST_EXPIRED';

// Edit Post
export const EDIT_POST_EXPIRED = 'E_EDIT_POST_EXPIRED';
export const EDIT_POST_EXCEED_LIMITS = 'EDIT_POST_EXCEED_LIMITS';
