import _, { forEach, isEmpty } from 'lodash';
import http from 'http';
import axios from 'axios';
import EC from '../../core/ErrorCodes';
import API from '../../core/API';
import AppService from '../AppService';
import ModelType, {
  MessageProps,
  ModelFolder,
  PREFIX_COMMENT_ID,
  PREFIX_POST_ID,
  StatsProps,
  UserProps,
  XMObjectProps,
  XObjectProps,
} from '../../core/model/ModelConsts';
import ObjectHelper from '../core/ObjectHelper';
import PostStatHelper from './PostStatHelper';
import PostService from './PostService';
import Util from '../../core/Util';
import UserService from '../user/UserService';
import XError from '../../core/model/XError';
import XMPost from '../../core/model/post/XMPost';
import XPostList from '../../core/model/post/XPostList';
import CommentHelper from './CommentHelper';
import XMSocialIndexable from '../../core/model/social/XMSocialIndexable';
import StorageManager from '../core/StorageManager';
import UserInfoHelper from '../user/UserInfoHelper';
import XPostStats from '../../core/model/post/XPostStats';
import RedisUtil, {
  EXPIRE_TIME_FOR_DEL,
  EXPIRE_TIME_FOR_LIKE,
  EXPIRE_TIME_FOR_SHARE,
  EXPIRE_TIME_FOR_IMPORT, EXPIRE_TIME_FOR_OBJECT
} from '../core/store/RedisUtil';
import UserHelper from '../user/UserHelper';
import SystemConfig from '../../server/SystemConfig';
import XPostInfo from '../../core/model/post/XPostInfo';
import PostInfoHelper from './PostInfoHelper';
import PostPropValidateHelper from './PostPropValidateHelper';
import APIContext from '../../server/model/APIContext';
import { httpAgents } from '../textsearch/ElasticsearchHelper';
import LikesHelper from '../social/LikesHelper';
import SharesHelper from '../social/SharesHelper';
import CommentStatHelper from './CommentStatHelper';
import gettrLogger from '../../core/GettrLogger';
import PollClient from '../poll/PollClient';


const _CLSNAME = 'PostHelper';
const logger = gettrLogger(_CLSNAME);

/**
 * Helper class for everything related to Post
 * object.
 *
 */
export default class PostHelper extends ObjectHelper {

  /**
   * Return post with the given ID. Will check
   * cache before loading from storage.
   *
   * @param {string} postId
   * @return {XMPost}
   */
  static async GetPostById(postId) {
    // TODO: Temporary solution to take out ovid
    // return ObjectHelper.GetObjectById(postId, ModelType.POST);
    const data = ObjectHelper.GetObjectById(postId, ModelType.POST);
    const ovid = XMSocialIndexable.GetObjectField(data, XMSocialIndexable.PROP_ORIG_VIDEO_URL);
    if (!Util.StringIsEmpty(ovid)) {
      XMSocialIndexable.SetObjectField(data, XMSocialIndexable.PROP_ORIG_VIDEO_URL, '');
    }
    return data;
  }

  /**
   * Return posts with the given IDs. Will check
   * cache before loading from storage. No piggback
   * preloading!
   *
   * @param {string} postIds
   * @return {XMPost[]}
   */
  static async GetPostsByIds(postIds, selector = null, inclDeleted = false) {
    return ObjectHelper.GetObjectsByIds(postIds, ModelType.POST, selector, inclDeleted);
  }


  /**
   * Check if the given identifier is a valid post or comment Id.  It is
   * valid if it is prefixed with 'p' (PREFIX_POST_ID) or 'c' (PREFIX_COMMENT_ID)
   * @param {string} id
   * @return {boolean} true if prefix is a 'p' or a 'c'
   */
  static ValidPostOrCommentIdCheck(id) {
    return (id && (id.startsWith(PREFIX_POST_ID) || (id.startsWith(PREFIX_COMMENT_ID))));
  }


  /**
   * Cache a post object and any other indices
   * to support fast fetch / search
   *
   * @param {XMPost} postObj
   */
  static async CachePost(postObj) {
    return ObjectHelper.CacheObject(postObj, ModelType.POST);
  }

  /**
   *
   * @param {string} postId
   * @returns
   */
  static async RemoveCachedPost(postId) {
    return ObjectHelper.RemoveCachedObject(postId, ModelType.POST, ModelFolder.POST);
  }

  static async SetDeleteCachedPost(postId) {
    return new Promise((resolve, reject) => {
      PostInfoHelper.ClearPostInfo_Cache(postId)
        .then((clearResult) => {
          ObjectHelper.SetDeleteObject(postId, ModelType.POST, ModelFolder.POST)
            .then(deleteResult => resolve(true))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static RollbackRemoveCachedPost(postId) {
    return ObjectHelper.RollbackRemoveCachedObject(postId, ModelType.POST, ModelFolder.POST);
  }

  /**
   * Return whether a post with given post ID exists
   *
   * @param {string} postId
   * @return {boolean} true if exists
   */
  static async PostExists(postId) {
    const _m = 'PostExists';
    let verdict = false;
    try {
      // const obj = await PostHelper.GetPostById(postId);
      const postInfo = await PostInfoHelper.GetPostInfo(postId);
      if (postInfo != null) {
        verdict = true;
      }
    } catch (err) {
      logger.error('error', { err, _m });
    }
    return verdict;
  }

  /**
   * Retrieve post object. It will check and load from cache first.
   * If it doesn exist (either expired or never loaded before), it
   * will go to storage to retrieve and update cache.
   *
   * NOTE: If the ID has comment prefix, the service will redirect
   * to ~LoadComment
   *
   * @param {string} postId for a post or ID of a comment
   * @param {string} inclOptions additional requests: API.INCL_STATS|API.INCL_USERINFO
   * @param {boolean} wrap if false, then the object is SERIALIZED.
   * This is necessary to prevent loss of the AUX_DATA
   * @return {XMPost} or XMComment
   */
  static async LoadPost(postId, inclOptions, wrap = true, parentLevel = 1, apiContext) {
    const _m = 'LoadPost';

    // This happens when user repost a comment, which can be straight share
    // or embedded in a post
    if (postId.startsWith(PREFIX_COMMENT_ID)) {
      if (API.HasOption(inclOptions, API.INCL_POSTSTATS) && !API.HasOption(inclOptions, API.INCL_COMMENTSTATS)) {
        inclOptions += `|${API.INCL_COMMENTSTATS}`;
      }
      return CommentHelper.LoadComment(postId, inclOptions, wrap, parentLevel, apiContext);
    }

    /** @type {XMPost} postObj */
    const xPostInfo = await PostInfoHelper.GetPostInfo(postId);

    // create xPost from postInfo because XMPost type is needed for backward compatibility
    let xPost = XMPost.CreateFromPostInfo(xPostInfo);
    let loadError = false;
    if (xPost === null) {
      logger.error('YOW! null post!!!', { _m });
      xPost = XMPost.CreatePostNotFound(postId);
      loadError = true;
    }

    if (!loadError && inclOptions && !XMPost.IsNotFound(xPost) && !XMPost.IsDeleted(xPost)) {

      // create postStats from postInfo because XMPostStat type is needed for backward compatibility
      const postStats = XPostStats.CreateFromPostInfo(xPostInfo);
      const piggyBack = {
        [API.INCL_POSTSTATS]: postStats ? XPostStats.Unwrap(postStats) : null,
      };
      await PostHelper.PreloadPost(apiContext, xPost, inclOptions, piggyBack);
    }

    return wrap ? xPost : xPost.serialize();
  } // LoadPost


  /**
   * Given a post object, this utility offers
   * to preload any other data as requested
   * through the API.PARAM_INCL
   *
   * NOTE: Since repost of comment without added content is
   * essentially sharing a comment, loading of the post objects
   * will
   *
   * @param {XMPost} xPost post object to preload aux data
   * @param {string} inclOptions INCL_POSTSTATS|INCL_USERINFO
   * @return {{}} a map of results that is also set in feed object
   */
  static async PreloadPost(apiContext, xPost, inclOptions, piggyBack = {}) {
    if (xPost == null) { throw EC.SYS_BAD_ARGS('Null Post'); }
    const postId = xPost.getId();
    const _m = 'PreloadPost';

    const inclPostStats = API.HasOptions(inclOptions, API.INCL_POSTSTATS, API.INCL_STATS);
    const inclUserInfo = API.HasOption(inclOptions, API.INCL_USERINFO);
    const inclLiked = API.HasOption(inclOptions, API.INCL_LIKED);
    const inclShared = API.HasOption(inclOptions, API.INCL_SHARED);
    const inclPoll = API.HasOption(inclOptions, API.INCL_POLL_VOTES);

    // Side jobs - dispatch them to run "concurrently"
    // Preloads embedded post (or shared post or original post)
    let postResults;
    const repstIds = xPost.getRepostedIds();
    if (repstIds && repstIds.length > 0) {
      const repstId = repstIds[0];
      if (repstId) {
        postResults = await PostInfoHelper.GetPostInfo(repstId);
      }

      // Sep 4 - Replace post caches with postInfo
      //
      // const isPost = repstId.startsWith(PREFIX_POST_ID);
      // const isComment = repstId.startsWith(PREFIX_COMMENT_ID);
      // if (isPost) {
      //   postResults = await PostHelper.GetPostById(repstId);
      // } else if (isComment) {
      //   postResults = await CommentHelper.GetCommentById(repstId);
      // }
    }

    let statResults;
    if (inclPostStats === true) {
      statResults = piggyBack[API.INCL_POSTSTATS];
      if (!statResults) {
        const postInfo = await PostInfoHelper.GetPostInfo(postId);
        statResults = XPostStats.Unwrap(XPostStats.CreateFromPostInfo(postInfo));
      }
    }

    let userResults;
    if (inclUserInfo === true) {
      let userIds = [];
      const posterId = xPost.getOwnerId();
      const usertags = xPost.getUsertags();
      const repstOwnerIds = xPost.getRepostedOwnerIds();
      const sharedPostOwnerIds = xPost.getRepostedOwnerIds();

      if (posterId) {
        userIds.push(posterId);
      }
      if (usertags) {
        userIds = userIds.concat(usertags);
      }
      if (repstOwnerIds) {
        userIds = userIds.concat(repstOwnerIds);
      }
      if (sharedPostOwnerIds) {
        userIds = userIds.concat(sharedPostOwnerIds);
      }
      if (userIds.length > 0) {
        userIds = Util.UniqueArray(userIds);
        userResults = await UserService.LoadUserInfos(userIds, true, false);
      }
    }

    const requestorId = apiContext ? apiContext.getAuthenticatedUserId() : null;
    const reachable = !XMSocialIndexable.IsDeleted(xPost) && !XMSocialIndexable.IsNotFound(xPost);

    let liked;
    if (inclLiked && requestorId && reachable) {
      const verdict = await LikesHelper.HasLikesPost(requestorId, postId);
      liked = verdict ? [postId] : [];
    }

    let shared;
    if (inclShared && requestorId && reachable) {
      const verdict = await SharesHelper.HasSharesPost(requestorId, postId);
      shared = verdict ? [postId] : [];
    }

    let votes = [];
    if (inclPoll && requestorId && reachable) {
      const [pollClient, error] = PollClient.CreatInstance(xPost);
      if (error) {
        logger.warn('Getting poll from a non-poll type post.', {
          postId, _m });
      }
      votes = pollClient ? await pollClient.getVotes(requestorId) : [];
    }

    // Not the ideal wait for all promises, but since we can't return
    // until we get all 2, might as well do it like this...
    let auxData;
    try {
      auxData = {
        [ModelType.SHARED_POST]: (postResults ? XPostInfo.Unwrap(postResults) : null),
        [ModelType.POST_STATS]: (statResults || null),
        [ModelType.USER_INFO]: (userResults || null),
        [ModelType.LIKES]: liked || [],
        [ModelType.SHARES]: shared || [],
        [API.INCL_POLL_VOTES]: votes || [],
      };
    } catch (auxErr) {
      logger.error('error', { err: auxErr, _m });
    }

    // Filling empty stats - for posts that are shared and don't
    // have stats themselves, we can fill them (for frontend)
    if (auxData) {
      PostStatHelper.FillEmptyStats(auxData[ModelType.POST_STATS], { [postId]: xPost });
    }

    // WARNING: will assign over existing aux data. Ideally should just
    // copy over
    xPost.setAuxData(auxData);

    return auxData;
  } // PreloadPost

  /**
   * Part II processing from PostService.SubmitPost()
   * as well as SubmitRepost()
   *
   * Saving given post object to storage. This verson is
   * will do post processing like notification and
   * activity log
   *
   * @param {APIContext} apiContext
   * @param {XMPost} postObj
   * @callback
   * @return {XMPost} saved object (?)
   *
   * @see PostService.SubmitPost
   */
  static async SavePost(apiContext, postObj, callback) {
    let requestorId = apiContext.getUsername();
    const entryAPI = apiContext.getAPIName();
    if (entryAPI === 'import_post' || entryAPI === 'u_import_repost') {
      requestorId = postObj ? postObj.getOwnerId() : requestorId;
    }

    let postId = postObj.getId();
    const _m = 'SavePost';

    let hashtags = null;
    let usertags = null;
    try {
      // Derive post ID if doesn't exist
      if (postId == null) {
        postId = await PostService.GetUniquePostId(null);
        postObj._setId(postId);
      }

      // Start 2 "jobs" in parallel and no wait for both of them to complete
      const stats = (StatsProps.REFRESHABLE_STATS)[ModelFolder.POST_STATS];
      const props = {};
      stats.forEach((s) => {
        props[s] = 0;
      });
      const initPostStats = XPostStats.CreateNew(postId, props);
      const postInfo = XPostInfo.CreateNew(postId);
      PostInfoHelper.FillFromPostableAndStats(postInfo, postObj, props);
      await Promise.all([
        // (async () => PostHelper.CachePost(postObj))(),
        (async () => PostInfoHelper.SetPostInfo_Cache(postInfo))(),
        /**
         * Cache post likedby key and post sharedby key
         */
        (async () => {
          const cacheDB = StorageManager.GetInstance().getLikesPostCache();
          const LikedByKey = RedisUtil.DerivePostLikedByKey(postId);

          // Async fire-and-forget (warning: not robust)
          // await ObjectHelper.UpdateUniqueStrings_toCache(cacheDB, LikedByKey, [], true);
          await ObjectHelper.UpdateUniqueStrings_toCache_sorted(cacheDB, LikedByKey, [], EXPIRE_TIME_FOR_LIKE);
        })(),
        (async () => {
          const cacheDB = StorageManager.GetInstance().getSharesPostCache();
          const SharedByKey = RedisUtil.DerivePostSharedByKey(postId);

          // Async fire-and-forget (warning: not robust)
          await ObjectHelper.UpdateUniqueStrings_toCache_sorted(cacheDB, SharedByKey, [], EXPIRE_TIME_FOR_SHARE);
        })(),
        /**
         * Mar 14 ddm - async save post obj
         */
        // (async () => AppService.SaveObject(postObj))(),
        // PostStatHelper.SetPostStats(postId, initPostStats, true)
      ]);

      if (!Util.StringIsEmpty(postObj.getImportPostId())) {
        (async () => {
          try {
            await PostHelper.cacheImportPostId(postObj.getImportPostId(), postObj.getPostId());
          } catch (err) {
            logger.error('error', { err, _m });
          }
        })();
      }

      try {
        hashtags = postObj.getHashtags(null);
        // TODO: Should only be adding HASH TAG for quick list in search box
        // HashtagMapService.UpdateEntry(hashtags, postObj);

        // TODO: Should only be adding USER TAG for quick list in search box
        usertags = postObj.getUsertags(null);
        // UsertagMapService.UpdateEntry(usertags, postObj);
      } catch (cacheError) {
        logger.error('error', { err: cacheError, _m });
      }
    } catch (cacheError) {
      if (callback) { callback(cacheError, null); } else { throw cacheError; }
    }

    /**
     * Mar 14 ddm - async save postobj
     * TODO: add to downstream, need to pass post obj somehow
     */
    /**
     * Apr 19 ddm - write to DB if kafka is not enabled
     * Otherwise pass the job to kafka consumer.
     */
    const sysConfig = SystemConfig.GetInstance();
    if (!sysConfig.getEnableKafka()) {
      (async () => {
        try {
          await AppService.SaveObject(postObj);
        } catch (saveErr) {
          logger.error('error', { err: saveErr, _m });
        }
      })();
    }

    return callback ? callback(null, postObj) : postObj;
  } // SavePost

  /**
   * Update a post object
   *
   * @param {APIContext} apiContext
   * @param {XMPost} postObj
   * @callback
   * @return {XMPost} saved object (?)
   */
  static async UpdatePost(apiContext, postObj, changes = {}, callback) {
    let requestorId = apiContext.getAuthenticatedUserId();
    const entryAPI = apiContext.getAPIName();
    if (entryAPI === 'import_post' || entryAPI === 'u_import_repost') {
      requestorId = postObj ? postObj.getOwnerId() : requestorId;
    }

    const postId = postObj.getId();
    const _m = 'UpdatePost';

    try {
      if (postId === null) {
        throw EC.API_BAD_DATA('empty post id');
      }
      postObj.createSnapshot();

      let postData = postObj.getData();
      postData = {
        ...postData,
        ...changes,
      };
      postObj.setData(postData);

      // const postInfo = XPostInfo.CreateNew(postId);
      // PostInfoHelper.FillFromPostableAndStats(postInfo, postObj);
      const postInfo = PostInfoHelper.FillFromXMPost(null, postObj, false);

      // Update DB
      await AppService.UpdateObject(postObj);

      // Update cache
      await PostInfoHelper.ClearPostInfo_Cache(postId);
      await PostInfoHelper.SetPostInfo_Cache(postInfo);
    } catch (cacheError) {
      if (callback) { callback(cacheError, null); } else { throw cacheError; }
    }

    return callback ? callback(null, postObj) : postObj;
  } // SavePost

  /**
   * Update post with given moderation tags, first in cache then storage.
   *
   * @param {XMSocialIndexable} postableObj
   * @param {string} type model type
   * @param {string[]} modTags given moderation tags
   * @return {[boolean,boolean]} update success in cache, update success in database
   */
  static async UpdatePostableModerationTags(postableObj, type, modTags) {
    if (!postableObj) {
      throw EC.API_POST_NOTFOUND('post not found');
    }
    const postableId = postableObj.getId();
    const _m = 'UpdatePostableModerationTags';
    let updatePostCache;
    let updatePinfoCache;
    let updateDb;

    if (type !== ModelType.POST && type !== ModelType.COMMENT) {
      throw EC.API_BAD_PARAMS(`unsupported data type: ${type}`);
    }

    try {
      // first update Redis Cache
      // post version
      postableObj.setModerationTags(modTags);

      // update post cache for backward compatibility
      updatePostCache = await ObjectHelper.CacheObject(postableObj, type, EXPIRE_TIME_FOR_OBJECT);

      // post info version
      // const xPostInfoFromCache = await PostInfoHelper.GetPostInfo(postableId);
      // const postInfo = XPostInfo.Wrap(xPostInfoFromCache);
      // postInfo.setModerationTags(modTags);
      // updatePinfoCache = await PostInfoHelper.SetPostInfo_Cache(postInfo);
      updatePinfoCache = await PostInfoHelper.UpdatePostInfo_Cache(postableId, { [XMSocialIndexable.PROP_MODTAGS]: modTags }, { expiry: EXPIRE_TIME_FOR_OBJECT }); // for partial update

      // update db
      // const xmPostFromDB = await PostHelper.FindByIdFromDB(postableId);
      // const xmPost = XMPost.Wrap(xmPostFromDB);
      // xmPost.createSnapshot(); // for partial update
      // xmPost.set(XMSocialIndexable.PROP_MODTAGS, modTags);
      // updateDb = await AppService.UpdateObject(xmPost);
      const sm = StorageManager.GetInstance();
      const folder = sm.getFolderFromType(type);
      updateDb = await AppService.MultiUpdateFields(folder, [postableId], null, {
        [XMSocialIndexable.PROP_MODTAGS]: modTags
      });

    } catch (e) {
      logger.error('error', { err: e, _m });
      return false;
    }

    // return { updatePinfoCache, updatePostCache, updateDb };
    return true;
  } // UpdatePostableModerationTags

  /**
   * cache import post id to redis for reject duplicate import
   * @param {string} ipid import post Id
   * @param {string} postId getter post id
   */
  static async cacheImportPostId(ipid, postId) {
    if (Util.StringIsEmpty(ipid)) {
      return;
    }
    const cacheDB = StorageManager.GetInstance().getImportPostCache();
    const cacheKey = RedisUtil.DeriveImportPostIdKey(ipid);
    return new Promise((resolve, reject) => {
      cacheDB.set(cacheKey, postId, 'EX', EXPIRE_TIME_FOR_IMPORT)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Saving given post object to storage. This version is
   * for user and will not trigger notification and generate
   * activity log
   *
   * @param {XMPost} postObj
   * @callback
   * @return {XMPost} saved object (?)
   */
  static async SavePost_Internal(apiContext, postObj, callback) {
    const requestorId = apiContext.getUsername();

    let postId = postObj.getId();
    const _m = 'SavePost_Internal';
    const ownerId = postObj.getOwnerId();

    const publicPosting = postObj.isPublicVisible();
    let resultP = null;
    let ecode = null;
    const logs = null;
    const ts = null;
    let hashtags = null;
    let usertags = null;
    try {
      // AppService.CheckUserCanWRITE(requestorId, postObj);

      // Derive post ID if doesn't exist
      if (postId == null) {
        postId = await PostService.GetUniquePostId(null);
        postObj._setId(postId);
      }

      // First, we are going to request a unique ID.

      resultP = AppService.SaveObject(postObj);

      try {
        hashtags = postObj.getHashtags(null);
        // TODO: Should only be adding HASH TAG for quick list in search box
        // HashtagMapService.UpdateEntry(hashtags, postObj);

        // TODO: Should only be adding USER TAG for quick list in search box
        usertags = postObj.getUsertags(null);
        // UsertagMapService.UpdateEntry(usertags, postObj);
      } catch (cacheError) {
        logger.error('error', { err: cacheError, _m });
      }
    } catch (saveError) {
      ecode = XError.GetCode(saveError);
      if (callback) { callback(saveError, null); } else { throw saveError; }
    }

    try {
      // Kickoff update contribution stats
      if (publicPosting) {
        await UserInfoHelper.AddContribStat(requestorId, StatsProps.POSTED_POST, postId, (err, newCount) => {
          if (!err) { logger.info(`Contrib stat POST count is: ${newCount}`, { err, _m }); }
        });
      } else {
        // private post - need to log?
      }
    } catch (statError) {
      logger.error('error', { err: statError, _m });
    }

    return callback ? callback(null, postObj) : postObj;
  } // SavePost_Internal

  /**
   *
   * @deprecated - old code.
   *
   *
   * Fetch post based on query, not user.
   *
   * @deprecated Too early of implementation - no batch fetch, no cache proxying
   *
   * @param {object} query "uid" is posts owner Id.
   * @param {string} matchUserId explicitly match the user if specified
   * @param {*} selector
   * @param {*} params include props like API.ALL_VERSIONS=true
   * and API.INCL_STATS
   * @param {function} callback
   * @return {XPostList}
   */
  static ListPosts_FromDB(query, matchUserId, selector, params, callback) {
    // let userId = query["userId"];
    const incl_stats = params ? params[API.INCL_STATS] : false;
    const processResult = async (err, posts) => {
      if (err) { return callback(err, posts); }

      const containerId = XPostList.DeriveID(XPostList.GetTypeID(), null);
      const container = XPostList.CreateNew(containerId, null, null);

      // Check ACL
      const filteredList = [];
      let post;
      for (let i = 0; i < filteredList.length; i++) {
        post = posts[i];
        if (XMPost.IsPublicVisible(post) || (matchUserId == null)) {
          filteredList.push(post);
        } else if (XMPost.GetOwnerId(post) === matchUserId) {
          filteredList.push(post);
        } else {
          // do not include
        }
      } // excluding private posts
      container.setList(filteredList);

      if (incl_stats) {
        const postIds = container.getItemIds();
        const statMap = await PostStatHelper.GetMultiPostStats(postIds);
        const auxData = container.getAuxData(true);

        auxData[XMObjectProps.AUX_DATA_STATS] = statMap;
      }
      return callback(null, container);
    };
    AppService.listObjects(ModelFolder.POST, query, selector, params, processResult);
  }

  static async AssertPostUpdate(apiContext, values, scope = XMSocialIndexable.POST_CREATION_PROPS, frontModeration = true, allowEmpty = false) {
    const _m = 'AssertPostUpdate';
    const illegalInputs = [];
    const apiContextData = apiContext ? apiContext.data : {};
    const context = {
      [APIContext.USER_IP]: apiContextData[APIContext.USER_IP],
      [APIContext.USERINFO]: apiContextData[APIContext.USERINFO],
      [MessageProps.SVC_NAME]: apiContextData[MessageProps.SVC_NAME],
    };
    if (Util.ObjectIsEmpty(values)) {
      if (allowEmpty) {
        return [true, null];
      }
      return [false, EC.API_BAD_DATA('empty data')];
    }

    // Truncate Preview Text Data
    if (!Util.StringIsEmpty(values[XMSocialIndexable.PROP_TITLE])) {
      values[XMSocialIndexable.PROP_TITLE] = values[XMSocialIndexable.PROP_TITLE].substring(0, XMSocialIndexable.POST_PREVTTL_MAX_LENGTH);
    }
    if (!Util.StringIsEmpty(values[XMSocialIndexable.PROP_DESC])) {
      values[XMSocialIndexable.PROP_DESC] = values[XMSocialIndexable.PROP_DESC].substring(0, XMSocialIndexable.POST_PREVDSC_MAX_LENGTH);
    }

    forEach(values, (value, key) => {
      if (!scope.includes(key)) {
        illegalInputs.push(key);
        delete values[key];
      } else {
        const assertHandler = PostPropValidateHelper.GetAssertPostPropHandler(key);
        if (assertHandler) {
          if (value) {
            const verdict = assertHandler(value);
            if (!verdict) {
              if (XMSocialIndexable.PREVIEW_PROPS.includes(key)) {
                delete values[key];
              } else {
                throw EC.USER_BAD_INPUT(`invalid input: ${key}`);
              }
            }
          }
        } else {
          delete values[key];
        }
      }
    });

    // if p_type = gvision, must have vid
    if (values[XMSocialIndexable.PROP_POST_TYPE] === ModelType.VISION_POST) {
      if (Util.StringIsEmpty(values[XMSocialIndexable.PROP_VIDEO_URL])) {
        return [false, EC.POST_NO_VISION_CONTENT('no video content')];
      }
    }

    // check if content empty
    if (
      Util.StringIsEmpty(values[XMSocialIndexable.PROP_TEXT]) &&
        Util.ArrayIsEmpty(values[XMSocialIndexable.PROP_IMAGE_URLS]) &&
        Util.StringIsEmpty(values[XMSocialIndexable.PROP_ORIG_VIDEO_URL]) &&
        Util.StringIsEmpty(values[XMSocialIndexable.PROP_ORIG_VIDEO_URL]) &&
        Util.StringIsEmpty(values[XMSocialIndexable.PROP_MAIN_IMAGE_URL])
    ) {
      if (!allowEmpty) {
        return [false, EC.POST_EMPTY_CONTENT('empty post content')];
      }
    }

    // general size check
    if (JSON.stringify(values).length > XMSocialIndexable.POST_REQ_MAX_LENGTH) {
      return [false, EC.POST_CONTENT_EXCEEDING_LIMIT('content exceeding limit')];
    }

    // front-moderation
    const sysConfig = SystemConfig.GetInstance();
    const moderationFrontEnabled = sysConfig.getModerationFrontEnabled();
    if (!moderationFrontEnabled || !frontModeration) {
      return [true, null];
    }

    const reviewPostUrl = sysConfig.getModerationFrontHost() + sysConfig.getModerationFrontReviewPostUrl();
    if (!httpAgents[reviewPostUrl]) {
      httpAgents[reviewPostUrl] = new http.Agent({
        keepAlive: true,
        maxSockets: 50,
        maxFreeSockets: 50,
        timeout: 12000, // active socket keepalive for 12 seconds
        freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
      });
    }
    let result = await axios({
      method: 'post',
      url: `${reviewPostUrl}`,
      timeout: 2000,
      responseType: 'json',
      data: { ...values, apiContext: context },
      // keepAlive pools and reuses TCP connections, so it's faster
      httpAgent: httpAgents[reviewPostUrl],
      // httpsAgent: new https.Agent({ keepAlive: true }),
      // follow up to 10 HTTP 3xx redirects
      maxRedirects: 10,
      // cap the maximum content length we'll accept to 100MBs, just in case
      maxContentLength: 100 * 1000 * 1000
    })
      .catch((e) => {
        result = null;
        logger.error('Front-moderation failed, BYPASS!!', { err: e, _m });
      });
    result = result ? result.data : null;

    if (!result) {
      logger.warn('Front moderation skipped.', { result, _m });
      return [true, null];
    } else if (!Util.toBoolean(result.delete)) {
      return [true, null];
    }
    logger.warn('Front moderation failed.', { result, _m });
    return [false, EC.POST_CONTENT_MODERATION_FAIL('failed to post content.')];
  }

  static async AssertPostImport(values) {
    const illegalInputs = [];
    if (!values) {
      return [false, 'empty data'];
    }
    forEach(values, (value, key) => {
      if (!XMSocialIndexable.POST_IMPORTABLE_PROPS.includes(key)) {
        illegalInputs.push(key);
      }
    });
    if (values[XMSocialIndexable.PROP_TEXT] && values[XMSocialIndexable.PROP_TEXT].length > XMSocialIndexable.POST_TXT_MAX_LENGTH) {
      return [false, 'content exceeding limit'];
    }
    // general size check
    if (JSON.stringify(values).length > XMSocialIndexable.POST_IMPORT_REQ_MAX_LENGTH) {
      throw EC.USER_BAD_INPUT('post request exceeded limit');
    }
    if (!isEmpty(illegalInputs)) {
      // throw EC.USER_BAD_INPUT(`${illegalInputs.join(', ')} are illegal fields, update is aborted.`);
      return [false, `illegal fields detected: ${illegalInputs.join(', ')}`];
    }
    // reject duplicate import post or comment
    const ipid = values[XMSocialIndexable.PROP_IMPORT_POST_ID];
    if (!Util.StringIsEmpty(ipid)) {
      const type = values[XMSocialIndexable.PROP_TYPE];
      if (type === ModelType.POST || type === ModelType.COMMENT) {
        const sm = StorageManager.GetInstance();
        const cacheDB = (type === ModelType.POST) ? sm.getImportPostCache() : sm.getImportCommentCache();
        const cacheKey = (type === ModelType.POST) ? RedisUtil.DeriveImportPostIdKey(ipid) : RedisUtil.DeriveImportCommentIdKey(ipid);
        const cachePostId = await cacheDB.get(cacheKey);
        if (cachePostId) {
          return [false, `duplicate import post id ipid=${ipid},postId=${cachePostId}`];
        }
      }
    }
    return [true, null];
  }

  /**
   * Quick check if the given import post id exists
   *
   * @param {string} imPostId
   * @return {boolean} result
   * @callback
    */
  static async ImportPostIdExists(imPostId, callback) {
    const sm = StorageManager.GetInstance();

    const promise = new Promise((resolve, reject) => {
      sm.checkObjectExistsByField(ModelFolder.POST, MessageProps.IMPORT_POST_ID, imPostId, (err, existence) => {
        if (err) { reject(err); } else { resolve(existence); }
      });
    });
    return await promise;
  }

  static async DeletePost(postId, hardDelete = false) {
    const _m = 'DeletePost';
    let removePostResult;
    // TODO: It will be removed
    hardDelete = false;

    try {
      // removePostResult = await PostHelper.RemoveCachedPost(postId);
      await PostHelper.SetDeleteCachedPost(postId);

      if (hardDelete === true) {
        const sm = StorageManager.GetInstance();
        sm.deleteObject(ModelFolder.POST, postId);
      }
    } catch (err) {
      logger.error('error', { err, _m });
      throw EC.SYS_ERROR(`Failed to delete post: ${postId}`);
    }

    return true;
  } // DeletePost

  static async SetPostACL(postId, aclValues) {
    const _m = 'SetPostACL';
    try {
      const sm = StorageManager.GetInstance();
      const acl = { [XMSocialIndexable.PROP_ACL]: aclValues };
      sm.updateObject(ModelFolder.POST, postId, null, acl);
    } catch (err) {
      logger.error('error', { err, _m });
      throw EC.SYS_ERROR(`Failed to set post ACL: ${postId}`);
    }

    return true;
  }

  /**
   * Delete all posts from a user.
   *
   * @param {string} userId
   * @param {boolean} softDelete true to update records as deleted, false to actually delete records
   * @return {string[]} array of postIds deleted
   */
  static async DeleteUserPosts(userId, hardDelete = false, options = {}) {
    const _m = 'DeleteUserPosts';

    const acl = options.acl;
    // TODO: It will be removed
    hardDelete = false;

    // OK to load all in memory, even if user has tens of thousands of posts
    const query = {
      [XMSocialIndexable.PROP_OWNERID]: userId,
      [XObjectProps.VISIBILITY]: { $ne: XObjectProps.VISTYPE_DELETED },
    }; // own posts or comments
    const processedPostIds = [];
    try {
      const allPosts = await AppService.listObjects(ModelFolder.POST, query, null, {}, null);
      if (!Util.ArrayIsEmpty(allPosts)) {
        // serialize each delete (cache and DB)
        // TODO: should do a separate DB delete via cursor, or batch op
        allPosts.forEach((p) => {
          const postId = p[XObjectProps.ID];
          const repostIds = p[XMSocialIndexable.PROP_REPOSTID_TRACE] || [];
          return new Promise((resolve, reject) => {
            if (postId) {
              PostHelper.DeletePost(postId, hardDelete)
                .then((r) => {
                  processedPostIds.push(postId);

                  // Update ACL
                  if (!Util.ObjectIsEmpty(acl) && !hardDelete) {
                    // set ACL for deleted posts, ACL will effect when admin try to recover the posts
                    // postACL[XACL.PERM_ADMIN] = XACL.PERM_RECOVERABLE;
                    let postACL = p[XMSocialIndexable.PROP_ACL] || {};
                    postACL = _.mergeWith({}, postACL, acl, (a, b) => (b === null ? a : undefined));
                    PostHelper.SetPostACL(postId, postACL).catch((e) => {
                      logger.error('Failed to update ACL of the post.', {
                        err: e,
                        postId,
                        _m,
                      });
                    });
                  }

                  // Dec repost counts
                  for (const rpid of repostIds) {
                    if (rpid.startsWith(PREFIX_POST_ID)) {
                      // [status, count] = await SharesHelper.RemoveSharesPost11(requestorId, postId);
                      // decrement count, don't wait
                      Promise.all([
                        PostStatHelper.DecUserSharesPostCache(userId),
                        PostStatHelper.DecPostSharedCache(rpid),
                      ]);
                    } else if (rpid.startsWith(PREFIX_COMMENT_ID)) {
                      // [status, count] = await SharesHelper.RemoveSharesComment11(requestorId, postId);
                      // decrement count, don't wait
                      Promise.all([
                        CommentStatHelper.DecUserSharesCommentCache(userId),
                        CommentStatHelper.DecCommentSharedCache(rpid),
                      ]);
                    }
                  }

                  resolve(r);
                })
                .catch((e) => {
                  logger.error('Failed to delete post.', { err: e, postId, _m });
                  // processedPostIds.push(postId);
                  // processedPostIds.push(false);
                  reject(e);
                });
            } else {
              logger.error('Empty post id.', { _m });
              resolve(false);
            }
          }).catch(e => logger.error('error', { err: e, _m }));
        });
      }
    } catch (err) {
      logger.error('error', { err, _m });
    }
    return processedPostIds;
  } // DeleteUserPosts

  /**
   *
   * @param {string} userId
   * @param {string[]} repostedPostIds
   * @param {boolean} hardDelete
   * @returns {string[]} array of postIds deleted
   */
  static async DeleteUserReposts(userId, repostedPostIds, hardDelete = false) {
    const _m = 'DeleteUserReposts';

    // all reposts from the suspended user shall be marked as deleted.
    const query_rp = {
      [XMSocialIndexable.PROP_REPOSTID_TRACE]: { $in: repostedPostIds },
      [XObjectProps.VISIBILITY]: { $ne: XObjectProps.VISTYPE_DELETED },
    };
    const processedPostIds = [];
    try {
      const allReposts = await AppService.listObjects(ModelFolder.POST, query_rp, null, {}, null);
      if (!Util.ArrayIsEmpty(allReposts)) {
        allReposts.forEach((rp) => {
          const pid = rp[XObjectProps.ID];
          return new Promise((resolve, reject) => {
            if (pid) {
              PostHelper.DeletePost(pid, hardDelete)
                .then((r) => {
                  processedPostIds.push(pid);
                  // processedPostIds.push(true);
                  resolve(r);
                })
                .catch((e) => {
                  logger.error('Failed to delete post.', { err: e, postId: pid, _m });
                  // processedPostIds.push(pid);
                  // processedPostIds.push(false);
                  reject(e);
                });
            } else {
              logger.error('Empty post id.', { _m });
              resolve(false);
            }
          });
        });
      }
    } catch (err) {
      logger.error('error', { err, _m });
    }
    return processedPostIds;
  } // DeleteUserReposts

  /**
   * Pin Post - Many post version.
   *
   * NOTE: This function will just do the bread-and-butter work.  Any check
   * for proper access and or requested by other privileged users are done
   * at service level.
   *
   * @param {string} userId
   * @param {string} postId
   */
  // static async PinPost_Many(userId, postId) {
  //   let pinResult;
  //   try {
  //     const userObj = await UserHelper.LoadUserFromDB(userId);
  //     if (userObj.hasPinnedPost(postId)) {
  //       throw EC.USER_BAD_REQUEST(`Post ${postId} already pinned.`);
  //     }
  //     if (userObj.getPinnedPosts([]).length >= XMObjectProps.MAX_PINPOSTS) {
  //       throw EC.USER_BAD_REQUEST(`Maximum pinned posts reached (${XMObjectProps.MAX_PINPOSTS})`);
  //     }
  //     userObj.createSnapshot();   // prepare for delta update
  //     const added = userObj.addPinnedPost(postId);
  //     if (added === false) {
  //       throw EC.USER_BAD_REQUEST(`Pin Error (${postId}).`);
  //     }
  //     pinResult = userObj.getPinnedPosts([]);
  //     const updateResult = await StorageManager.GetInstance().updateXMObject(userObj);

  //     // clear/reload userinfo in cache
  //     UserInfoHelper.ReloadUserInfo(userId);

  //   } catch (err) {
  //     logger.error('error', { err });
  //     throw err;
  //   }
  //   return pinResult;
  // } // PinPost


  /**
   * Pin Post - single post version. Any previous post will be replaced
   *
   * NOTE: This function will just do the bread-and-butter work.  Any check
   * for proper access and or requested by other privileged users are done
   * at service level.
   *
   * @param {string} userId
   * @param {string} postId
   */
  static async PinPost(userId, postId) {
    const _m = 'PinPost';
    let pinResult;
    try {
      const userObj = await UserHelper.LoadUserFromDB(userId);
      if (userObj.hasPinnedPost(postId)) {
        throw EC.USER_BAD_REQUEST(`Post ${postId} already pinned.`);
      }
      // may 06 ddm - moved max post checking
      // if (userObj.getPinnedPosts([]).length > XMObjectProps.MAX_PINPOSTS) {
      //   throw EC.USER_BAD_REQUEST(`Maximum pinned posts reached (${XMObjectProps.MAX_PINPOSTS})`);
      // }
      userObj.createSnapshot();   // prepare for delta update
      // const added = userObj.addPinnedPost(postId);
      const added = userObj.setPinnedPosts([postId]);
      // may 06 ddm - moved max post checking down here
      if (userObj.getPinnedPosts([]).length > XMObjectProps.MAX_PINPOSTS) {
        throw EC.USER_BAD_REQUEST(`Maximum pinned posts reached (${XMObjectProps.MAX_PINPOSTS})`);
      }
      if (added === false) {
        throw EC.USER_BAD_REQUEST(`Pin Error (${postId}).`);
      }
      pinResult = userObj.getPinnedPosts([]);
      const dbUpdateResult = await StorageManager.GetInstance().updateXMObject(userObj);

      // clear/reload userinfo in cache
      // await UserInfoHelper.ReloadUserInfo(userId);
      // update/sync cache
      const userInfo = await UserInfoHelper.GetUserInfoFromCache(userId);
      if (userInfo) {
        await UserInfoHelper.SetUserInfoByField_Cache(userId, [UserProps.PINPOSTS], [postId]);
      } else {
        await UserInfoHelper.ReloadUserInfoById(userId);
      }
    } catch (err) {
      logger.error('error', { err, _m });
      throw err;
    }
    return pinResult;
  } // PinPost

  /**
   * Unpin Post.
   *
   * NOTE: This function will just do the bread-and-butter work.  Any check
   * for proper access and or requested by other privileged users are done
   * at service level.
   *
   * @param {string} userId
   * @param {string} postId
   */
  static async UnpinPost(userId, postId) {
    const _m = 'UnpinPost';

    let userObj;
    let userInfo;
    let pinnedPostIds;
    try {
      userObj = await UserHelper.LoadUserFromDB(userId);
      pinnedPostIds = userObj.getPinnedPosts([]);
      if (userObj.hasPinnedPost(postId) === false) {
        throw EC.USER_BAD_REQUEST(`Post ${postId} not pinned.`);
      }
      userObj.createSnapshot();   // prepare for delta update
      const removed = userObj.removePinnedPost(postId);
      if (removed === false) {
        throw EC.USER_BAD_REQUEST(`Unpin error (${postId}).`);
      }
      const updateResult = await StorageManager.GetInstance().updateXMObject(userObj);
      pinnedPostIds = userObj.getPinnedPosts([]);

      // 11 May - commented out due to the likely cause for cascade / out-of-sync pinned post between mongodb and redis on prod
      // clear/reload userinfo in cache
      // await UserInfoHelper.ReloadUserInfo(userId);
      // update/sync cache
      userInfo = await UserInfoHelper.GetUserInfoFromCache(userId);
      if (userInfo) {
        await UserInfoHelper.SetUserInfoByField_Cache(userId, [UserProps.PINPOSTS], pinnedPostIds || []);
      } else {
        await UserInfoHelper.ReloadUserInfoById(userId);
      }
    } catch (err) {
      logger.error('error', { err, _m });
      throw err;
    }
    return pinnedPostIds;
  } // UnpinPost

}
