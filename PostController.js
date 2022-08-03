import _ from 'lodash';
import REST from '../../../core/net/REST';
import EC from '../../../core/ErrorCodes';
import API from '../../../core/API';
import {
  ActivityLogProps, LanguageCodes,
  StatsProps,
  UserProps,
  XObjectProps
} from '../../../core/model/ModelConsts';
import ElasticsearchService from '../../../services/textsearch/ElasticsearchService';
import Util, { TimeUtil } from '../../../core/Util';
import { RES_ERROR, RES_NOTFOUND } from '../../../core/ErrorConsts';
import PostService, { MODERATOR_MODE } from '../../../services/post/PostService';
import XMPost from '../../../core/model/post/XMPost';
import BaseController from '../BaseController';
import { XMWatched } from '../../../core/model/social/XMWatch';
import GlobalParameter, { PER_DAY, PER_MIN } from '../../model/GlobalParameter';
import {
  BLACKLIST_LIVE_USERS,
  PUBLIC_LIVE_USERS,
  SystemService
} from '../../../services/system/SystemService';
import SystemConfig from '../../SystemConfig';
import RedisUtil, { EXPIRE_TIME_FOR_LIKE, EXPIRE_TIME_FOR_SHARE } from '../../../services/core/store/RedisUtil';
import UserInfoHelper from '../../../services/user/UserInfoHelper';
import XResultMap from '../../../core/model/util/XResultMap';
import XUserInfo from '../../../core/model/user/XUserInfo';
import XPostFeed from '../../../core/model/activity/XPostFeed';
import gettrLogger from '../../../core/GettrLogger';
import ModerationReasonHelper from '../../../services/moderation/ModerationReasonHelper';
import XMModerationReasons from '../../../core/model/moderation/XMModerationReasons';
import StorageManager from '../../../services/core/StorageManager';

XMPost.CheckIn();

const _CLSNAME = 'PostController';
const logger = gettrLogger(_CLSNAME);

const LOG = (method, msg, ...args) => {
  logger.info(`${_CLSNAME}.${method}: ${msg}`, { ...args });
};
const ERROR = (method, msg, ...args) => {
  logger.error(`${_CLSNAME}.${method}: ${msg}`, { ...args });
};

const getParams = (req) => {
  let content;
  if (req.method === 'POST') { content = req.body; } else if (req.method === 'GET') { content = (req.query) ? req.query : req; } else { content = (req.query) ? req.query : req; }

  return content;
};

class PostController extends BaseController {

  // ===============================================================
  //
  // ENTRY POINTS FOR ROUTES (web endpoints)
  //
  // ================================================================


  // ------------ Post Like / Watch -------------------------

  /**
   * implement API GET:/api/post/{:postId}/liked
   *
   * @param {*} req postId post for which to fetch liked users
   *
   * @param {*} res
   */
  static async get_liked_post(req, res) {
    const _api = 'get_liked_post';
    const args = (req.query) ? req.query : req;
    const postId = req.params['postId'];
    const _m = `${_CLSNAME}.${_api}(${postId})`;
    let offset = args[API.OFFSET] ? parseInt(args[API.OFFSET], 10) : 0;
    let max = args[API.MAX] ? parseInt(args[API.MAX], 10) : 20;
    max = Util.toNumberWithRange(max, 0, 20, 20);
    offset = Util.toNumberWithRange(offset, 0, null, 0);

    const inclOptions = args[API.PARAM_INCL];
    const queryOptions = {
      offset,
      max,
      expire: EXPIRE_TIME_FOR_LIKE,
    };

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // let followId = req.params["followId"];
    // LOG(_m, `Post ${postId}, args: ${args}`);

    try {
      const likedObj = await PostService.GetPostLikedBy(apiContext, postId, null, queryOptions);
      const likedUsers = likedObj ? likedObj.getLikes() : [];
      const result = await UserInfoHelper.PreloadUserIdList(apiContext, likedUsers, inclOptions, 'post_likedby');
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_liked_post

  /**
   * implement API GET:/api/post/{:postId}/shared
   *
   * @param {*} req postId post for which to fetch liked users
   *
   * @param {*} res
   */
  static async get_shared_post(req, res) {
    const _api = 'get_shared_post';
    const args = (req.query) ? req.query : req;
    const postId = req.params['postId'];
    const _m = `${_CLSNAME}.${_api}(${postId})`;
    let offset = args[API.OFFSET] ? parseInt(args[API.OFFSET], 10) : 0;
    let max = args[API.MAX] ? parseInt(args[API.MAX], 10) : 20;
    max = Util.toNumberWithRange(max, 0, 20, 20);
    offset = Util.toNumberWithRange(offset, 0, null, 0);

    const inclOptions = args[API.PARAM_INCL];
    const queryOptions = {
      offset,
      max,
      expire: EXPIRE_TIME_FOR_SHARE,
    };

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // let followId = req.params["followId"];
    // LOG(_m, `Post ${postId}, args: ${args}`);

    try {
      const sharedObj = await PostService.GetPostSharedBy(apiContext, postId, null, queryOptions);
      const sharedUsers = sharedObj ? sharedObj.getShares() : [];
      const result = await UserInfoHelper.PreloadUserIdList(apiContext, sharedUsers, inclOptions, 'post_sharedby');
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_shared_post

  /**
   * Implement API GET:/api/post/{:postId}/liked/{userId}, which
   * returns the follow status of either "yes", "no", or "pending"
   *
   * NOTE: not called; use get_post_stats (?)
   *
   * @param {*} req userId and targetId
      *
   * @param {*} res
   */
  static async get_status_liked_post(req, res) {
    const _api = 'get_status_liked_post';
    const params = REST.GetParams(req);
    const postId = req.params['postId'];
    const _m = `${_CLSNAME}.${_api}(${postId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    const userId = Util.GetString(req.params['userId']);
    LOG(_m, `Checking if post liked by: ${userId}`);
    try {
      const verdict = await PostService.GetLikeStatusPost(postId, userId);
      REST.RespondOK(res, verdict);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_status_liked_post

  /**
   * implement API GET:/api/post/{:postId}/watched
   *
   * @param {*} req postId post for which to fetch watched users
   *
   * @param {*} res
   */
  static async get_watched_post(req, res) {
    const _api = 'get_watched_post';
    const args = (req.query) ? req.query : req;
    const postId = req.params['postId'];
    const _m = `${_api}(${postId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // let followId = req.params["followId"];
    LOG(_m, `Post ${postId}, args: ${args}`);

    try {
      let watchedObj = await PostService.GetWatchedPost(postId);
      if (watchedObj == null) { watchedObj = XMWatched.CreateNew(postId); }
      REST.RespondOK(res, watchedObj);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_watched_post

  /**
   * Implement API GET:/api/post/{:postId}/watched/{userId}, which
   * returns the follow status of either "yes", "no", or "pending"
   *
   * NOTE: not called; use get_post_stats (?)
   *
   * @param {*} req userId and targetId
      *
   * @param {*} res
   */
  static async get_status_watched_post(req, res) {
    const _api = 'get_status_watched_post';
    const params = REST.GetParams(req);

    const postId = req.params['postId'];
    const _m = `${_api}(${postId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, true);
    if (!pass) { return; }

    const userId = Util.GetString(req.params['userId']);
    LOG(_m, `Checking if post watched by: ${userId}`);

    try {
      const verdict = await PostService.GetWatchPostStatus(postId, userId);
      LOG(_m, `Returning watched by ${userId} is ${verdict}.`);
      REST.RespondOK(res, verdict);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_status_watched_post

  /**
   * implement API GET:/api/post/{:postId}/stats
   *
   * @param {*} req postId post for which to fetch stats
   *
   * @param {*} res
   */
  static async get_post_stats(req, res) {
    const _api = 'get_post_stats';
    const params = REST.GetParams(req);
    const args = (req.query) ? req.query : req;
    const postId = req.params['postId'];
    const _m = `${_CLSNAME}.get_post_stats(${postId})`;


    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, true);
    if (!pass) { return; }

    // const inclPost = REST.GetParams(req, INCL_OBJ, null, false);
    const inclOptions = REST.GetParams(req, API.PARAM_INCL);
    const inclPost = API.HasOption(inclOptions, API.INCL_POSTS);

    let result;
    try {
      if (inclPost) {
        // result = await PostService.GetPostWithStats(postId);
        result = await PostService.GetPostInfo(postId);
      } else {
        // result = await PostService.GetPostStats(postId);
        result = await PostService.GetPostInfo(postId, [
          StatsProps.LIKEDBY_POST,
          StatsProps.POST_SHAREDBY,
          StatsProps.LIKEDBY_COMMENT,
          StatsProps.COMMENT_SHAREDBY,
          StatsProps.COMMENTS,
          XObjectProps.VISIBILITY
        ], false, false);
      }
      if (Util.IsNull(result)) {
        const errmsg = `Failed to retrieve post stats: ${postId}, post does not exist.`;
        REST.RespondError(res, EC.API_ERROR(errmsg));
      } else {
        REST.RespondOK(res, result);
      }
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_post_stats

  static async get_posts_stats(req, res) {
    const _api = 'get_posts_stats';
    const _m = `${_CLSNAME}.get_posts_stats`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, true);
    if (!pass) { return; }

    try {
      const content = xRequest.getContent();
      if (!content) {
        REST.RespondError(res, EC.API_BAD_DATA('empty post ids'));
      }
      let postIds = content.postIds;

      postIds = postIds && !Util.ArrayIsEmpty(postIds) ? postIds.slice(0, 20) : [];

      const statsMap = await PostService.GetPostInfosByIds(postIds, [
        StatsProps.LIKEDBY_POST,
        StatsProps.POST_SHAREDBY,
        StatsProps.LIKEDBY_COMMENT,
        StatsProps.COMMENT_SHAREDBY,
        StatsProps.COMMENTS,
        XObjectProps.VISIBILITY
      ]);
      /**
       * For APP backward compatibility v1.1.5 and older
       * stats need to be in type string
       */
      const appVer = Util.versionToNumber(apiContext.getAppVersion());
      if (appVer < 116) {
        _.forEach(statsMap, (value, key) => {
          _.forEach(value, (v, k) => {
            value[k] = `${v}`;
          });
          statsMap[key] = value;
        });
      }

      const resultMap = XResultMap.Create(Date.now(), _m, _api);
      resultMap.setEntryMap(statsMap);
      REST.RespondOK(res, resultMap);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_post_stats

  // ------------ Comment Like / Watch -------------------------

  /**
   * implement API GET:/api/comment/{:id}/liked
   *
   * @param {*} req commentId comment for which to fetch liked users
   *
   * @param {*} res
   */
  static async get_liked_comment(req, res) {
    const _api = 'get_liked_comment';
    const args = (req.query) ? req.query : req;
    const commentId = req.params['commentId'];
    const _m = `${_CLSNAME}.${_api}(${commentId})`;
    let offset = args[API.OFFSET] ? parseInt(args[API.OFFSET], 10) : 0;
    let max = args[API.MAX] ? parseInt(args[API.MAX], 10) : 20;
    max = Util.toNumberWithRange(max, 0, 20, 20);
    offset = Util.toNumberWithRange(offset, 0, null, 0);

    const inclOptions = args[API.PARAM_INCL];
    const queryOptions = {
      offset,
      max,
      expire: EXPIRE_TIME_FOR_LIKE,
    };

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, true);
    if (!pass) { return; }

    // let followId = req.params["followId"];
    // LOG(_api, `Comment ${commentId}, args: ${args}`);

    try {
      const likedObj = await PostService.GetLikedComment(apiContext, commentId, null, queryOptions);
      const likedUsers = likedObj ? likedObj.getLikes() : [];
      const result = await UserInfoHelper.PreloadUserIdList(apiContext, likedUsers, inclOptions, 'cmt_likedby');
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_liked_comment

  /**
   * implement API GET:/api/comment/{:id}/shared
   *
   * @param {*} req commentId comment for which to fetch liked users
   *
   * @param {*} res
   */
  static async get_shared_comment(req, res) {
    const _api = 'get_shared_comment';
    const args = (req.query) ? req.query : req;
    const commentId = req.params['commentId'];
    const _m = `${_CLSNAME}.${_api}(${commentId})`;
    let offset = args[API.OFFSET] ? parseInt(args[API.OFFSET], 10) : 0;
    let max = args[API.MAX] ? parseInt(args[API.MAX], 10) : 20;
    max = Util.toNumberWithRange(max, 0, 20, 20);
    offset = Util.toNumberWithRange(offset, 0, null, 0);

    const inclOptions = args[API.PARAM_INCL];
    const queryOptions = {
      offset,
      max,
      expire: EXPIRE_TIME_FOR_SHARE,
    };

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, true);
    if (!pass) { return; }

    // let followId = req.params["followId"];
    // LOG(_api, `Comment ${commentId}, args: ${args}`);

    try {
      const sharedObj = await PostService.GetCommentSharedBy(apiContext, commentId, null, queryOptions);
      const sharedUsers = sharedObj ? sharedObj.getShares() : [];
      const result = await UserInfoHelper.PreloadUserIdList(apiContext, sharedUsers, inclOptions, 'cmt_sharedby');
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_shared_comment

  /**
   * Implement API GET:/api/comment/{:id}/liked/{userId}, which
   * returns the follow status of either "yes", "no", or "pending"
   *
   * NOTE: not called; use get_comment_stats (?)
   *
   * @param {*} req userId and targetId
      *
   * @param {*} res
   */
  static async get_status_liked_comment(req, res) {
    const params = REST.GetParams(req);
    const id = req.params['id'];
    const _api = 'get_liked_comment';

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    const userId = Util.GetString(req.params['userId']);
    LOG(_api, `Checking if comment liked by: ${userId}`);

    try {
      const verdict = await PostService.GetLikeStatusComment(id, userId);
      LOG(_api, `Returning liked by ${userId} is ${verdict}.`);
      REST.RespondOK(res, verdict);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_status_liked_comment

  /**
   * implement API GET:/api/comment/{:id}/watched
   *
   * @param {*} req commentId comment for which to fetch watched users
   *
   * @param {*} res
   */
  static async get_watched_comment(req, res) {
    const _api = 'get_watched_comment';
    const args = (req.query) ? req.query : req;
    const commentId = req.params['id'];
    const _m = `${_api}(${commentId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // let followId = req.params["followId"];
    LOG(_m, `Post ${commentId}, args: ${args}`);

    try {
      let xWatched = await PostService.GetWatchedComment(commentId);
      if (xWatched == null) { xWatched = XMWatched.CreateNew(commentId); }
      LOG(_m, ' result: ', xWatched);
      REST.RespondOK(res, xWatched);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_watched_comment

  /**
   * Implement API GET:/api/comment/{:id}/watched/{userId}, which
   * returns the follow status of either "yes", "no", or "pending"
   *
   * NOTE: not called; use get_comment_stats (?)
   *
   * @param {*} req userId and targetId
      *
   * @param {*} res
   */
  static async get_status_watched_comment(req, res) {
    const params = REST.GetParams(req);
    const id = req.params['id'];
    const _m = `${_CLSNAME}.get_status_watched_comment(${id})`;
    const _api = 'get_status_watched_comment';

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    const userId = Util.GetString(req.params['userId']);
    LOG(_m, `Checking if Comment watched by: ${userId}`);

    try {
      const verdict = await PostService.GetWatchCommentStatus(id, userId);
      LOG(_m, `Returning watched by ${userId} is ${verdict}.`);
      REST.RespondOK(res, verdict);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_status_watched_comment

  /**
   * implement API GET:/api/rltpl/{:id}/stats
   *
   * @param {*} req commentId comment for which to fetch stats
   *
   * @param {*} res
   */
  static async get_comment_stats(req, res) {
    const _api = 'get_comment_stats';
    const args = (req.query) ? req.query : req;
    const commentId = req.params['commentId'];
    const _m = `${_CLSNAME}.${_api}(${commentId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const objStats = await PostService.GetCommentStats(commentId);
      REST.RespondOK(res, objStats);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_comment_stats

  // ---------------------

  /**
   * Retrieving a post object with auxillary information.
   * This should serve the endpoint: /s/post/:id
   *
   * URL arguments/props: API.INCL_REFOBJS, API.INCL_STATS
   *
   * @return {Post}
   */
  static async s_get_post(req, res) {
    const inclOptions = REST.GetParams(req, API.PARAM_INCL); // query params
    const postId = req.params['postId'];
    const _api = 's_get_post';
    const _m = `${_api}(${postId})`;

    // No auth required?
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const xmPost = await PostService.LoadPost(apiContext, postId, inclOptions);
      REST.RespondOK(res, xmPost);
    } catch (err) {
      logger.error('API failed.', { err, postId, _api });
      REST.RespondError(res, err);
    }
  } // s_get_post

  /**
   * Retrieving a post object on behalf of the user.
   * This should serve the endpoint: /u/post/:id
   *
   * URL arguments/props: API.INCL_REFOBJS, API.INCL_STATS
   *
   * @return {Post}
   */
  static async u_get_post(req, res) {
    const inclOptions = REST.GetParams(req, API.PARAM_INCL);
    const postId = req.params['postId'];
    const _api = 'u_get_post';
    const _m = `${_api}(${postId})`;

    // No auth required?
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    const selector = null;
    const accessLevel = ActivityLogProps.INFOACCESS_DETAILS;
    try {
      const xmPost = await PostService.LoadPost(apiContext, postId, inclOptions, selector);

      REST.RespondOK(res, xmPost);
    } catch (err) {
      logger.error('API failed.', { err, postId, _api });
      REST.RespondError(res, err);
    }
  } // api_get_post

  static async view_post(req, res) {
    const postId = req.params['postId'];
    const _api = 'view_post';
    const _m = `${_api}(${postId})`;

    // No auth required?
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    const content = REST.GetParams(req);
    const view_dur = content.view_dur || 0;
    const play_dur = content.play_dur || 0;
    const act_type = content.act_type || null;
    const view_location = content.view_location || null;

    try {
      const options = {
        view_dur,
        play_dur,
        act_type,
        view_location,
      };
      const result = await PostService.ViewPost(apiContext, postId, options);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, postId, _api });
      REST.RespondError(res, err);
    }
  } // api_get_post

  /**
   * Process user post submission (via POST). Post object
   * should not have an ID assigned.
   *
   * Uploaded images will be processed with scaling to
   * default dimensions and moved to user storage.
   *
   * @param api api name
   * @param {*} req
   * @param {*} res
   */
  static async submit_post(req, res, api, apiType) {
    const _api = 'submit_post';
    const args = (req.query) ? req.query : req;
    const _m = `${_CLSNAME}.${_api}`;
    let props = args['props'];
    if (props && (typeof props === 'string')) { props = JSON.parse(props); }

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass || !apiContext) { return; }

    // rate limit based on user level
    const keyId = apiContext.getAuthenticatedUserId();
    const [overMinLimit, minRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.POST_PER_MIN, 5, PER_MIN, `${keyId}_min`);
    if (overMinLimit) { return REST.Respond429(res); }
    const [overDayLimit, dayRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.POST_PER_DAY, 100, PER_DAY, `${keyId}_day`);
    if (overDayLimit) { return REST.Respond429(res); }

    const xmPost = xRequest.getContent();
    const imageFiles = req.files;

    try {
      const result = await PostService.SubmitPost(apiContext, xmPost, imageFiles, null);

      // return posts left
      result.addAuxData({
        [XObjectProps.RATE_LIMIT]: {
          min: minRemain,
          day: dayRemain,
        }
      });
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // submit_post

  static async s_submit_post(req, res) {
    return PostController.submit_post(req, res, 's_submit_post', ActivityLogProps.API_TYPE_SYS);
  }

  static async u_sumbit_post(req, res) {
    return PostController.submit_post(req, res, 'u_submit_post', ActivityLogProps.API_TYPE_USER);
  }

  /**
   * Process user repost submission (via POST). Repost is
   * a regular post submit but references another post.
   *
   * Uploaded images will be processed with scaling to
   * default dimensions and moved to user storage.
   *
   * @param api api name
   * @param {*} req
   * @param {*} res
   *
   */
  static async u_submit_repost(req, res) {
    const _api = 'submit_repost';
    const args = (req.query) ? req.query : req;
    const _m = `${_CLSNAME}.${_api}`;
    let props = args['props'];
    if (props && (typeof props === 'string')) { props = JSON.parse(props); }

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // rate limit based on user level
    const keyId = apiContext && apiContext.getUserInfo() ? apiContext.getUserInfo().getUserId() : null;
    const [overMinLimit, minRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.REPOST_PER_MIN, 5, PER_MIN, `${keyId}_min`);
    if (overMinLimit) { return REST.Respond429(res); }
    const [overDayLimit, dayRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.REPOST_PER_DAY, 100, PER_DAY, `${keyId}_day`);
    if (overDayLimit) { return REST.Respond429(res); }

    const xmPost = xRequest.getContent();
    const imageFiles = req.files;
    const videoFile = null;

    try {
      const result = await PostService.SubmitRepost(apiContext, xmPost, imageFiles, videoFile);

      // return posts left
      result.addAuxData({
        [XObjectProps.RATE_LIMIT]: {
          min: minRemain,
          day: dayRemain,
        }
      });
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // submit_post

  /**
   * Update a post object.
   *
   * @param {*} req
   * @param {*} res
   */
  static async update_post(req, res) {
    const _api = 'update_post';
    const postId = req.params['postId'];

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    try {
      const xmPost = xRequest.getContent();
      const result = await PostService.UpdatePost(apiContext, postId, xmPost);
      logger.info('Post updated successfully.', { success: result, postId, _api });
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // update_post

  /**
   * "Delete" post. This is more involved as there
   * are users that maybe "watching" this post.
   *
   * @param {*} req
   * @param {*} res
   */
  static async delete_post(req, res) {
    const _api = 'delete_post';
    const args = (req.query) ? req.query : req;
    const userId = Util.GetString(req.params['userId']);
    const postId = req.params['postId'];
    const _m = `${_CLSNAME}.${_api}(${postId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    try {
      const result = await PostService.SetDeletePost(apiContext, postId);
      logger.info('Post deleted successfully.', { success: result, postId, _api });
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // delete_post

  // ------------------- USER COMMENT ENTRY POINTS ------------------

  /**
   * Process user comment submission (for POST). Comment object
   * should not have an ID assigned.
   *
   * Uploaded images will be processed with scaling to
   * default dimensions and moved to user storage.
   *
   * @param api api name
   * @param {*} req
   * @param {*} res
   */
  static async submit_post_comment(req, res) {
    const _api = 'submit_post_comment';
    const args = (req.query) ? req.query : req;
    const _m = `${_CLSNAME}.${_api}`;
    let props = args['props'];
    if (props && (typeof props === 'string')) { props = JSON.parse(props); }

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // rate limit based on user level
    const keyId = apiContext && apiContext.getUserInfo() ? apiContext.getUserInfo().getUserId() : null;
    const [overMinLimit, minRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.CMT_PER_MIN, 5, PER_MIN, `${keyId}_min`);
    if (overMinLimit) { return REST.Respond429(res); }
    const [overDayLimit, dayRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.CMT_PER_DAY, 100, PER_DAY, `${keyId}_day`);
    if (overDayLimit) { return REST.Respond429(res); }

    // let formData = xRequest.getFormData();
    const postId = req.params['postId'];

    const xmComment = xRequest.getContent();
    const imageFiles = req.files;

    try {
      const result = await PostService.SubmitComment(apiContext, postId, xmComment, imageFiles, null);

      // return posts left
      result.addAuxData({
        [XObjectProps.RATE_LIMIT]: {
          min: minRemain,
          day: dayRemain,
        }
      });
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // submit_post_comment


  /**
   * Process user comment submission (for POST). Comment object
   * should not have an ID assigned.
   *
   * Uploaded images will be processed with scaling to
   * default dimensions and moved to user storage.
   *
   * @param api api name
   * @param {*} req
   * @param {*} res
   */
  static async submit_comment_comment(req, res) {
    const _api = 'submit_comment_comment';
    const args = (req.query) ? req.query : req;
    const _m = `${_CLSNAME}.${_api}`;
    let props = args['props'];
    if (props && (typeof props === 'string')) { props = JSON.parse(props); }

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // rate limit based on user level
    const keyId = apiContext && apiContext.getUserInfo() ? apiContext.getUserInfo().getUserId() : null;
    const [overMinLimit, minRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.CMT_PER_MIN, 5, PER_MIN, `${keyId}_min`);
    if (overMinLimit) { return REST.Respond429(res); }
    const [overDayLimit, dayRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.CMT_PER_DAY, 100, PER_DAY, `${keyId}_day`);
    if (overDayLimit) { return REST.Respond429(res); }

    // let formData = xRequest.getFormData();
    const parentId = req.params['commentId'];

    const xmComment = xRequest.getContent();
    const imageFiles = req.files;

    try {
      const result = await PostService.SubmitComment(apiContext, parentId, xmComment, imageFiles, null);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // submit_comment_comment

  /**
   * Process comment repost submission (via POST). Repost is
   * a regular post submit but references (and embeds) a
   * comment
   *
   * Uploaded images will be processed with scaling to
   * default dimensions and moved to user storage.
   *
   * @param api api name
   * @param {*} req
   * @param {*} res
   *
   */
  static async submit_comment_repost(req, res) {
    const _api = 'submit_comment_repost';
    const args = (req.query) ? req.query : req;
    const _m = `${_CLSNAME}.${_api}`;
    let props = args['props'];
    if (props && (typeof props === 'string')) { props = JSON.parse(props); }

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // rate limit based on user level
    const keyId = apiContext && apiContext.getUserInfo() ? apiContext.getUserInfo().getUserId() : null;
    const [overMinLimit, minRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.REPOST_PER_MIN, 5, PER_MIN, `${keyId}_min`);
    if (overMinLimit) { return REST.Respond429(res); }
    const [overDayLimit, dayRemain] = await BaseController.RateLimitCheckW_UserLevel(_api, apiContext, GlobalParameter.REPOST_PER_DAY, 100, PER_DAY, `${keyId}_day`);
    if (overDayLimit) { return REST.Respond429(res); }

    const xmPost = xRequest.getContent();
    const imageFiles = req.files;
    const videoFile = null;

    try {
      const result = await PostService.SubmitRepost(apiContext, xmPost, imageFiles, videoFile);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  }


  /**
   * "Delete" post comment. Not tested as of 3/2020
   *
   * @param {*} req
   * @param {*} res
   */
  static async delete_post_comment(req, res) {
    const _api = 'delete_post_comment';
    const args = (req.query) ? req.query : req;
    const commentId = req.params['commentId'];
    const _m = `${_CLSNAME}.${_api}(${commentId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    try {
      const result = await PostService.SetDeleteComment(apiContext, commentId);
      logger.info('Comment deleted successfully.', { success: result, commentId, _api });
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // delete_comment


  /**
   * Retrieving a comment object with auxillary information.
   * This should serve the endpoint: /api/comment/:id
   *
   * @return {Comment}
   */
  static async get_post_comment(req, res) {
    const _api = 'get_post_comment';
    const inclOptions = REST.GetParams(req, API.PARAM_INCL);
    const commentId = req.params['commentId'];
    const props = req.params['props'];
    const _m = `${_CLSNAME}.${_api}(${commentId})`;

    // authentication not needed
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const xmComment = await PostService.LoadComment(apiContext, commentId, inclOptions);
      REST.RespondOK(res, xmComment);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_comment

  /**
   * Retrieve multiple comment objects directly under a post
   *
   */
  static async get_post_comments(req, res) {
    const _api = 'get_post_comments';
    const args = (req.query) ? req.query : req;
    const postId = req.params['postId'];
    const _m = `${_CLSNAME}.${_api}_${postId}`;

    // auth not required (public view)
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    /**
     * Generate pageOptions
     */
    const cursor = args ? args[API.CURSOR] : null;
    let startTS, endTS, nextId, offset;
    if (cursor) {
      [startTS, nextId] = RedisUtil.DecodeCursor(cursor);
      offset = 0;
      if (Util.IsNull(startTS) || Util.IsNull(nextId)) {
        // invalid cursor, return empty feed
        REST.RespondOK(res, XPostFeed.Create(`cfd_${Date.now()}`, []));
      }
    } else {
      startTS = args ? Util.toNumber(args[API.START_TS], Date.now()) : Date.now();
      endTS = args ? Util.toNumber(args[API.END_TS]) : null;

      offset = args ? Util.toNumberWithRange(args[API.OFFSET], 0, null, 0) : 0;
    }
    const max = args ? Util.toNumberWithRange(args[API.BATCH_SIZE], 0, 20, 20) : 20;
    const sort = args ? args[API.SORT_BY] : null; // not used (sort by time)
    const pageOptions = {
      startTS,
      endTS,
      max,
      offset,
      nextId,
      sort,
    };

    let inclOptions = args[API.PARAM_INCL];
    if (inclOptions == null) { inclOptions = `${API.INCL_COMMENTS}|${API.INCL_STATS}|${API.INCL_USERINFO}`; }
    // const ecode = null;
    try {
      const xCommentFeed = await PostService.GetPostReplies(apiContext, postId, pageOptions, inclOptions);
      REST.RespondOK(res, xCommentFeed);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_post_comments


  /**
   * Retrieve multiple comment objects under a comment
   *
   */
  static async get_comment_comments(req, res) {
    const _api = 'get_comment_comments';
    const _m = `${_CLSNAME}.${_api}`;
    const commentId = req.params['commentId'];
    const args = (req.query) ? req.query : req;

    // auth not required (public view)
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    /**
     * Generate pageOptions
     */
    const cursor = args ? args[API.CURSOR] : null;
    let startTS, endTS, nextId, offset;
    if (cursor) {
      [startTS, nextId] = RedisUtil.DecodeCursor(cursor);
      offset = 0;
      if (Util.IsNull(startTS) || Util.IsNull(nextId)) {
        // invalid cursor, return empty feed
        REST.RespondOK(res, XPostFeed.Create(`cfd_${Date.now()}`, []));
      }
    } else {
      startTS = args ? Util.toNumber(args[API.START_TS], Date.now()) : Date.now();
      endTS = args ? Util.toNumber(args[API.END_TS]) : null;

      offset = args ? Util.toNumberWithRange(args[API.OFFSET], 0, null, 0) : 0;
    }
    const max = args ? Util.toNumberWithRange(args[API.BATCH_SIZE], 0, 20, 20) : 20;
    const sort = args ? args[API.SORT_BY] : null; // not used (sort by time)
    const pageOptions = {
      startTS,
      endTS,
      max,
      offset,
      nextId,
      sort,
    };

    let inclOptions = args[API.PARAM_INCL];
    if (inclOptions == null) { inclOptions = `${API.INCL_COMMENTS}|${API.INCL_STATS}|${API.INCL_USERINFO}`; }
    const ecode = null;
    try {
      const xCommentFeed = await PostService.GetCommentReplies(apiContext, commentId, pageOptions, inclOptions);
      REST.RespondOK(res, xCommentFeed);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_comment_comments

  // ---------------------------- SEARCH --------------------------------------

  /**
   * Suggest true hashtags, mentions and any indexed keywords from a
   * phrase.
   *
   * API: /s/posts/srch/choices
   *
   * @param {*} req
   * @param {*} res
   */
  static async suggest_choices(req, res) {
    const _api = 'suggestChoices';
    const _m = `${_CLSNAME}.${_api}`;
    const params = REST.GetParams(req);
    let max = params.max;
    let offset = params.offset;
    let cursor = params.cursor;
    const phrase = req.body.phrase || req.query.phrase;
    const fields = req.body.fields || req.query.fields;
    const expanded = req.body.expanded || req.query.expanded;
    const sort = req.body.sort || req.query.sort;
    const inclOptions = req.body.incl || req.query.incl;

    // auth not required (public view)
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    /**
     * TODO: to be removed, added so api is backward compatible to versions prior to 2.5.1
     */
    if (xRequest && xRequest.req && (xRequest.req.url).includes('/m/')) {
      // request from mobile
      API.AddOption(inclOptions, 'mobile');
    }
    // Above to be removed

    // rate limit based on IP
    const userId = apiContext.getAuthenticatedUserId();
    const rateLimit = await SystemService.GetGlobalParameters([GlobalParameter.SRCH_SGGST_CNT_BYIP]);
    const meterApiKey = RedisUtil.DeriveRateLimitKey(_api, userId || xRequest.getIPAddress());
    const [overLimit, remain] = await BaseController.RateLimitCheck(meterApiKey, rateLimit[GlobalParameter.SRCH_SGGST_CNT_BYIP] || 100, PER_MIN);
    if (overLimit) { return REST.Respond429(res); }

    // temporary - remove at some point
    // if (!max) { max = 50; }
    // if (!min) { min = 5; }
    const cfg = SystemConfig.GetInstance();
    const elasticsearchEnabled = Util.toBoolean(cfg.getElasticsearchEnabled());
    try {
      max = Util.toNumberWithRange(max, 0, 20, 10);
      offset = Util.toNumberWithRange(offset, 0, null, 0);
      cursor = cursor ? Buffer.from(cursor, 'base64').toString('utf8') : null;
      const pageOptions = {
        max,
        offset,
        cursor,
      };
      let result;
      if (elasticsearchEnabled) {
        result = await PostService.SuggestChoicesFromElasticsearch(apiContext, phrase, pageOptions, inclOptions);
      } else {
        result = await PostService.SuggestChoicesFromPhrase(apiContext, phrase, max, offset, sort, inclOptions);
      }
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // suggest_choices

  /**
   * ENDPOINT: /u/posts/search
   *
   * Fetch Posts by a string phrase.
   * Returns {XResultList} containing posts with limited properties
   *
   * @param {*} req
   * @param {*} res with object type {XResultList}
   */
  static async get_feed_by_phrase(req, res) {
    const _api = 'get_feed_by_phrase';
    const params = REST.GetParams(req);
    const phrase = params.q;
    const fields = params.fields;
    const cursor = params.cursor;
    const lang = Util.NormalizeLanguage(params.lang);
    let offset = params.offset;
    let max = params.max;
    const inclOptions = req.body.incl || req.query.incl || params.incl;
    const sort = params.sort;
    const _m = `${_CLSNAME}.${_api}(${phrase})`;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    // rate limit based on IP
    const userId = apiContext.getAuthenticatedUserId();
    const rateLimit = await SystemService.GetGlobalParameters([GlobalParameter.SRCH_RSLT_CNT_BYIP]);
    const meterApiKey = RedisUtil.DeriveRateLimitKey(_api, userId || xRequest.getIPAddress());
    const [overLimit, remain] = await BaseController.RateLimitCheck(meterApiKey, rateLimit[GlobalParameter.SRCH_RSLT_CNT_BYIP] || 100, PER_MIN);
    if (overLimit) { return REST.Respond429(res); }

    const cfg = SystemConfig.GetInstance();
    const elasticsearchEnabled = Util.toBoolean(cfg.getElasticsearchEnabled());
    try {
      max = Util.toNumberWithRange(max, 0, 20, 10);
      offset = Util.toNumberWithRange(offset, 0, null, 0);
      // cursor = cursor ? Buffer.from(cursor, 'base64').toString('utf8') : null;

      // if (!offset || offset === 0) {
      //   cursor = cursor || JSON.stringify({
      //     count: max,
      //     start: 0,
      //     // phrase,
      //   });
      // }

      const pageOptions = {
        max,
        offset,
        cursor,
        sort,
        // lang: Util.NormalizeLanguage(lang)
      };

      if (API.HasOption(inclOptions, API.INCL_VIS) && !LanguageCodes.CHINESE_ALL.includes(lang)) {
        pageOptions.lang = 'non-zh';
      }

      let result;
      if (elasticsearchEnabled) {
        const query = xRequest.getHeaders();
        result = await PostService.FetchPostsFromTextSearch(apiContext, phrase, pageOptions, inclOptions, query);
        // if (!result || result.data.list.length === 0) {
        //   result = await PostService.FetchPostsFromQuery(apiContext, phrase, sort, max, offset);
        // }
      } else {
        result = await PostService.FetchPostsFromQuery(apiContext, phrase, sort, max, offset);
      }

      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // GetFeedByHashtag

  /**
   * ENDPOINT: /u/users/search
   *
   * Fetch Posts by a string phrase.
   * Returns {XResultList} containing posts with limited properties
   *
   * @param {*} req
   * @param {*} res with object type {XResultList}
   */
  static async get_users_by_phrase(req, res) {
    const _api = 'get_users_by_phrase';
    const params = REST.GetParams(req);
    const phrase = params.q;
    const fields = params.fields;
    let offset = params.offset;
    let max = params.max;
    let cursor = params.cursor;
    const inclOptions = req.body.incl || req.query.incl || params.incl;
    const _m = `${_CLSNAME}.${_api}(${phrase})`;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    // rate limit based on IP
    const rateLimit = await SystemService.GetGlobalParameters([GlobalParameter.SRCH_RSLT_CNT_BYIP]);
    const meterApiKey = RedisUtil.DeriveRateLimitKey(_api, xRequest.getIPAddress());
    const [overLimit, remain] = await BaseController.RateLimitCheck(meterApiKey, rateLimit[GlobalParameter.SRCH_RSLT_CNT_BYIP] || 100, PER_MIN);
    if (overLimit) { return REST.Respond429(res); }

    const sort = null;
    const cfg = SystemConfig.GetInstance();
    const elasticsearchEnabled = Util.toBoolean(cfg.getElasticsearchEnabled());
    try {
      max = Util.toNumberWithRange(max, 0, 20, 10);
      offset = Util.toNumberWithRange(offset, 0, null, 0);
      cursor = cursor ? Buffer.from(cursor, 'base64').toString('utf8') : null;
      const pageOptions = {
        max,
        offset,
        cursor,
      };
      let result;
      if (elasticsearchEnabled) {
        result = await PostService.FetchUsersFromTextSearch(apiContext, phrase, pageOptions, inclOptions);
        // if (!result || result.data.list.length === 0) {
        //   result = await PostService.FetchPostsFromQuery(apiContext, phrase, sort, max, startOffset);
        // }
      } else {
        throw EC.SYS_ERROR('cannot connect to elastic search');
      }

      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // GetFeedByHashtag


  /**
   * ENDPOINT: /u/posts/trends
   *
   * Fetch Posts by a string phrase.
   * Returns {XResultList} containing posts with limited properties
   *
   * @param {*} req
   * @param {*} res with object type {XResultList}
   */
  static async get_feed_by_trends(req, res) {
    const _api = 'get_feed_by_trends';
    const params = REST.GetParams(req);
    const topics = params[API.FILTER_TOPICS];
    const languagePref = params[API.FILTER_LANGUAGE_PREF];
    const startTS = params ? Util.toNumber(params[API.START_TS], Date.now()) : Date.now();
    const inclOptions = params[API.PARAM_INCL];
    const fields = params.fields;
    let startOffset = params.offset || 0;
    let max = params.max || 20;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    const _m = `${_CLSNAME}.${_api}(${languagePref})`;

    const sort = null;
    try {
      max = Math.min(max, 100);
      max = Math.max(max, 0);
      startOffset = Math.max(startOffset, 0);
      const result = await PostService.FetchPostsByTrend(apiContext, languagePref, topics, sort, max, startOffset, startTS, inclOptions);

      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_feed_by_trends

  static async get_live_now_feed(req, res) {
    const _api = 'get_live_now_feed';
    const params = REST.GetParams(req);
    const topics = params[API.FILTER_TOPICS];
    const languagePref = params[API.FILTER_LANGUAGE_PREF];
    const inclOptions = params[API.PARAM_INCL];
    const moderate = Util.toBoolean(params.moderate);
    const _m = `${_CLSNAME}.${_api}(${languagePref})`;
    const cursor = params.cursor;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    let startTS, endTS, nextId, offset;
    if (cursor) {
      [startTS, nextId] = RedisUtil.DecodeCursor(cursor);
      offset = 0;
      if (Util.IsNull(startTS) || Util.IsNull(nextId)) {
        // invalid cursor, return empty feed
        return REST.RespondOK(res, XPostFeed.Create(`cfd_${Date.now()}`, []));
      }
    } else {
      startTS = params ? Util.toNumber(params[API.START_TS], Date.now()) : Date.now();
      endTS = params ? Util.toNumber(params[API.END_TS]) : null;

      offset = params ? Util.toNumberWithRange(params[API.OFFSET], 0, null, 0) : 0;
    }
    const max = params ? Util.toNumberWithRange(params[API.BATCH_SIZE], 0, 40, 20) : 20;
    const sort = params ? params[API.SORT_BY] : null; // not used (sort by time)
    const pageOptions = {
      startTS,
      endTS,
      max,
      offset,
      nextId,
      sort,
      forceReRanking: false,
    };

    try {
      // Check moderate mode
      const userInfo = apiContext.getUserInfo();
      const canModerate =
        XUserInfo.HasRole(userInfo, UserProps.ROLE_LIVEMOD) ||
        XUserInfo.HasRole(userInfo, UserProps.ROLE_LIVEADM) ||
        XUserInfo.HasRole(userInfo, UserProps.ROLE_ADMIN);

      if (moderate && !canModerate) {
        throw EC.USER_NOT_ALLOWED('Not authorized.');
      }

      let scopeLiveUsers;
      let blacklistLiveUsers;
      let mode;
      if (moderate && canModerate) {
        scopeLiveUsers = [];
        mode = MODERATOR_MODE;
      } else {
        scopeLiveUsers = await SystemService.GetSetParameters(PUBLIC_LIVE_USERS);
        blacklistLiveUsers = await SystemService.GetSetParameters(BLACKLIST_LIVE_USERS);
      }

      const result = await PostService.FetchLiveNowFeed(apiContext, languagePref, pageOptions, inclOptions, scopeLiveUsers, blacklistLiveUsers, mode);

      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // GetFeedByHashtag

  static async get_live_now_feed2(req, res) {
    const _api = 'get_live_now_feed2';
    const params = REST.GetParams(req);
    const topics = params[API.FILTER_TOPICS];
    const languagePref = params[API.FILTER_LANGUAGE_PREF];
    const inclOptions = params[API.PARAM_INCL];
    const moderate = Util.toBoolean(params.moderate);
    const _m = `${_CLSNAME}.${_api}(${languagePref})`;
    const cursor = params.cursor;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    let startTS, endTS, nextId, offset;
    if (cursor) {
      [startTS, nextId] = RedisUtil.DecodeCursor(cursor);
      offset = 0;
      if (Util.IsNull(startTS) || Util.IsNull(nextId)) {
        // invalid cursor, return empty feed
        return REST.RespondOK(res, XPostFeed.Create(`cfd_${Date.now()}`, []));
      }
    } else {
      startTS = params ? Util.toNumber(params[API.START_TS], Date.now()) : Date.now();
      endTS = params ? Util.toNumber(params[API.END_TS]) : null;

      offset = params ? Util.toNumberWithRange(params[API.OFFSET], 0, null, 0) : 0;
    }
    const max = params ? Util.toNumberWithRange(params[API.BATCH_SIZE], 0, 40, 20) : 20;
    const sort = params ? params[API.SORT_BY] : null; // not used (sort by time)
    const pageOptions = {
      startTS,
      endTS,
      max,
      offset,
      nextId,
      sort,
      forceReRanking: true,
    };

    try {
      // Check moderate mode
      const userInfo = apiContext.getUserInfo();
      const canModerate =
        XUserInfo.HasRole(userInfo, UserProps.ROLE_LIVEMOD) ||
        XUserInfo.HasRole(userInfo, UserProps.ROLE_LIVEADM) ||
        XUserInfo.HasRole(userInfo, UserProps.ROLE_ADMIN);

      if (moderate && !canModerate) {
        throw EC.USER_NOT_ALLOWED('Not authorized.');
      }

      let scopeLiveUsers;
      let blacklistLiveUsers;
      let mode;
      if (moderate && canModerate) {
        scopeLiveUsers = [];
        mode = MODERATOR_MODE;
      } else {
        scopeLiveUsers = await SystemService.GetSetParameters(PUBLIC_LIVE_USERS);
        blacklistLiveUsers = await SystemService.GetSetParameters(BLACKLIST_LIVE_USERS);
      }

      const result = await PostService.FetchLiveNowFeed(apiContext, languagePref, pageOptions, inclOptions, scopeLiveUsers, blacklistLiveUsers, mode);

      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  }

  static async get_live_now_categories(req, res) {
    const _api = 'get_live_now_categories';
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) {
      return;
    }

    const result = {
      highlights: {
        id: 'highlights',
        name: 'Highlights'
      // },
      // news: {
      //   id: 'news',
      //   name: 'News'
      // },
      // interview: {
      //   id: 'interview',
      //   name: 'Interview'
      // },
      // politics: {
      //   id: 'politics',
      //   name: 'Politics'
      // },
      // economics: {
      //   id: 'economics',
      //   name: 'Economics'
      // },
      // education: {
      //   id: 'education',
      //   name: 'Education'
      // },
      // health: {
      //   id: 'health',
      //   name: 'Health'
      }
    };

    REST.RespondOK(res, result);
  }

  /**
   * ENDPOINT: /vid_recomm
   *
   * Fetch recommended videos for a user.
   * Returns {XResultList} containing posts with limited properties
   *
   * @param {*} req
   * @param {*} res with object type {XResultList}
   */
  static async recommend_posts(req, res) {
    const _api = 'recommend_posts';
    const params = REST.GetParams(req);
    const phrase = params.q;
    const fields = params.fields;
    let offset = params.offset;
    let max = params.max;
    let cursor = params.cursor;
    const inclOptions = req.body.incl || req.query.incl || params.incl;
    const _m = `${_CLSNAME}.${_api}(${phrase})`;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, true);
    if (!pass) { return; }

    // rate limit based on username
    const authenticatedUserId = apiContext.getAuthenticatedUserId();
    const rateLimitKey = authenticatedUserId ? GlobalParameter.RECOMM_POSTS_BYUSER : GlobalParameter.RECOMM_POSTS_BYIP;
    const rateLimit = await SystemService.GetGlobalParameters([rateLimitKey]);
    const meterApiKey = RedisUtil.DeriveRateLimitKey(_api, authenticatedUserId || xRequest.getIPAddress());
    const [overLimit, remain] = await BaseController.RateLimitCheck(meterApiKey, rateLimit[rateLimitKey] || 100, PER_MIN);
    if (overLimit) { return REST.Respond429(res); }

    const cfg = SystemConfig.GetInstance();
    const elasticsearchEnabled = Util.toBoolean(cfg.getElasticsearchEnabled());
    try {
      max = Util.toNumberWithRange(max, 0, 20, 10);
      offset = Util.toNumberWithRange(offset, 0, null, 0);
      cursor = cursor ? Buffer.from(cursor, 'base64').toString('utf8') : null;
      const pageOptions = {
        max,
        offset,
        cursor,
      };
      let result;
      if (elasticsearchEnabled) {
        result = await PostService.FetchPostsByRecommandation(apiContext, pageOptions, inclOptions);
      } else {
        throw EC.SYS_ERROR('ES unavailable');
      }

      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // GetFeedByHashtag


  /**
   * Text search Posts with given text query string.
   * To support 18n, encode uri is required.
   *
   * @param {*} req
   * @param {*} res
   * @deprecated
   */
  static async text_search(req, res) {
    const _api = 'text_search';
    const params = REST.GetParams(req);
    const phrase = params.q;
    let startOffset = params.offset;
    let max = params.max;
    const _m = `${_CLSNAME}.${_api}(${(phrase)})`;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    [max, startOffset] = BaseController.SanitizeInput(max, startOffset);

    try {
      const result = await ElasticsearchService.SearchText(apiContext, phrase, max, startOffset);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // text_search

  static async es_version(req, res) {
    const _api = 'es_version';
    const _m = `${_CLSNAME}.${_api}`;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const result = await ElasticsearchService.ESVersion();
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // es_version

  /**
   * Return thumbnail size HTML for posts, which
   * is good for embedding or digitization
   *
   * NOT USED: until doing SSR-based SEO or preview gen
   *
   * @param {*} req
   * @param {*} res
   */
  static async get_embedded_post(req, res) {
    const _api = 'get_embedded_post';
    const args = (req.query) ? req.query : req;
    const postId = req.params['id'];
    let theme = req.params['theme'];
    if (theme == null) { theme = args['theme']; }  // if it's from URL query
    const _m = `${_CLSNAME}.${_api}(${postId},${theme})`;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const html = await PostService.RenderPostThumbnail(postId, theme, args);
      REST.ReturnHTML(res, html);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_embedded_post

  /**
   * Stream back thumbnail size IMAGE for post, generate
   * one if doesn't exist or force to re-generate.
   *
   * @param {*} req
   * @param {*} res
   */
  static async get_thumbnail_post(req, res) {
    const _api = 'get_thumbnail_post';
    const args = (req.query) ? req.query : null;
    const postId = req.params['id'];

    const _m = `get_thumbnail_post(${postId})`;
    const regen = Util.toBoolean(args['regen'], false);

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const error = await PostService.RetrievePostThumbnail(apiContext, postId, res, regen, args);
      if (error) {
        if (EC.Is(error, RES_NOTFOUND) || EC.Is(error, RES_ERROR)) { REST.Respond404(res); } else { REST.RespondError(res, error); }
      }
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_thumbnail_post

  /**
   * Stream back thumbnail size IMAGE for post, generate
   * one if doesn't exist or force to re-generate.
   *
   * @param {*} req
   * @param {*} res
   */
  static async get_post_image(req, res) {
    const _api = 'get_post_image';
    const args = (req.query) ? req.query : null;
    const postId = req.params['postId'];
    const filename = req.params['filename'];

    const _m = `${_CLSNAME}.${_api}(${postId},${filename})`;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const result = await PostService.RetrievePostImage(apiContext, postId, filename, res);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_post_image

  /**
   * Stream back thumbnail size IMAGE for post, generate
   * one if doesn't exist or force to re-generate.
   *
   * @param {*} req
   * @param {*} res
   */
  static async get_comment_image(req, res) {
    const _api = 'get_comment_image';
    const args = (req.query) ? req.query : null;
    const commentId = req.params['commentId'];
    const filename = req.params['filename'];

    const _m = `${_CLSNAME}.${_api}(${commentId},${filename})`;

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const result = await PostService.RetrieveCommentImage(apiContext, commentId, filename, res);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_comment_image


  static async get_live_stream_url(req, res) {
    const _api = 'get_live_stream_url';
    const _m = `${_CLSNAME}.${_api}`;

    const params = REST.GetParams(req);

    const videoId = req.params['videoId'];

    // auth not required - public
    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api, false);
    if (!pass) { return; }

    try {
      const result = await PostService.GetLiveStreamUrl(apiContext, videoId);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // get_live_stream_url

  static async translate_post(req, res) {
    const _api = 'translate_post';
    const _m = `${_api}(${postId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    // todo: add rate limit by userId

    const postId = req.params['postId'];
    const targetLang = req.params['targetLang'];

    try {
      const result = await PostService.TranslatePost(apiContext, postId, targetLang);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // translate_post

  static async report_reasons(req, res) {
    const _api = 'report_reasons';
    const _m = `${_api}(${postId})`;

    const [pass, xRequest, apiContext] = await BaseController.GateCheck(req, res, _api);
    if (!pass) { return; }

    const postId = req.params['postId'];
    const targetLang = req.params['targetLang'];

    try {
      const reasons = await ModerationReasonHelper.GetModerationReasons();

      const result = {};
      _.forEach(reasons, (value, key) => {
        if (_.isObject(value)) {
          _.forEach(value, (v, k) => {
            if (Util.toBoolean(v[XMModerationReasons.PROP_MOD_ONLY])) {
              delete value[k];
            }
          });
          if (!Util.ObjectIsEmpty(value)) {
            result[key] = value;
          }
        }
      });
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      REST.RespondError(res, err);
    }
  } // report_reasons

}

export default PostController;

