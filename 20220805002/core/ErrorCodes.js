/**
 * Represent an error record that can be passed
 * between servers and clients.
 *
 * WORK-IN-PROGRESS
 */

import XError from './model/XError';

// TODO: Need to define numeric code and map to messages
import {
  API_BAD_DATA,
  API_BAD_PARAMS,
  API_CAPTCHA_ERROR,
  API_ERROR,
  API_LOCKED,
  API_NO_OP,
  API_OK,
  API_APP_CAPTCHA_ERROR,
  API_COMMENT_NOTFOUND,
  USER_EMAIL_EXISTS,
  USER_BOUND_EMAIL,
  USER_SMS_EXISTS,
  USER_BOUND_SMS,
  HTTP_CLIENT_AUTH,
  HTTP_CLIENT_ERROR,
  API_INVALID_ACTION,
  PASS_BAD_PWD,
  API_POST_NOTFOUND,
  RES_ERROR,
  RES_NOACCESS,
  RES_NOTFOUND,
  SVC_ERROR,
  SYS_BAD_ARGS,
  SYS_BAD_DATA,
  SYS_DB_CONN,
  SYS_DB_REQ,
  SYS_ERR,
  SYS_INIT,
  SYS_NETERR,
  SYS_NOTIMPL,
  API_TAG_NOTFOUND,
  USER_BAD_AUTH,
  USER_BAD_DEVICEID,
  USER_BAD_DIGEST,
  USER_BAD_INPUT,
  USER_BAD_REQUEST,
  USER_BAD_TOKEN,
  USER_BAD_V_TOKEN,
  USER_BAD_USERNAME,
  USER_BAD_VCODE,
  USER_EXISTS,
  USER_EXPIRED_VCODE,
  USER_INVALID,
  USER_NOT_ALLOWED,
  USER_NOTFOUND,
  USER_OAUTH_ERROR,
  USER_OVER_LIMIT,
  USER_OVERLIMIT_VCODE,
  USER_RESERVED,
  SOCIALSYNC_TWT_BAD_AUTH,
  SOCIALSYNC_TWT_ALREADY_CONNECTED,
  SOCIALSYNC_BAD_SITE,
  SYS_INVALID_DATA,
  USER_NOT_CONFIGURED,
  EMAIL_PROVIDER_BLACKLISTED,
  EMAIL_NOTFOUND,
  USER_SUSPENDED,
  USER_BANNED,
  USER_BANNED_LOGIN,
  POST_EMPTY_CONTENT,
  USER_DEACTIVATED,
  POST_OWNER_NO_MATCH,
  POST_NO_VISION_CONTENT,
  POST_CONTENT_EXCEEDING_LIMIT,
  POST_CONTENT_MODERATION_FAIL,
  PRE_MODERATION_FAIL,
  MODERATION_SERVICE_EXCEPTION,
  POST_DELETED,
  COMMENT_DELETED,
  API_BAD_PARAMS_EMAIL,
  API_BAD_PARAMS_SMS,
  USER_UNSUPPORTED,
  USER_BLOCKED,
  USER_UPGRADE_REQUIRED,
  API_CONDITION_UNSATISFIED,
  SERVICE_NOT_ALLOWED,
  API_SEND_SMS_FAIL,
  CHAT_INVALID_PARAMS,
  CHAT_GRANT_TOKEN_FAILED,
  CHAT_FORBIDDEN,
  CHAT_REVOKE_TOKEN_FAILED,
  CHAT_UPDATE_FAILED,
  CHAT_REQUEST_CONFLICT,
  CHAT_EXCEED_RATE_LIMITS,
  CHAT_SYNC_INVALID_USER,
  QRCODE_EXPIRED,
  QRCODE_AUTH_TIMEOUT,
  LIVECHAT_LIVE_ENDED,
  POST_NOT_POLL,
  POST_EXPIRED,
  EDIT_POST_EXPIRED, EDIT_POST_EXCEED_LIMITS, POST_TYPE_NOT_ALLOWED,
} from './ErrorConsts';

// convenient shorthand for static getters
const E =  (code, msg = null, ...args) => {
  const eobj = new XError();
  eobj.setContent(code, msg, ...args);
  return eobj;
};

export class ErrorCodes {
  static get HTTP_CLIENT_ERROR() { return HTTP_CLIENT_ERROR; }
  static get HTTP_CLIENT_AUTH() { return HTTP_CLIENT_AUTH; }

  /**
   * Check if the given error object has the interested code.
   *
   * @param {XError=} err should be instance of XError, but can be a string code
   * @param {String} code  string code to check.
   */
  static Is(err, code) {
    return XError.HasCode(err, code);
  }

  static IsError(err) {
    return XError.IsError(err);
  }

  /**
   * Attempt to determine if the given error object is an XError
   * object, or if not an XError, then try to represent the error
   * with an XError object
   *
   * @param {object} err
   * @param {*} defaultVal
   * @returns {XError}
   */
  static GetXError(err, defaultVal = null) {
    if (err == null) { return defaultVal; }

    let xerr = null;
    if (err instanceof Error) {
      const msg = Error.message;
      const code = SYS_ERR;
      xerr = XError.New(code, msg);
    } else {
      xerr = XError.Wrap(err);
      if (xerr == null) { xerr = XError.FromJSON(err); }
    }
    return xerr;
  } // GetXError

  /**
   * Force error into a message if possible
   *
   * @param {*} err XError object, json equiv, or just string
   */
  static GetMessage(err, defaultVal = 'Unknown') {
    if (err == null) { return defaultVal; }

    if (err instanceof Error) { return err.message; }

    const xerr = XError.Wrap(err);
    return (xerr) ? xerr.getFormattedMessage() : String(err);
  } // GetMessage

  /**
   * Force error into a message if possible
   *
   * @param {*} err XError object, json equiv, or just string
   */
  static GetReadableMessage(err, defaultVal = 'Unknown') {
    if (err == null) { return defaultVal; }

    if (err instanceof Error) { return err.message; }

    const xerr = XError.Wrap(err);
    return (xerr) ? xerr.getReadableMessage() : String(err);
  } // GetReadableMessage

  static SYS_DB_CONN(msg, ...args) { return E(SYS_DB_CONN, msg, ...args); }
  static SYS_DB_REQ(msg, ...args) { return E(SYS_DB_REQ, msg, ...args); }
  static SYS_NOTIMPL(msg, ...args) { return E(SYS_NOTIMPL, msg, ...args); }
  static SYS_BAD_ARGS(msg, ...args) { return E(SYS_BAD_ARGS, msg, ...args); }
  static SYS_BAD_DATA(msg, ...args) { return E(SYS_BAD_DATA, msg, ...args); }
  // Only throw SYS_INVALID_DATA exception when rsa decryption failed.
  static SYS_INVALID_DATA(msg, ...args) { return E(SYS_INVALID_DATA, msg, ...args); }
  static SYS_INIT(msg, ...args) { return E(SYS_INIT, msg, ...args); }
  static SYS_NETERR(msg, ...args) { return E(SYS_NETERR, msg, ...args); }
  static SYS_ERROR(msg, ...args) { return E(SYS_ERR, msg, ...args); }

  static RES_NOTFOUND(msg, ...args) { return E(RES_NOTFOUND, msg, ...args); }
  static RES_NOACCESS(msg, ...args) { return E(RES_NOACCESS, msg, ...args); }
  static RES_ERROR(msg, ...args) { return E(RES_ERROR, msg, ...args); }
  static API_TAG_NOTFOUND(msg, ...args) { return E(API_TAG_NOTFOUND, msg, ...args); }
  static API_OK(msg, ...args) { return E(API_OK, msg, ...args); }
  static API_NO_OP(msg, ...args) { return E(API_NO_OP, msg, ...args); }
  static API_LOCKED(msg, ...args) { return E(API_LOCKED, msg, ...args); }
  static API_BAD_PARAMS(msg, ...args) { return E(API_BAD_PARAMS, msg, ...args); }
  static API_BAD_DATA(msg, ...args) { return E(API_BAD_DATA, msg, ...args); }
  static API_ERROR(msg, ...args) { return E(API_ERROR, msg, ...args); }
  static API_CAPTCHA_ERROR(msg, ...args) { return E(API_CAPTCHA_ERROR, msg, ...args); }
  static API_INVALID_ACTION(msg, ...args) { return E(API_INVALID_ACTION, msg, ...args); }
  static API_POST_NOTFOUND(msg, ...args) { return E(API_POST_NOTFOUND, msg, ...args); }
  static API_COMMENT_NOTFOUND(msg, ...args) { return E(API_COMMENT_NOTFOUND, msg, ...args); }
  static API_APP_CAPTCHA_ERROR(msg, ...args) { return E(API_APP_CAPTCHA_ERROR, msg, ...args); }
  static API_BAD_PARAMS_EMAIL(msg, ...args) { return E(API_BAD_PARAMS_EMAIL, msg, ...args); }
  static API_BAD_PARAMS_SMS(msg, ...args) { return E(API_BAD_PARAMS_SMS, msg, ...args); }
  static API_CONDITION_UNSATISFIED(msg, ...args) { return E(API_CONDITION_UNSATISFIED, msg, ...args); }
  static API_SEND_SMS_FAIL(msg, ...args) { return E(API_SEND_SMS_FAIL, msg, ...args); }

  static USER_EMAIL_EXISTS(msg, ...args) { return E(USER_EMAIL_EXISTS, msg, ...args); }
  static USER_BOUND_EMAIL(msg, ...args) { return E(USER_BOUND_EMAIL, msg, ...args); }
  static USER_SMS_EXISTS(msg, ...args) { return E(USER_SMS_EXISTS, msg, ...args); }
  static USER_BOUND_SMS(msg, ...args) { return E(USER_BOUND_SMS, msg, ...args); }
  static USER_BAD_INPUT(msg, ...args) { return E(USER_BAD_INPUT, msg, ...args); }
  static USER_BAD_TOKEN(msg, ...args) { return E(USER_BAD_TOKEN, msg, ...args); }
  static USER_BAD_V_TOKEN(msg, ...args) { return E(USER_BAD_V_TOKEN, msg, ...args); }
  static USER_BAD_REQUEST(msg, ...args) { return E(USER_BAD_REQUEST, msg, ...args); }
  static USER_BAD_AUTH(msg, ...args) { return E(USER_BAD_AUTH, msg, ...args); }
  static USER_EXISTS(msg, ...args) { return E(USER_EXISTS, msg, ...args); }
  static USER_NOTFOUND(msg, ...args) { return E(USER_NOTFOUND, msg, ...args); }
  static USER_NOT_ALLOWED(msg, ...args) { return E(USER_NOT_ALLOWED, msg, ...args); }
  static USER_NOT_CONFIGURED(msg, ...args) { return E(USER_NOT_CONFIGURED, msg, ...args); }
  static USER_INVALID(msg, ...args) { return E(USER_INVALID, msg, ...args); }
  static USER_BLOCKED(msg, ...args) { return E(USER_BLOCKED, msg, ...args); }
  static USER_SUSPENDED(msg, ...args) { return E(USER_SUSPENDED, msg, ...args); }
  static USER_BANNED(msg, ...args) { return E(USER_BANNED, msg, ...args); }
  static USER_BANNED_LOGIN(msg, ...args) { return E(USER_BANNED_LOGIN, msg, ...args); }
  static USER_DEACTIVATED(msg, ...args) { return E(USER_DEACTIVATED,  msg, ...args); }
  static USER_UPGRADE_REQUIRED(msg, ...args) { return E(USER_UPGRADE_REQUIRED,  msg, ...args); }
  static USER_OVER_LIMIT(msg, ...args) { return E(USER_OVER_LIMIT, msg, ...args); }
  static USER_BAD_USERNAME(msg, ...args) { return E(USER_BAD_USERNAME, msg, ...args); }
  static USER_BAD_DEVICEID(msg, ...args) { return E(USER_BAD_DEVICEID, msg, ...args); }
  static USER_BAD_DIGEST(msg, ...args) { return E(USER_BAD_DIGEST, msg, ...args); }
  static USER_BAD_VCODE(msg, ...args) { return E(USER_BAD_VCODE, msg, ...args); }
  static USER_EXPIRED_VCODE(msg, ...args) { return E(USER_EXPIRED_VCODE, msg, ...args); }
  static USER_OVERLIMIT_VCODE(msg, ...args) { return E(USER_OVERLIMIT_VCODE, msg, ...args); }
  static USER_RESERVED(msg, ...args) { return E(USER_RESERVED, msg, ...args); }
  static USER_OAUTH_ERROR(msg, ...args) { return E(USER_OAUTH_ERROR, msg, ...args); }
  static USER_UNSUPPORTED(msg, ...args) { return E(USER_UNSUPPORTED, msg, ...args); }
  static EMAIL_PROVIDER_BLACKLISTED(msg, ...args) { return E(EMAIL_PROVIDER_BLACKLISTED, msg, ...args); }
  static EMAIL_NOTFOUND(msg, ...args) { return E(EMAIL_NOTFOUND, msg, ...args); }
  static POST_EMPTY_CONTENT(msg, ...args) { return E(POST_EMPTY_CONTENT, msg, ...args); }
  static POST_OWNER_NO_MATCH(msg, ...args) { return E(POST_OWNER_NO_MATCH, msg, ...args); }
  static POST_NO_VISION_CONTENT(msg, ...args) { return E(POST_NO_VISION_CONTENT, msg, ...args); }
  static POST_CONTENT_EXCEEDING_LIMIT(msg, ...args) { return E(POST_CONTENT_EXCEEDING_LIMIT, msg, ...args); }
  static POST_CONTENT_MODERATION_FAIL(msg, ...args) { return E(POST_CONTENT_MODERATION_FAIL, msg, ...args); }
  static PRE_MODERATION_FAIL(msg, ...args) { return E(PRE_MODERATION_FAIL, msg, ...args); }
  static MODERATION_SERVICE_EXCEPTION(msg, ...args) { return E(MODERATION_SERVICE_EXCEPTION, msg, ...args); }

  static POST_DELETED(msg, ...args) { return E(POST_DELETED, msg, ...args); }
  static COMMENT_DELETED(msg, ...args) { return E(COMMENT_DELETED, msg, ...args); }

  static CHAT_INVALID_PARAMS(msg, ...args) { return E(CHAT_INVALID_PARAMS, msg, ...args); }
  static CHAT_REQUEST_CONFLICT(msg, ...args) { return E(CHAT_REQUEST_CONFLICT, msg, ...args); }
  static CHAT_FORBIDDEN(msg, ...args) { return E(CHAT_FORBIDDEN, msg, ...args); }
  static CHAT_GRANT_TOKEN_FAILED(msg, ...args) { return E(CHAT_GRANT_TOKEN_FAILED, msg, ...args); }
  static CHAT_REVOKE_TOKEN_FAILED(msg, ...args) { return E(CHAT_REVOKE_TOKEN_FAILED, msg, ...args); }
  static CHAT_UPDATE_FAILED(msg, ...args) { return E(CHAT_UPDATE_FAILED, msg, ...args); }
  static CHAT_EXCEED_RATE_LIMITS(msg, ...args) { return E(CHAT_EXCEED_RATE_LIMITS, msg, ...args); }
  static CHAT_SYNC_INVALID_USER(msg, ...args) { return E(CHAT_SYNC_INVALID_USER, msg, ...args); }

  static PASS_BAD_PWD(msg, ...args) { return E(PASS_BAD_PWD, msg, ...args); }
  // For kafka

  static CONSUMER_SERVICE_ERROR(msg, ...args) { return E(SVC_ERROR, msg, ...args); }

  // Social Connect
  static SOCIALSYNC_BAD_SITE(msg, ...args) { return E(SOCIALSYNC_BAD_SITE, msg, ...args); }
  static SOCIALSYNC_TWT_ALREADY_CONNECTED(msg, ...args) { return E(SOCIALSYNC_TWT_ALREADY_CONNECTED, msg, ...args); }
  static SOCIALSYNC_TWT_BAD_AUTH(msg, ...args) { return E(SOCIALSYNC_TWT_BAD_AUTH, msg, ...args); }

  // Internal Service
  static SERVICE_NOT_ALLOWED(msg, ...args) { return E(SERVICE_NOT_ALLOWED, msg, ...args); }

  // customize error code
  static CUSTOMIZE_ERROR_CODE(errorCode, msg, ...args) { return E(errorCode, msg, ...args); }

  // qr code
  static QRCODE_EXPIRED(msg, ...args) { return E(QRCODE_EXPIRED, msg, ...args); }
  static QRCODE_AUTH_TIMEOUT(msg, ...args) { return E(QRCODE_AUTH_TIMEOUT, msg, ...args); }

  // live chat
  static LIVECHAT_LIVE_ENDED(msg, ...args) { return E(LIVECHAT_LIVE_ENDED, msg, ...args); }

  // poll
  static POST_NOT_POLL(msg, ...args) { return E(POST_NOT_POLL, msg, ...args); }
  static POST_EXPIRED(msg, ...args) { return E(POST_EXPIRED, msg, ...args); }

  // edit post
  static EDIT_POST_EXPIRED(msg, ...args) { return E(EDIT_POST_EXPIRED, msg, ...args); }
  static EDIT_POST_EXCEED_LIMITS(msg, ...args) { return E(EDIT_POST_EXCEED_LIMITS, msg, ...args); }
  static POST_TYPE_NOT_ALLOWED(msg, ...args) { return E(POST_TYPE_NOT_ALLOWED, msg, ...args); }
}

export default ErrorCodes;
