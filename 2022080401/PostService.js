import _, { groupBy } from 'lodash';
import mime from 'mime-types';
import axios from 'axios';
import http from 'http';
import urlMetadata from 'url-metadata';
import Filter from 'bad-words';
import EC from '../../core/ErrorCodes';
import StorageManager from '../core/StorageManager';

import {
  LanguageCodes, LIVE_CONFIG_CATEGORIES,
  MessageProps,
  ModelFolder,
  ModelType,
  PREFIX_COMMENT_ID,
  PREFIX_POST_ID, PTYPE_POLL,
  PTYPE_STREAM,
  SITE_TWITTER,
  SocialSyncProps,
  StatsProps,
  STATUS_NOT_WATCHED,
  USERID_GUEST,
  UserProps,
  VIEW_LOCATIONS
} from '../../core/model/ModelConsts';
import ActivityLogger from '../activity/ActivityLogger';
import PostHTMLRenderer from '../../core/html/post/PostHTMLRenderer';
import WebPageImage from '../../server/util/WebPageImage';
import API, { INCL_HASHTAGS, INCL_USERTAGS } from '../../core/API';
import { RES_NOTFOUND } from '../../core/ErrorConsts';
import XMLikedPost from '../../core/model/post/XMLikedPost';
import XMWatchedComment from '../../core/model/post/XMWatchedComment';
import XMLikedComment from '../../core/model/post/XMLikedComment';
import XMSharedPost from '../../core/model/post/XMSharedPost';
import XMWatchedPost from '../../core/model/post/XMWatchedPost';

import AppService from '../AppService';
import FileService from '../fs/FileService';
import DownStream from '../activity/DownStream';
import PostsFeedService from './PostsFeedService';

import Util, { TimeUtil } from '../../core/Util';
import HashtagUtil from '../../core/util/HashtagUtil';
import ImageUtil from '../../core/util/ImageUtil';
import PostStatHelper from './PostStatHelper';
import TagService from '../tag/TagService';
import XResultMap from '../../core/model/util/XResultMap';
import XObject from '../../core/model/XObject';
import PostHelper from './PostHelper';
import XMComment from '../../core/model/social/XMComment';
import CommentHelper from './CommentHelper';
import CommentFeedService from './CommentsFeedService';
import CommentStatHelper from './CommentStatHelper';
import XMCommentStats from '../../core/model/social/XMCommentStats';
import XMSharedComment from '../../core/model/post/XMSharedComment';
import UserInfoHelper from '../user/UserInfoHelper';
import ImageHelper from '../core/media/ImageHelper';
import LikesHelper from '../social/LikesHelper';
import XMSocialIndexable from '../../core/model/social/XMSocialIndexable';
import PostFeedHelper from './PostFeedHelper';
import SharesHelper from '../social/SharesHelper';
import XError from '../../core/model/XError';
import ObjectBase from '../../core/ObjectBase';
import ElasticsearchService from '../textsearch/ElasticsearchService';
import RedisUtil, { EXPIRE_TIME_FOR_LIKE, EXPIRE_TIME_FOR_SHARE } from '../core/store/RedisUtil';
import PostInfoHelper from './PostInfoHelper';
import ServiceUtil from '../ServiceUtil';
import XPostFeed from '../../core/model/activity/XPostFeed';
import SystemConfig from '../../server/SystemConfig';
import { httpAgents } from '../textsearch/ElasticsearchHelper';
import APIContext from '../../server/model/APIContext';
import XMPost from '../../core/model/post/XMPost';
import UserHelper from '../user/UserHelper';
import PostActivityHelper from './PostActivityHelper';
import TranslateService, { TRANSLATE_EXPIRY } from '../translate/TranslateService';
import XPostInfo from '../../core/model/post/XPostInfo';
import CDNService from '../CDN/CDNService';
import InfluencerService from '../user/InfluencerService';
import { PUBLIC_LIVE_USERS } from '../system/SystemService';
import LiveStreamHelper from '../live/LiveStreamHelper';
import XUserInfo from '../../core/model/user/XUserInfo';
import VisionHelper from '../vision/VisionHelper';
import SoundStatHelper from '../vision/SoundStatHelper';
import StickerStatHelper from '../vision/StickerStatHelper';
import gettrLogger from '../../core/GettrLogger';
import TextFilterClient from '../moderation/TextFilterClient';
import XMUser from "../../core/model/user/XMUser";
import ErrorCodes from "../../core/ErrorCodes";

const COLL_POST = ModelFolder.POST;
const COLL_COMMENTS = ModelFolder.COMMENT;
const COLL_LIKED_POST = ModelFolder.LIKED_POST;
const COLL_SHARED_POST = ModelFolder.SHARED_POST;
const COLL_SHARED_COMMENT = ModelFolder.SHARED_COMMENT;
const LIVE_POST_TITLE_MAX_LENGTH = 100;
const CHANGE_TXT_EXPIRED = 3600000; // 1 hour in ms
const CHANGE_TXT_MAX = 5;

const _CLSNAME = 'PostService';
const logger = gettrLogger(_CLSNAME);

export const MODERATOR_MODE = 'mod';
export const LIVE_NOW_EXPLORE = 'explore';

const GetValue = (keys, source) => {
  return keys.reduce((nextObj, key) => {
    return nextObj && nextObj[key] ? nextObj[key] : null;
  }, source);
};

class PostService extends ObjectBase {

  /**
   * Request for a new Post id
   *
   * @param {*} defaultVal
   * @return {string}
   * @throws
   */
  static async GetUniquePostId() {
    const postId = await StorageManager.GetInstance().getNextPostID();
    return postId;
  }

  /**
   * Retrieve posts that include given #hashtag
   *
   * @param {string} tagname
   * @param {string} sort by (see SORTTYPE_*). Null for default of latest
   * @param {number} max number of items to resturn
   * @param {number} index start-after index position (default = -1)
   * @return {XPostFeed} array of user alerts, or empty array if none or error
   */
  static async GetPostsFeedByHashtag(tagname, sort = null, max = 100, index = -1) {
    // const _m = `${_CLSNAME}.GetPostsFeedByHashtag`;

    const postFeed = await PostsFeedService.GetHashtagFeed(tagname, true, sort, max, index);

    return postFeed;
  } // GetPostsFeedByHashtag

  /**
   * Retrieve posts that include given hashtags
   *
   * @param {string[]} tagnames
   * @param {string} sort by (see SORTTYPE_*). Null for default of latest
   * @param {number} max number of items to resturn
   * @param {number} index start-after index position (default = -1)
   * @return {XPostFeed} array of user alerts, or empty array if none or error
   */
  static async GetPostsFeedByHashtags(tagnames, sort = null, max = 100, index = -1) {
    // const _m = `${_CLSNAME}.GetPostsFeedByHashtags`;

    // For now, we are doing this SERIALLY

    const postFeed = await PostsFeedService.GetHashtagsFeed(tagnames, true, sort, max, index);

    return postFeed;
  } // GetPostsFeedByHashtags

  /**
   * Retrieve posts that include given @mentions
   *
   * @param {string} userIds user that is mentioned in posts
   * @param {string} sort by (see SORTTYPE_*). Null for default of latest
   * @param {number} max number of items to resturn
   * @param {number} index start-after indemultix position (default = -1)
   * @return {XPostFeed} array of user alerts, or empty array if none or error
   */
  static async GetPostsFeedByUsertags(userIds, sort = null, max = 20, index = -1) {
    // const _m = `${_CLSNAME}.GetPostsFeedByUsertag`;

    const postFeed = await PostsFeedService.GetUsertagsFeed(userIds, true, sort, max, index);

    return postFeed;
  } // GetPostsFeedByUsertags

  /**
   *
   * @param {APIContext} apiContext
   * @param {string} lang filter by languages - see LanguageCodes.*
   * @param {string} topics topics to filter
   * @param {number} max
   * @param {number} offset
   * @param {number} startTS starting timestamp. Point in time reference
   * @param {string} inclOptions INCL_POST|INCL_POSTSTATS|INCL_USERINFO
   * @return {XPostFeed} array of activi
   */
  static async FetchPostsByTrend(apiContext, lang, topics, sort = null, max = 100, offset = -1, startTS = null, inclOptions = null) {
    const _m = 'FetchPostsByTrend';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    if (Util.IsNull(startTS)) {
      startTS = Date.now();
    }
    if (Util.IsNull(inclOptions)) {
      inclOptions = `${API.INCL_POSTS}|${API.INCL_POSTSTATS}|${API.INCL_USERINFO}`;
    }

    // STEP 1: process the phrase to extract explicitly declared #hashtags
    // and @mentions
    // const [tagnames, usernames, words] = HashtagUtil.TextScanTagsAt(topics, true, true);

    let result;
    let ecode;
    try {
      // Check supported langs
      lang = Util.NormalizeLanguage(lang);
      if (!LanguageCodes.SUPPORTED_LANGS.includes(lang)) {
        lang = LanguageCodes.DEFAULT;
      }

      const postFeed = await PostsFeedService.FetchSuperInfluencersFeedPioneer(lang, topics, false, sort, max, offset, startTS, inclOptions);
      result = postFeed ? await PostFeedHelper.PostProcessFeed(apiContext, postFeed, apiContext.getUsername(), inclOptions) : null;
    } catch (err) {
      ecode = XError.FromError(err);
      logger.error('error', { err, _m });
    }

    (async () => {
      try {
        const log = await ActivityLogger.UserViewedTrendingTimeline(apiContext.getAuthenticatedUserId(USERID_GUEST));
        apiContext.updateActivityLog(log, ecode);
        DownStream.SubmitLog(log)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (lerr) {
        logger.error('Write act log error', { err: lerr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return result;
  }

  static async FetchLiveNowFeed(apiContext, lang, pageOptions = {}, inclOptions = null, scope = [], blacklistLiveUsers = [], mode = null) {
    const _m = 'FetchLiveNowFeed';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    let forceReRanking = Util.toBoolean(pageOptions.forceReRanking);

    if (Util.IsNull(inclOptions)) {
      inclOptions = `${API.INCL_POSTS}|${API.INCL_POSTSTATS}|${API.INCL_USERINFO}`;
    }

    // STEP 1: process the phrase to extract explicitly declared #hashtags
    // and @mentions
    // const [tagnames, usernames, words] = HashtagUtil.TextScanTagsAt(topics, true, true);

    let resultFeed;
    let cursor;
    let removed = 0;
    let blacklistRemoved = 0;
    let ecode;
    let userScope;
    let exclUsers;
    let allItems;
    const requestorInfo = apiContext.getUserInfo();
    const requestorId = apiContext.getAuthenticatedUserId();
    try {
      switch (mode) {
        case MODERATOR_MODE:
          lang = 'mod';
          userScope = [];
          forceReRanking = false;
          break;
        default:
          // Check supported langs
          lang = Util.NormalizeLanguage(lang);
          if (!LanguageCodes.SUPPORTED_LANGS.includes(lang) && lang !== LIVE_NOW_EXPLORE && !LIVE_CONFIG_CATEGORIES.includes(lang)) {
            throw EC.API_BAD_PARAMS('unsupported language');
          }
          exclUsers = await UserInfoHelper.GetExclUsersByUserInfo(requestorInfo) || [];
          userScope = scope.filter(u => !exclUsers.includes(u));
          if ((lang === LIVE_NOW_EXPLORE || forceReRanking) && !LIVE_CONFIG_CATEGORIES.includes(lang)) {
            lang = 'mod';
          }
          break;
      }

      allItems = await PostFeedHelper.GetLiveNowFeeds(requestorId, lang, { ...pageOptions, max: pageOptions.max + 1 });

      // Create cursor
      if (!Util.ArrayIsEmpty(allItems)) {
        const size = allItems.length;
        const lastItem = allItems[size - 1];

        // do not validate itemId for live now feed as the order keeps changing
        if (size > pageOptions.max) {
          const nextId = XMComment.GetId(lastItem);
          const nextTS = XMComment.GetCreatedTS(XMComment.Unwrap(lastItem));
          allItems = allItems.slice(0, pageOptions.max);
          cursor = RedisUtil.CreateCursor(nextTS, nextId);
        }
      }

      // exclude users
      if (!Util.ArrayIsEmpty(userScope) && lang !== LIVE_NOW_EXPLORE && !forceReRanking && !LIVE_CONFIG_CATEGORIES.includes(lang)) {
        [allItems, removed] = PostActivityHelper.ScopeUsersFromFeedItems(allItems, userScope);
      } else if (!Util.ArrayIsEmpty(exclUsers) && mode !== MODERATOR_MODE) {
        [allItems, removed] = PostActivityHelper.FilterUsersFromFeedItems(allItems, exclUsers);
      }

      // exclude blacklist users
      if (!Util.ArrayIsEmpty(blacklistLiveUsers) && mode !== MODERATOR_MODE) {
        [allItems, blacklistRemoved] = PostActivityHelper.FilterUsersFromFeedItems(allItems, blacklistLiveUsers);
      }

      const postFeed = XPostFeed.Create(`livenow_${lang}`, allItems);
      const aux = {
        removed: removed + blacklistRemoved,
        cursor: cursor || 0,
      };
      postFeed.setAuxData(aux);

      resultFeed = await PostFeedHelper.PostProcessFeed(apiContext, postFeed, apiContext.getUsername(), inclOptions);

      // re-ranking
      if (forceReRanking) {
        const data = resultFeed.getList();
        if (!Util.ArrayIsEmpty(data)) {
          const auxData = resultFeed.getAuxData();
          // step1: get stream ids
          const streamIds = [];
          const mapPostToStream = {};
          if (!Util.ObjectIsEmpty(auxData)) {
            _.forEach(data, (item) => {
              const postId = item['activity']['pstid'];
              if (!Util.IsNull(postId)) {
                const streamId = XPostInfo.GetObjectField(auxData['post'][postId], XMSocialIndexable.PROP_STREAM_ID);
                if (!Util.IsNull(streamId)) {
                  mapPostToStream[postId] = streamId;
                  streamIds.push(streamId);
                }
              }
            });

            // step2: get stream infos
            const resultMap = {};
            if (!Util.ArrayIsEmpty(streamIds)) {
              const options = {
                streamIds,
              };
              const streams = await LiveStreamHelper.RequestLiveManager(apiContext, 'GetStreams', options);
              const streamObjs = streams._data_group || {};

              _.forEach(streamObjs, (streamObj, streamId) => {
                if (!Util.StringIsEmpty(streamId)) {
                  delete streamObj['postData'];
                  resultMap[streamId] = streamObj;
                }
              });
            }
            const weightdData = [];

            // step3: set flag isLive & isScope & likeCount
            _.forEach(data, (item) => {
              const postId = GetValue(['activity', 'pstid'], item);
              const streamId = mapPostToStream[postId];
              if (!Util.IsNull(streamId) && Util.toBoolean(GetValue([streamId, 'broadcast', 'isLive'], resultMap))) {
                item['isLive'] = 1;
              } else {
                item['isLive'] = 0;
              }

              const postOwnerId = GetValue(['activity', 'src_id'], item);
              if (scope.includes(postOwnerId)) {
                item['isScope'] = 1;
              } else {
                item['isScope'] = 0;
              }

              item['likeCount'] = Util.toNumber(GetValue(['s_pst', postId, 'lkbpst'], auxData), 0);

              weightdData.push(item);
            });

            // step4: sort by isLive desc, isScope desc, likeCount desc, udate desc
            weightdData.sort((a, b) => {
              if (a.isLive === b.isLive) {
                if (a.isScope === b.isScope) {
                  if (a.likeCount === b.likeCount) {
                    return b.udate - a.udate;
                  }
                  return b.likeCount - a.likeCount;
                }
                return b.isScope - a.isScope;
              }
              return b.isLive - a.isLive;
            });

            // step5: reset result data
            resultFeed.setList(weightdData);
          }
        }
      }
    } catch (err) {
      ecode = XError.FromError(err);
      logger.error('error', { err, _m });
    }

    (async () => {
      try {
        const log = await ActivityLogger.UserViewedLiveNowTimeline(requestorId);
        apiContext.updateActivityLog(log, ecode);
        DownStream.SubmitLog(log)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (lerr) {
        logger.error('error', { err: lerr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return resultFeed;
  }

  /**
   * Search posts based on user text phrase.
   *
   * @param {APIContext} apiContext
   * @param {number} max number of items to resturn
   * @param {number} offset start-after offset position (default = 0)
   * @param {{}} pageOptions options for pagination { offset, max, cursor }
   * @return {XPostFeed} array of user alerts, or empty array if none or error
   */
  static async FetchPostsFromTextSearch(apiContext, phrase, pageOptions = {}, inclOptions, query = {}) {
    const _m = 'FetchPostsFromTextSearch';

    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    const userInfo = apiContext.getUserInfo();

    const filter = await TextFilterClient.GetInstance();
    if (filter.isProfane(phrase)) {
      return XPostFeed.Create(`tsfd_${apiContext.getAuthenticatedUserId()}_${Date.now()}`, []);
    }

    let feedObj;
    let ecode;
    try {
      // check access
      await AppService.CheckUserCanACCESSCONTENT(userInfo);

      feedObj = await ElasticsearchService.SearchText(apiContext, phrase, pageOptions, inclOptions);
    } catch (err) {
      ecode = XError.FromError(err);
      logger.error('Failed to search posts.', { err, _m });
    }

    try {
      const requestorInfo = apiContext ? apiContext.getUserInfo() : {};
      const subsetUserInfo = ServiceUtil.SubsetSrcObj(requestorInfo, UserProps.PUBLIC_PROPS);
      // add IP info
      XObject.SetObjectField(subsetUserInfo, APIContext.USER_IP, apiContext.getUserIP());
      const log = await ActivityLogger.UserSearchPost(subsetUserInfo, phrase);
      apiContext.updateActivityLog(log, ecode);
      DownStream.SubmitLog(log); // async
    } catch (activityErr) {
      logger.error('error', { err: activityErr, _m });
    }

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return feedObj;
  }

  /**
   * Get recommended videos based on user.
   *
   * @param {APIContext} apiContext
   * @param {number} max number of items to resturn
   * @param {number} offset start-after offset position (default = 0)
   * @param {{}} pageOptions options for pagination { offset, max, cursor }
   * @return {XPostFeed} array of user alerts, or empty array if none or error
   */
  static async FetchPostsByRecommandation(apiContext, pageOptions = {}, inclOptions) {
    const _m = 'FetchPostsByRecommandation';

    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    const userInfo = apiContext.getUserInfo();

    let feedObj;
    let ecode;
    try {
      // check access
      await AppService.CheckUserCanACCESSCONTENT(userInfo);

      feedObj = await ElasticsearchService.RecommendPosts(apiContext, pageOptions, inclOptions);
    } catch (err) {
      ecode = XError.FromError(err);
      logger.error('Failed to search posts.', { err, _m });
    }

    // No need to write act log

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return feedObj;
  }

  /**
   * Search posts based on user text phrase.
   *
   * @param {APIContext} apiContext
   * @param {number} max number of items to resturn
   * @param {number} offset start-after offset position (default = 0)
   * @param {{}} pageOptions options for pagination { offset, max, cursor }
   * @return {XPostFeed} array of user alerts, or empty array if none or error
   */
  static async FetchUsersFromTextSearch(apiContext, phrase, pageOptions = {}, inclOptions) {
    const _m = 'FetchUsersFromTextSearch';

    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    const userInfo = apiContext.getUserInfo();

    const filter = await TextFilterClient.GetInstance();
    if (filter.isProfane(phrase)) {
      return XPostFeed.Create(`tsfd_${apiContext.getAuthenticatedUserId()}_${Date.now()}`, []);
    }
    let feedObj;
    let ecode;
    try {
      // check access
      await AppService.CheckUserCanACCESSCONTENT(userInfo);

      feedObj = await ElasticsearchService.SearchUser(apiContext, phrase, pageOptions, inclOptions);
    } catch (err) {
      ecode = XError.FromError(err);
      logger.error('Failed to search users.', { err, _m });
    }

    try {
      const requestorInfo = apiContext ? apiContext.getUserInfo() : {};
      const subsetUserInfo = ServiceUtil.SubsetSrcObj(requestorInfo, UserProps.PUBLIC_PROPS);
      // add IP info
      XObject.SetObjectField(subsetUserInfo, APIContext.USER_IP, apiContext.getUserIP());
      const log = await ActivityLogger.UserSearchUser(subsetUserInfo, `@${phrase}`);
      apiContext.updateActivityLog(log, ecode);
      DownStream.SubmitLog(log); // async
    } catch (activityErr) {
      logger.error('error', { err: activityErr, _m });
    }

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return feedObj;
  }

  /**
   * Retrieve posts based on user typed phrase.
   *
   * @param {APIContext} apiContext
   * @param {string} userId user that is mentioned in posts
   * @param {string} sort by (see SORTTYPE_*). Null for default of latest
   * @param {number} max number of items to resturn
   * @param {number} offset start-after offset position (default = 0)
   * @return {XPostFeed} array of user alerts, or empty array if none or error
   */
  static async FetchPostsFromQuery(apiContext, phrase, sort = null, max = 100, offset = 0) {
    const _m = 'FetchPostsFromQuery';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    // STEP 1: process the phrase to extract explicitly declared #hashtags
    // and @mentions
    const [tagnames, usernames, words] = HashtagUtil.TextScanTagsAt(phrase, true, true);

    // STEP 2: go fetch from hashtag and usertag streams, send both
    // explicitly declared tokens (with # and @) and regular text.
    const feedObj = await PostsFeedService.GetAllTagsFeed(tagnames, usernames, words, true, sort, max, offset);
    const itemCount = feedObj ? feedObj.size() : 0;
    if (itemCount === 0) { return feedObj; }
    return await PostFeedHelper.PostProcessFeed(apiContext, feedObj, apiContext.getUsername(), `${API.INCL_POSTS}|${API.INCL_POSTSTATS}|${API.INCL_USERINFO}`);
  }

  /**
   * Return post (and comment) data via array of post/comment IDs. Because
   * activity timeline is designed to preload posts and therefore call this
   * function, we wil "proxy" if the Id hints that it is a comment.
   *
   * @param {[]} objectIds array of IDs. Single ID can just be a string. Prefix
   * hints if anyone of these is a comment.
   * @param {string[]=} fields fields to return
   * @param {boolean=} useMap return result as a map with ID field (_id) as key.
   * false will return an array of {key: data}
   * @param {boolean=} wrap true to wrap each post object with XMPost/XMComment,
   * false to return JSON as values
   * @callback
   * @return {{}[]} map or array of post/comment objects (as JSON or XMPost)
   */
  static async GetPostsByIds(objectIds, fields = null, useMap = false, wrap = true, inclDeleted = false, _callback) {
    const _m = 'GetPostsByIds';

    const startTS = Date.now();

    // TO-DO: support fields selector
    const { c_ids, p_ids } = groupBy(objectIds, (id) => { return `${id[0]}_ids`; });

    try {
      // Serial requests for now (non-optimized)
      const resultPosts = (p_ids && p_ids.length > 0) ? await PostHelper.GetPostsByIds(p_ids, fields, inclDeleted) : [];
      const resultComments = c_ids ? await CommentHelper.GetCommentsByIds(c_ids, fields, inclDeleted) : [];
      const resultObjects = [...resultPosts, ...resultComments];
      if (!useMap) {
        return wrap ? resultObjects : resultObjects.map((rp) => {
          // TODO: Temporary solution to take out ovid
          const ovid = XMSocialIndexable.GetObjectField(rp, XMSocialIndexable.PROP_ORIG_VIDEO_URL);
          if (!Util.StringIsEmpty(ovid)) {
            XMSocialIndexable.SetObjectField(rp, XMSocialIndexable.PROP_ORIG_VIDEO_URL, '');
          }

          return XObject.Unwrap(rp);
        });
      }
      const resultMap = resultObjects.reduce((acc, cur) => {
        // TODO: Temporary solution to take out ovid
        const ovid = XMSocialIndexable.GetObjectField(cur, XMSocialIndexable.PROP_ORIG_VIDEO_URL);
        if (!Util.StringIsEmpty(ovid)) {
          XMSocialIndexable.SetObjectField(cur, XMSocialIndexable.PROP_ORIG_VIDEO_URL, '');
        }

        const curData = XObject.Unwrap(cur);
        if (curData) {
          acc[curData[XObject.PROP_ID]] = wrap ? cur : curData;
        }
        return acc;
      }, {});
      objectIds.forEach((id) => {
        if (!resultMap[id]) {
          let notFoundPostable;
          if (id.startsWith(PREFIX_POST_ID)) {
            notFoundPostable = XMPost.CreatePostNotFound(id);
          } else if (id.startsWith(PREFIX_COMMENT_ID)) {
            notFoundPostable = XMComment.CreateCommentNotFound(id);
          }
          if (notFoundPostable) {
            resultMap[id] = wrap ? notFoundPostable : XObject.Unwrap(notFoundPostable);
          }
        }
      });
      return resultMap;
    } catch (error) {
      logger.error('Failed to get posts by ids', { err: error, _m });
    }
  } // GetPostsByIds

  // -----------------------  TIMELINE / FEEDS ------------------------

  static async GetPostInfo(postId, fields, useMap = true, wrap = false) {
    const _m = 'GetPostInfo';
    const startTS = Date.now();
    try {
      let resultPostInfo = await PostInfoHelper.GetPostInfo(postId, fields);
      resultPostInfo = wrap ? XPostInfo.Wrap(resultPostInfo) : XPostInfo.Unwrap(resultPostInfo);

      return useMap ? {
        [postId]: resultPostInfo
      } : resultPostInfo;

    } catch (error) {
      logger.error('Failed to get postInfo by ids', { err: error, _m });
    }
  }

  static async GetPostInfosByIds(postIds, fields, useMap = true, wrap = false) {
    const _m = 'GetPostInfoByIds';

    try {
      const postInfos = (postIds && postIds.length > 0) ? await PostInfoHelper.GetPostInfoList(postIds, fields, wrap, useMap) : null;
      return useMap ? postInfos || {} : postInfos || [];
    } catch (error) {
      logger.error('Failed to get postInfo by ids', { err: error, _m });
    }
  }

  // -------------------------- COMMENTS FEED -------------------------

  /**
   * Retrieve a batch of comments directly associated with a post.
   * if you don't want to make separate call for post's comments
   * and comment's comments, use GetComments() below
   *
   * @param {APIContext} apiContext
   * @param {string} postId
   * @param {{}} pageOptions options for pagination { startTS, max, offset, cursor, sort }
   * @param {string} inclOptions INCL_POST|INCL_POSTSTATS|INCL_USERINFO
   * @return {XPostFeed} list of XMPostItem instances and with aux data
   * containing variable map for text, as well as any inclusion from
   * the inclOptions
   *
   * @see ~GetComments
   * @see ~GetCommentReplies
   */
  static async GetPostReplies(apiContext, postId, pageOptions, inclOptions) {
    const _m = 'GetPostReplies';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    // Get excluded users
    const loggedInUserId = apiContext.getAuthenticatedUserId();
    const loggedInUserInfo = await UserInfoHelper.GetUserInfoFromAPIContext(apiContext, loggedInUserId);

    let exclUsers = null;
    let ecode = null;
    let feedObj;
    try {
      if (loggedInUserId) {
        exclUsers = loggedInUserInfo ? await UserInfoHelper.GetExclUsersByUserInfo(loggedInUserInfo) : null;
      }

      const postInfo = await PostInfoHelper.GetPostInfo(postId);
      await AppService.CheckUserCanREAD(loggedInUserInfo, postInfo);

      // Main Job
      feedObj = await CommentFeedService.GetCommentFeed(postId, true, pageOptions, exclUsers);
      const itemCount = feedObj ? feedObj.size() : 0;
      if (itemCount === 0) {
        return feedObj;
      }

      await CommentHelper.PreloadCommentFeed(apiContext, feedObj, inclOptions);
    } catch (err) {
      ecode = XError.FromError(err);
      logger.error('Failed to search posts.', { err, _m });
    }

    try {
      const username = apiContext.getUsername();
      if (apiContext && !apiContext.isRobot()) {
        const log = await ActivityLogger.UserViewedPostRepliesList(username, postId);
        apiContext.updateActivityLog(log, ecode);
        DownStream.SubmitLog(log);
      }
    } catch (err) {
      logger.error('error', { err, _m });
    }

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return feedObj;
  } // GetPostReplies

  /**
   * Retrieve batch of comments directly under a specified comment.
   * if you don't want to make separate call for post's comments
   * and comment's comments, use GetComments() below
   *
   * @param {APIContext} apiContext
   * @param {string} commentId parent comment Id of comments this is retrieving for
   * @param {{}} pageOptions options for pagination { startTS, max, offset, cursor, sort }
   * @param {string} inclOptions INCL_POST|INCL_POSTSTATS|INCL_USERINFO
   * @return {XPostFeed} list of XMPostItem instances and with aux data
   * containing variable map for text, as well as any inclusion from
   * the inclOptions
   *
   * @see ~GetPostComments
   * @see ~GetComments
   */
  static async GetCommentReplies(apiContext, commentId, pageOptions, inclOptions) {
    const _m = 'GetCommentReplies';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    // Get excluded users
    const loggedInUserId = apiContext.getAuthenticatedUserId();
    const loggedInUserInfo = await UserInfoHelper.GetUserInfoFromAPIContext(apiContext);

    let exclUsers = null;
    let ecode = null;
    let feedObj;
    try {
      if (loggedInUserId) {
        exclUsers = loggedInUserInfo ? await UserInfoHelper.GetExclUsersByUserInfo(loggedInUserInfo) : null;
      }

      // Main Job
      feedObj = await CommentFeedService.GetCommentFeed(commentId, true, pageOptions, exclUsers);
      const itemCount = feedObj ? feedObj.size() : 0;
      if (itemCount === 0) {
        return feedObj;
      }

      await CommentHelper.PreloadCommentFeed(apiContext, feedObj, inclOptions);
    } catch (err) {
      ecode = XError.FromError(err);
      logger.error('Failed to get comment replies.', { err, _m });
    }

    // TODO
    // No need to fetch comment as comments are embedded in comment feed.
    // HOWEVER, comment stats are not!!!
    // await PostHelper.PreloadCommentFeed(feedObj, inclOptions);

    try {
      const username = apiContext.getUsername();
      if (apiContext && !apiContext.isRobot()) {
        const log = await ActivityLogger.UserViewedCommentRepliesList(username, commentId);
        apiContext.updateActivityLog(log, ecode);
        DownStream.SubmitLog(log);
      }
    } catch (err) {
      logger.error('error', { err, _m });
    }

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return feedObj;
  } // GetCommentReplies

  /**
   * Retrieve batch of comments directly under a parent object, which
   * should be either a post or comment.
   *
   * @param {APIContext} apiContext
   * @param {string} parentId ID of a post or comment
   * @param {string} sort by (see SORTTYPE_*). Null for default of latest
   * @param {number} max number of items to resturn
   * @param {number} index start-after index position (default = -1)
   * @param {number} startTS starting timestamp. Point in time reference
   * @param {string} inclOptions INCL_POST|INCL_POSTSTATS|INCL_USERINFO
   * @return {XPostFeed} list of XMPostItem instances and with aux data
   * containing variable map for text, as well as any inclusion from
   * the inclOptions
   *
   * @see ~GetPostReplies
   * @see ~GetCommentReplies
   * @deprecated
   */
  static async GetComments(apiContext, parentId, sort = null, max = 20, index = -1, startTS, inclOptions) {
    if (parentId == null) {
      throw EC.SYS_BAD_ARGS('parentId null');
    }
    let result;
    if (parentId.startsWith(PREFIX_POST_ID)) {
      result = this.GetPostReplies(apiContext, parentId, { sort, max, index, startTS }, inclOptions);
    } else if (parentId.startsWith(PREFIX_COMMENT_ID)) {
      result = this.GetCommentReplies(apiContext, parentId, { sort, max, index, startTS }, inclOptions);
    } else {
      throw EC.SYS_BAD_ARGS('parentId?');
    }
    return result;
  } // GetComments

  /**
   * Return comment (selectable) data via array of comment IDs
   *
   * @param {[]} commentIds array of IDs. Single ID can just be a string
   * @param {string[]=} fields fields to return
   * @param {boolean=} useMap return result as a map with ID field (_id) as key.
   * false will return an array of {key: data}
   * @param {boolean=} wrap true to wrap each post object with XMPost, false to
   * return JSON as values
   * @callback
   * @return {{}[]} map or array of comment objects (as JSON or XMPost)
   * @deprecated
   */
  static async GetCommentsByIds(apiContext, commentIds, _fields = null, useMap = false, _wrap = true, _callback) {
    const _m = 'GetCommentsByIds';

    apiContext = AppService.AssertAPIContext(apiContext, false, _m);

    // TO-DO: support fields selector
    try {
      const resultPosts = await CommentHelper.GetCommentsByIds(commentIds);
      if (!useMap) {
        return resultPosts.map(rp => XObject.Unwrap(rp));
      }
      return resultPosts.reduce((acc, cur) => {
        const curData = XObject.Unwrap(cur);
        if (curData) { acc[curData[XMComment.PROP_ID]] = curData; }
        return acc;
      }, {});
    } catch (error) {
      logger.error('Failed to get comments by ids.', { err: error, _m });
    }
  } // GetPostsByIds


  /**
 * SERVICE ENTRY POINT:
 *
 * Retrieve post object. It will check and load from cache first.
 * If it doesn exist (either expired or never loaded before), it
 * will go to storage to retrieve and update cache.
 *
 * NOTE: If the ID has comment prefix, the service will redirect
 * to ~LoadComment
 *
 * @param {APIContext} apiContext
 * @param {string} postId for a post or ID of a comment
 * @param {string} inclOptions additional requests: API.INCL_STATS|API.INCL_USERINFO
 * @return {XMPost} or XMComment
 */
  static async LoadPost(apiContext, postId, inclOptions) {
    const _m = 'LoadPost';

    let xPost;
    let ecode;
    const requestorInfo = apiContext.getUserInfo();
    try {
      xPost = await PostHelper.LoadPost(postId, inclOptions, true, 1, apiContext);
      await AppService.CheckUserCanREAD(requestorInfo, xPost);

    } catch (loadError) {
      ecode = XError.FromError(loadError);
      logger.error('error', { err: loadError, _m });
    }

    // write act log
    (async () => {
      try {
        const srcObj = ServiceUtil.SubsetSrcObj(requestorInfo, UserProps.PUBLIC_PROPS);
        XObject.SetObjectField(srcObj, APIContext.USER_IP, apiContext.getUserIP());
        const log = await ActivityLogger.UserViewedPost(srcObj, xPost);
        apiContext.updateActivityLogs(log, ecode);
        DownStream.SubmitLog(log)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (e) {
        logger.error('Write act log error.', { err: e, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return xPost;
  } // LoadPost

  /**
   * Submit Post for approval / update. This front-end for
   * saveObject() can support for preparations (e.g., image conversions)
   * and any pre-approval process/workflow in the future.
   *
   * @param {APIContext} apiContext
   * @param {string} userId ID of user making the request
   * @param {XMPost} postObj containing user text but no ID assigned (or shouldn't)
   * @param {string[]} imageFiles array of image file locations
   * @return {XMPost} saved object (?)
   *
   * @see ~SubmitRepost
   */
  static async SubmitPost(apiContext, postObj, imageFiles = null, videoFile = null, options = {}) {
    const _m = 'SubmitPost';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    // if (!apiContext.isAuthenticatedUser()) { throw ErrorCodes.USER_BAD_AUTH('Illegal User?'); }

    let ecode, savedPostObj, usertags, hashtags, soundIds, stickerIds, lang;
    try {
      const requestorInfo = apiContext ? apiContext.getUserInfo() : null;
      await AppService.CheckUserCanPOST(requestorInfo, postObj);

      // Update user star status
      await InfluencerService.UpdateUserPopularity(requestorInfo);

      // Assert comment props
      let postData = postObj['data'] ? postObj['data'] : null;

      // remove duplicate tags
      postData[XMSocialIndexable.PROP_HASHTAGS] = postData[XMSocialIndexable.PROP_HASHTAGS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_HASHTAGS].map(tag => tag.toLowerCase())) : null;

      usertags = postData[XMSocialIndexable.PROP_USERTAGS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_USERTAGS].map(tag => tag.toLowerCase())) : null;
      usertags = await UserHelper.ReplaceExistingUsernamesWithUserIds(usertags) || [];
      postData[XMSocialIndexable.PROP_USERTAGS] = usertags;

      // remove duplicate/invalid soundIds
      soundIds = postData[XMSocialIndexable.PROP_SOUND_IDS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_SOUND_IDS].map(tag => tag.toLowerCase())) : null;
      postData[XMSocialIndexable.PROP_SOUND_IDS] = (soundIds || []).slice(0, XMSocialIndexable.VISION_SOUNDS_MAX);

      // remove duplicate/invalid stickerIds
      stickerIds = postData[XMSocialIndexable.PROP_STICKER_IDS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_STICKER_IDS].map(tag => tag.toLowerCase())) : null;
      stickerIds = await VisionHelper.FindExistStickerIds(stickerIds) || [];
      postData[XMSocialIndexable.PROP_STICKER_IDS] = stickerIds.slice(0, XMSocialIndexable.VISION_STICKER_MAX);

      // remove script
      postData = ServiceUtil.FilterScriptForObj(postData, XMSocialIndexable.POST_CREATION_PROPS);

      // detect language
      lang = await ServiceUtil.DetectLanguage(postData[XMSocialIndexable.PROP_TEXT]);
      lang = Util.NormalizeLanguage(lang) || LanguageCodes.DEFAULT;
      if (!LanguageCodes.SUPPORTED_LANGS.includes(lang)) {
        lang = LanguageCodes.DEFAULT;
      }
      postData[XMSocialIndexable.PROP_TEXT_LANG] = lang;

      // process poll props
      const postType = postData[XMSocialIndexable.PROP_POST_TYPE];
      const poll = postData[XMSocialIndexable.PROP_POLL];
      if (postType === PTYPE_POLL && !Util.ObjectIsEmpty(poll)) {
        const opts = poll[XMSocialIndexable.PROP_POLL_OPTIONS] || [];
        const optMap = {};
        opts.forEach((opt, index) => {
          optMap[index] = opt;
        });
        poll[XMSocialIndexable.PROP_POLL_OPTIONS] = optMap;
      } else {
        delete postData[XMSocialIndexable.PROP_POLL];
      }

      // Assert content
      const [vedict, assertErr] = await PostHelper.AssertPostUpdate(apiContext, postData, options.scope, options.frontModeration);
      if (!vedict) {
        throw assertErr;
      }

      // Filter illegal props and set system post props
      const userId = apiContext.getUsername();
      postObj.setData(XObject.GetObjectFields(postData, options.scope || XMSocialIndexable.POST_CREATION_PROPS));
      postObj._setTypeID(ModelType.POST);
      postObj.setOwnerId(userId);
      postObj.setCreatedTS(Date.now());
      postObj.setUpdatedTS(Date.now());
      postObj.setTextLanguage(lang);

      let postId = postObj.getId();
      if (postId == null) {
        postId = await PostService.GetUniquePostId();
        postObj._setId(postId);
      }

      try {
        await ImageHelper.ProcessPostImages(postObj, imageFiles, videoFile);
      } catch (err) {
        // What to do if image processing fails? We can't abort...
        logger.error('error', { err, _m });
      }

      savedPostObj = await PostHelper.SavePost(apiContext, postObj);
    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    const postType = XMPost.GetObjectField(savedPostObj, XMSocialIndexable.PROP_POST_TYPE);
    if (!ecode && postType === ModelType.VISION_POST) {
      // Update vision sound stats
      (soundIds || []).forEach((id) => {
        SoundStatHelper.IncSoundStatsCounter(id, StatsProps.VISION_ACCESSORY_USED)
          .catch(err => logger.error('error', { err, _m }));
      });

      // Update vision sticker stats
      (stickerIds || []).forEach((id) => {
        StickerStatHelper.IncStickerStatsCounter(id, StatsProps.VISION_ACCESSORY_USED)
          .catch(err => logger.error('error', { err, _m }));
      });
    }

    // write act_log
    let postLogs;
    await (async () => {
      try {
        const requestorUserInfo = apiContext.getUserInfo();
        const requestorId = apiContext.getAuthenticatedUserId();
        const postId = postObj ? postObj.getId() : null;
        const ownerId = postObj ? postObj.getOwnerId() : null;
        const postTs = postObj ? postObj.getCreatedTS() : null;
        const targetObject = postObj;
        // const subsetUserInfo = ServiceUtil.SubsetSrcObj(userInfo, [UserProps.NICKNAME, UserProps.ICON_URL]);
        const subsetUserInfo = ServiceUtil.SubsetSrcObj(requestorUserInfo, [...UserProps.PUBLIC_PROPS, UserProps.SOCIAL_SYNC_CONFIGS]);
        // add IP info
        subsetUserInfo[APIContext.USER_IP] = apiContext ? apiContext.getUserIP() : null;

        // check twitter sync allowed & flag
        const twitterSyncConfigs = XUserInfo.GetSocialSyncConfigs(subsetUserInfo, SITE_TWITTER, {});
        if (Util.toNumber(twitterSyncConfigs[SocialSyncProps.ALLOWED]) === 1 && Util.toNumber(twitterSyncConfigs[SocialSyncProps.SYNC_FLAG]) === 1) {
          subsetUserInfo[UserProps.TWITTER_SYNC_FLAG] = 1;
        }

        postLogs = await ActivityLogger.UserPublishesPost(subsetUserInfo, targetObject) || [];
        postLogs.forEach((postLog) => {
          if (apiContext) {
            apiContext.updateActivityLog(postLog, ecode);
          }
        });

        // activity log for individual mentions
        const mentionLogs = await PostActivityHelper.GeneratePostMentionsLogs(postId, ownerId, postTs, usertags);
        await DownStream.SubmitLogs([...postLogs, ...mentionLogs]); // async

        /**
         * Mar 31 ddm - add to user's non timeline feed at backend to avoid delay
         */
        if (savedPostObj) {
          PostActivityHelper.AddToUserAllFeeds(
            requestorId,
            postId,
            postLogs[0],
            {
              [postId]: savedPostObj,
            });

          // Live stream post
          if (options.livePost) {
            const isPublicLiveUser = await RedisUtil.IsSetMember(StorageManager.GetInstance().getSystemCache(), PUBLIC_LIVE_USERS, requestorId);

            if (isPublicLiveUser) {
              PostActivityHelper.AddToLiveNowFeed(
                requestorId,
                lang,
                postLogs[0]
              );

              PostActivityHelper.AddToLiveNowFeed(
                requestorId,
                LanguageCodes.ALL,
                postLogs[0]
              );
            }

            // Add in all cases for moderation purposes and user explore
            PostActivityHelper.AddToLiveNowFeed(
              requestorId,
              'mod',
              postLogs[0]
            );

            const categories = XUserInfo.GetLiveConfigCategories(requestorUserInfo);
            if (!Util.ArrayIsEmpty(categories)) {
              for (const c of categories) {
                PostActivityHelper.AddToLiveNowFeed(
                  requestorId,
                  c.trim().toLowerCase(),
                  postLogs[0]
                );
              }
            }

          }
        }
      } catch (logErr) {
        logger.error('Write act log error.', { err: logErr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return savedPostObj;
  } // SubmitPost

  /**
   * Update contents of a Live Stream Post. Restricted to Live Stream Post ONLY!
   *
   * @param {APIContext} apiContext
   * @param {string} postId
   * @param {{}} changes
   * @return {XMPost} saved object (?)
   *
   * @see ~SubmitRepost
   */
  static async UpdateLiveStreamPost(apiContext, postId, changes = {}, options = {}) {
    const _m = 'UpdateLiveStreamPost';
    if (!ObjectBase.AssertArrayNoNulls([apiContext, postId], _CLSNAME)) {
      throw EC.API_BAD_PARAMS('Null params.');
    }
    const requestorInfo = apiContext.getUserInfo();
    const requestorId = apiContext.getAuthenticatedUserId();

    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    let ecode, updatedPostObj, postObj;
    try {
      postObj = await PostHelper.LoadPost(postId);
      const postType = XMPost.GetObjectField(postObj, XMSocialIndexable.PROP_POST_TYPE);
      const streamId = XMPost.GetObjectField(postObj, XMSocialIndexable.PROP_STREAM_ID);
      if (postType !== PTYPE_STREAM || Util.StringIsEmpty(streamId)) {
        throw EC.API_BAD_DATA('post is not a live post', postType, streamId);
      }
      if (!Util.StringIsEmpty(changes.ttl) && changes.ttl.length > LIVE_POST_TITLE_MAX_LENGTH) {
        changes.ttl = changes.ttl.substr(0, LIVE_POST_TITLE_MAX_LENGTH);
      }

      if (!Util.ObjectIsEmpty(options) && Util.toBoolean(options.byAdmin)) {
        const latestRequestorInfo = await UserInfoHelper.ReloadUserInfoById(requestorId); // make sure it's the latest userInfo
        const permit = XUserInfo.HasAdminRole(latestRequestorInfo)
          || XUserInfo.HasRole(latestRequestorInfo, UserProps.ROLE_LIVEADM)
          || XUserInfo.HasRole(latestRequestorInfo, UserProps.ROLE_LIVEMOD);
        if (!permit) {
          throw EC.POST_OWNER_NO_MATCH('user and post owner do not match');
        }
      } else {
        await AppService.CheckUserCanPOST(requestorInfo, postObj);
      }

      // Assert props
      changes = ServiceUtil.FilterScriptForObj(changes, XMSocialIndexable.POST_CREATION_PROPS);

      // Assert content
      const [vedict, assertErr] = await PostHelper.AssertPostUpdate(apiContext, changes, options.scope || XMSocialIndexable.LIVEPOST_USER_MUTABLE_PROPS, options.frontModeration, true);
      if (!vedict) {
        throw assertErr;
      }

      // detect language
      if (changes[XMSocialIndexable.PROP_TEXT]) {
        const langCode = await ServiceUtil.DetectLanguage(changes[XMSocialIndexable.PROP_TEXT]);
        changes[XMSocialIndexable.PROP_TEXT_LANG] = langCode || LanguageCodes.DEFAULT;
      }

      if (!Util.ObjectIsEmpty(changes)) {
        updatedPostObj = await PostHelper.UpdatePost(apiContext, postObj, changes);
      } else {
        updatedPostObj = postObj;
      }
    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    // write act_log
    await (async () => {
      try {
        const targetObject = updatedPostObj;
        const subsetUserInfo = ServiceUtil.SubsetSrcObj(requestorInfo, UserProps.PUBLIC_PROPS);
        // add IP info
        XObject.SetObjectField(subsetUserInfo, APIContext.USER_IP, apiContext.getUserIP());
        const postLogs = await ActivityLogger.UserUpdatesPost(subsetUserInfo, targetObject) || [];
        postLogs.forEach((postLog) => {
          if (apiContext) {
            apiContext.updateActivityLog(postLog, ecode);
          }
        });

        await DownStream.SubmitLogs(postLogs); // async

        /**
         * Mar 31 ddm - add to user's non timeline feed at backend to avoid delay
         */
        if (updatedPostObj) {
          PostActivityHelper.AddToUserAllFeeds(
            requestorId,
            postId,
            postLogs[0],
            {
              [postId]: updatedPostObj,
            });
        }
      } catch (logErr) {
        logger.error('Write act log error.', { err: logErr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return updatedPostObj;
  } // UpdateLiveStreamPost


  /**
   * Submit a Repost of a POST or COMMENT for update.
   *
   * Repost is basically a regular post submission but references another
   * post. Except that share/shareby relationship will be created as if
   * with the direct share.
   *
   * @param {APIContext} apiContext
   * @param {string} userId ID of user making the request
   * @param {XMPost} postObj containing user text but no ID assigned (or shouldn't)
   * @param {string[]} imageFiles array of image file locations
   * @return {XMPost} saved object (?)
   *
   * @see ~UserService.AddSharesPost()
   */
  static async SubmitRepost(apiContext, postObj, imageFiles = null, videoFile = null) {
    const _m = 'SubmitRepost';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    const requestorInfo = apiContext.getUserInfo();
    const requestorId = apiContext.getAuthenticatedUserId();

    const realShare = true;
    let newPostObj;
    let usertags;
    let hashtags;
    let ecode;
    try {
      // check write permission
      // await AppService.CheckUserCanWRITE(requestorInfo, postObj);
      await AppService.CheckUserCanPOST(requestorInfo, postObj);

      // Update user star status
      await InfluencerService.UpdateUserPopularity(requestorInfo);

      const origPostId = postObj.getOriginalPostId();

      // Check permissions to original post
      let origPostInfo;
      if (origPostId) {
        origPostInfo = await PostInfoHelper.GetPostInfo(origPostId);
      }

      // Check if original post is deleted
      if (origPostInfo && XPostInfo.IsDeleted(origPostInfo)) {
        const isPost = origPostId.startsWith(PREFIX_POST_ID);
        const isComment = origPostId.startsWith(PREFIX_COMMENT_ID);
        if (isComment) { throw EC.COMMENT_DELETED('Comment is deleted', origPostId); } else { throw EC.POST_DELETED('Post is deleted', origPostId); }
      }

      await AppService.CheckUserCanREAD(requestorInfo, origPostInfo);

      // Assert comment props
      let postData = postObj['data'] ? postObj['data'] : null;

      // remove duplicate tags
      postData[XMSocialIndexable.PROP_HASHTAGS] = postData[XMSocialIndexable.PROP_HASHTAGS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_HASHTAGS].map(tag => tag.toLowerCase())) : null;

      usertags = postData[XMSocialIndexable.PROP_USERTAGS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_USERTAGS].map(tag => tag.toLowerCase())) : null;
      usertags = await UserHelper.ReplaceExistingUsernamesWithUserIds(usertags) || [];
      postData[XMSocialIndexable.PROP_USERTAGS] = usertags;

      // remove script
      postData = ServiceUtil.FilterScriptForObj(postData, XMSocialIndexable.POST_CREATION_PROPS);

      // detect language
      let langCode = await ServiceUtil.DetectLanguage(postData[XMSocialIndexable.PROP_TEXT]);
      langCode = Util.NormalizeLanguage(langCode) || LanguageCodes.DEFAULT;
      if (!LanguageCodes.SUPPORTED_LANGS.includes(langCode)) {
        langCode = LanguageCodes.DEFAULT;
      }
      postData[XMSocialIndexable.PROP_TEXT_LANG] = langCode;

      // Assert post data
      const [vedict, assertResult] = await PostHelper.AssertPostUpdate(apiContext, postData);
      if (!vedict) {
        throw assertResult;
      }

      // Filter illegal props and set post system props
      const userId = apiContext.getUsername();
      postObj.setData(XObject.GetObjectFields(postData, XMSocialIndexable.POST_CREATION_PROPS));
      postObj._setTypeID(ModelType.POST);
      postObj.setOwnerId(userId);
      postObj.setCreatedTS(Date.now());
      postObj.setUpdatedTS(Date.now());
      postObj.setTextLanguage(langCode);

      let postId = postObj.getId();
      if (postId == null) {
        postId = await PostService.GetUniquePostId();
        postObj._setId(postId);
      }

      let origPosterId;
      if (origPostInfo) {
        origPosterId = origPostInfo.getOwnerId();
        postObj.setOriginalPostInfo(origPostId, origPosterId);
      }

      try {
        await ImageHelper.ProcessPostImages(postObj, imageFiles, videoFile);
      } catch (err) {
      // What to do if image processing fails? We can't abort...
        logger.error('error', { err, _m });
      }

      // Initially consider not a real share since repost is treated as a real post.
      // HOWEVER, I think it's worth giving credit to the original author.
      newPostObj = await PostHelper.SavePost(apiContext, postObj);

      // const [shareStatus, postShares] = origIsComment
      //   ? await SharesHelper.AddShareComment11(userId, origPostId)
      //   : await SharesHelper.AddSharePost11(userId, origPostId);

      // increase share count
      const origIsComment = origPostId.startsWith(PREFIX_COMMENT_ID);
      if (newPostObj) {
        const incrShareCounts = origIsComment ?
          [CommentStatHelper.IncUserSharesCommentCache(userId), CommentStatHelper.IncCommentSharedCache(origPostId)] :
          [PostStatHelper.IncUserSharesPostCache(userId), PostStatHelper.IncPostSharedCache(origPostId)];
        await Promise.all(incrShareCounts);
      }
    } catch (serr) {
      logger.error('error', { err: serr, _m });
      ecode = XError.FromError(serr);
    }

    // write act_log
    let postLogs;
    await (async () => {
      try {
        const requestorUserInfo = apiContext.getUserInfo();
        const postId = postObj ? postObj.getId() : null;
        const ownerId = postObj ? postObj.getOwnerId() : null;
        const postTs = postObj ? postObj.getCreatedTS() : null;
        const targetObject = postObj;
        // const subsetUserInfo = ServiceUtil.SubsetSrcObj(userInfo, [UserProps.NICKNAME, UserProps.ICON_URL]);
        const subsetUserInfo = ServiceUtil.SubsetSrcObj(requestorUserInfo, UserProps.PUBLIC_PROPS);
        // add IP info
        XObject.SetObjectField(subsetUserInfo, APIContext.USER_IP, apiContext.getUserIP());
        postLogs = await ActivityLogger.UserPublishesPost(subsetUserInfo, targetObject) || [];
        postLogs.forEach((postLog) => {
          if (apiContext) {
            apiContext.updateActivityLog(postLog, ecode);
          }
        });

        // activity log for individual mentions
        const mentionLogs = await PostActivityHelper.GeneratePostMentionsLogs(postId, ownerId, postTs, usertags);

        await DownStream.SubmitLogs([...postLogs, ...mentionLogs]); // async

        /**
         * Mar 31 ddm - add to user's non timeline feed at backend to avoid delay
         */
        if (newPostObj) {
          PostActivityHelper.AddToUserAllFeeds(
            requestorId,
            postId,
            postLogs[0],
            {
              [postId]: newPostObj,
            });
        }
      } catch (logErr) {
        logger.error('Write act log error.', { err: logErr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return newPostObj;
  } // SubmitRepost


  /**
   * Submit Comment for approval / update. This front-end for
   * SaveComment() can support for preparations (e.g., image conversions)
   * and any pre-approval process/workflow in the future.
   *
   * @param {APIContext} apiContext
   * @param {string} parentId post that this new comment is to be associated with.
   * post ID must start with 'p' (PREFIX_POST_ID), and comment ID must tart with 'c'.
   * @param {XMComment} commentObj containing user text but no ID assigned (or shouldn't)
   * @param {string[]} imageFiles array of image file locations
   * @return {XMComment} saved object (?)
   */
  static async SubmitComment(apiContext, parentId, commentObj, imageFiles = null, videoFile = null) {
    const _m = 'SubmitComment';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    const requestorInfo = apiContext ? apiContext.getUserInfo() : null;
    const requestorId = apiContext ? apiContext.getAuthenticatedUserId() : null;

    let ecode;
    let usertags;
    let hashtags;
    let savedCommentObj;
    let parentPostInfo;
    try {
      if (!PostService.AssertArrayNoNulls([parentId, commentObj])) {
        throw EC.SYS_BAD_ARGS('Null input');
      }
      if (!PostHelper.ValidPostOrCommentIdCheck(parentId)) {
        throw EC.SYS_BAD_ARGS('Bad Id');
      }

      // Check if user is blocked
      parentPostInfo = await PostInfoHelper.GetPostInfo(parentId);
      const parentOwnerId = parentPostInfo ? parentPostInfo.getOwnerId() : null;

      const isPost = parentId.startsWith(PREFIX_POST_ID);
      const isComment = parentId.startsWith(PREFIX_COMMENT_ID);
      // const parentType = isPost ? ModelType.POST : ModelType.COMMENT;

      // Check Permissions
      await AppService.CheckUserCanCOMMENT(requestorInfo, commentObj, parentPostInfo)
        .catch((err) => {
          if (XError.GetCode(err) === RES_NOTFOUND) {
            if (isPost) { throw EC.POST_DELETED(err.message); }
            if (isComment) { throw EC.COMMENT_DELETED(err.message); }
          }
          throw err;
        });
      await AppService.CheckUserCanREAD(requestorInfo, parentPostInfo);

      // Assert comment props
      let commentData = commentObj['data'] ? commentObj['data'] : null;

      // remove duplicate tags
      commentData[XMSocialIndexable.PROP_HASHTAGS] = commentData[XMSocialIndexable.PROP_HASHTAGS] ? Util.UniqueArray(commentData[XMSocialIndexable.PROP_HASHTAGS].map(tag => tag.toLowerCase())) : null;

      usertags = commentData[XMSocialIndexable.PROP_USERTAGS] ? Util.UniqueArray(commentData[XMSocialIndexable.PROP_USERTAGS].map(tag => tag.toLowerCase())) : null;
      usertags = await UserHelper.ReplaceExistingUsernamesWithUserIds(usertags) || [];
      commentData[XMSocialIndexable.PROP_USERTAGS] = usertags;

      // remove script
      commentData = ServiceUtil.FilterScriptForObj(commentData, XMSocialIndexable.POST_CREATION_PROPS);

      // detect language
      let langCode = await ServiceUtil.DetectLanguage(commentData[XMSocialIndexable.PROP_TEXT]);
      langCode = Util.NormalizeLanguage(langCode) || LanguageCodes.DEFAULT;
      if (!LanguageCodes.SUPPORTED_LANGS.includes(langCode)) {
        langCode = LanguageCodes.DEFAULT;
      }
      commentData[XMSocialIndexable.PROP_TEXT_LANG] = langCode;

      // Assert commentData
      const [vedict, assertResult] = await PostHelper.AssertPostUpdate(apiContext, commentData);
      if (!vedict) {
        throw assertResult;
      }

      //  Filter illegal props and set comment system props
      const userId = apiContext.getUsername();
      commentObj.setData(XObject.GetObjectFields(commentData, XMSocialIndexable.POST_CREATION_PROPS));
      commentObj._setTypeID(ModelType.COMMENT);
      commentObj.setOwnerId(userId);
      commentObj.setCreatedTS(Date.now());
      commentObj.setUpdatedTS(Date.now());
      commentObj.setTextLanguage(langCode);

      let commentId = commentObj.getId();
      if (commentId) {
        logger.warn('Comment object not suppose to have assigned Id; overriding', { _m });
        commentId = null;
      }
      const postId = commentObj.getPostId();
      if (isPost && (postId !== parentId)) {
        throw EC.SYS_BAD_ARGS(`parent postId: ${parentId} != ${postId}`);
      }

      const pCommentId = commentObj.getParentCommentId();
      if (pCommentId && (pCommentId !== parentId)) {
        throw EC.SYS_BAD_ARGS(`parent commentId: ${parentId} != ${pCommentId}`);
      }

      if (isComment && (pCommentId === null)) {
        commentObj.setParentCommentId(parentId);
      }

      const sm = StorageManager.GetInstance();
      // Check if comments still allowed for this post
      if (parentPostInfo.isCommentDisabled() === true) {
        throw EC.USER_NOT_ALLOWED(`Cannot add comment to (id=${parentId})`);
      }

      // Get parentPostInfo owner and add it to commentObj
      if (parentOwnerId) {
        commentObj.setParentOwnerId(parentOwnerId);
      }

      if (commentId == null) {
        commentId = await sm.getNextCommentID();
        commentObj._setId(commentId);
      }

      await ImageHelper.ProcessCommentImages(commentObj, imageFiles, videoFile);

      savedCommentObj = await CommentHelper.SaveComment(apiContext, commentObj);

      if (savedCommentObj) {
        if (isPost) {
          await PostStatHelper.IncCommentCountCache(parentId);
        } else if (isComment) {
          await CommentStatHelper.IncCommentCountCache(parentId);
        }
      }
    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    // write act_log
    let postLogs;
    await (async () => {
      try {
        const requestorUserInfo = apiContext.getUserInfo();
        const commentId = commentObj ? commentObj.getId() : null;
        const ownerId = commentObj ? commentObj.getOwnerId() : null;
        const commentTs = commentObj ? commentObj.getCreatedTS() : null;
        const targetObject = commentObj;
        // const subsetUserInfo = ServiceUtil.SubsetSrcObj(userInfo, [UserProps.NICKNAME, UserProps.ICON_URL]);
        const subsetUserInfo = ServiceUtil.SubsetSrcObj(requestorUserInfo, UserProps.PUBLIC_PROPS);
        // add IP info
        XObject.SetObjectField(subsetUserInfo, APIContext.USER_IP, apiContext.getUserIP());
        postLogs = await ActivityLogger.UserPublishesComment(subsetUserInfo, targetObject, parentPostInfo) || [];
        postLogs.forEach((postLog) => {
          if (apiContext) {
            apiContext.updateActivityLog(postLog, ecode);
          }
        });

        // activity log for individual mentions
        const mentionLogs = await PostActivityHelper.GeneratePostMentionsLogs(commentId, ownerId, commentTs, usertags);

        await DownStream.SubmitLogs([...postLogs, ...mentionLogs]); // async

        /**
         * Mar 31 ddm - add to user's non timeline feed at backend to avoid delay
         */
        if (savedCommentObj) {
          PostActivityHelper.AddToUserAllFeeds(
            requestorId,
            commentId,
            postLogs[0],
            {
              [commentId]: savedCommentObj,
            });
        }
      } catch (logErr) {
        logger.error('Write act log error.', { err: logErr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return savedCommentObj;
  } // SubmitComment

  static async TagPostable(apiContext, postableId, modTags) {
    const _m = 'TagPostable';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    const isPost = postableId.startsWith(PREFIX_POST_ID);
    const isComment = postableId.startsWith(PREFIX_COMMENT_ID);
    const ecode = null;

    if (!isPost && !isComment) {
      throw EC.API_BAD_PARAMS('invalid postable id');
    }

    const userInfo = apiContext.getUserInfo();
    if (!await AppService.CheckUserCanTAGPOSTABLE(userInfo)) {
      throw EC.RES_NOACCESS('Not have sufficient privilege');
    }

    const postableObj = await PostHelper.LoadPost(postableId);

    const type = isPost ? ModelType.POST : ModelType.COMMENT;
    const result = await PostHelper.UpdatePostableModerationTags(postableObj, type, modTags);
    const logs = isPost ? await ActivityLogger.TagPost(apiContext.getUserInfo(), postableObj) : await ActivityLogger.TagComment(apiContext.getUserInfo(), postableObj);

    // Generate activity log
    (async () => {
      try {
        apiContext.updateActivityLogs(logs, ecode);
        DownStream.SubmitLogs(logs)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (logError) {
        logger.error('Write act log error.', { err: logError, _m });
      }
    })();

    return result;
  } // TagPostable

  // --------------------- POST UPDATE -------------------------
  static async UpdatePost(apiContext, postId, changeObj = {}) {
    const _m = 'UpdatePost';

    let ecode, result;
    try {
      //Check permission
      let userInfo = apiContext.getUserInfo();
      let postObj = await PostHelper.LoadPost(postId);
      let postData = postObj.getData();
      await AppService.CheckUserCanPOST(userInfo, postObj);

      //Check expired
      let createdTS = postObj.getCreatedTS();
      let deltaTime = (Date.now() - createdTS);
      if(deltaTime > CHANGE_TXT_EXPIRED) {
        //throw ErrorCodes.EDIT_POST_EXPIRED('edit post expired.');
      }

      //Check limits
      let history = XMPost.GetObjectField(postObj, XMPost.PROP_TEXT_HISTORY, []);
      if (history.length >= CHANGE_TXT_MAX) {
        throw ErrorCodes.EDIT_POST_EXCEED_LIMITS('edit post exceed limits.');
      }

      // Remove script
      //changeObj = ServiceUtil.FilterScriptForObj(changeObj, XMSocialIndexable.POST_CREATION_PROPS);

      // Set txt_hist
      let oldText = postObj.getText();
      let oldTextLanguage = postObj.getTextLanguage();
      if(postData[XMPost.PROP_TEXT_HISTORY]) {
        changeObj[XMPost.PROP_TEXT_HISTORY] = JSON.parse(JSON.stringify(postData[XMPost.PROP_TEXT_HISTORY]));
      }
      XMPost.AddWord(changeObj, XMPost.PROP_TEXT_HISTORY, {
        txt: oldText,
        txt_lang: oldTextLanguage,
        retired: Date.now()
      });

      // Set txt_lang
      let lang = await ServiceUtil.DetectLanguage(changeObj[XMSocialIndexable.PROP_TEXT]);
      lang = Util.NormalizeLanguage(lang) || LanguageCodes.DEFAULT;
      if (!LanguageCodes.SUPPORTED_LANGS.includes(lang)) {
        lang = LanguageCodes.DEFAULT;
      }
      changeObj[XMPost.PROP_TEXT_LANG] = lang;

      // Assert content
      //const [vedict, assertErr] = await PostHelper.AssertPostUpdate(apiContext, postData, options.scope, options.frontModeration);

      result = await PostHelper.UpdatePost(apiContext, postObj, changeObj);
    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return result;
  }

  // --------------------- OBJECT DELETION -------------------------

  /**
   * Delete a post. This not just the post
   * itself, but all those that maybe "watching".
   *
   * NOTE: as of current, liked by will not be deleted.
   * Same with each user's "like"
   *
   * @param {string} postId
   * @param {*} callback
   *
   * @see ~SetDeletePost
   */
  static async DeletePermanentPost(apiContext, postId, callback) {
    const _m = 'DeletePermanentPost';

    // Should we delete, mark it as deleted, or move to deleted collection?
    const error = null;
    const result = await AppService.DeletePermanent(postId, ModelFolder.POST);

    // Delete from anyone watching... (not implemented)


    return callback ? callback(error, result) : result;
  }

  /**
   * Mark a post as "deleted"
   *
   * @param {APIContext} apiContext
   * @param {string} postId
   * @param {boolean} byAdmin user who is deleting it. (Not used as it's always going to be the logged in user)
   */
  static async SetDeletePost(apiContext, postId, byAdmin = false) {
    const _m = 'SetDeletePost';

    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    // Check permission
    const requestorId = apiContext.getAuthenticatedUserId();
    const requestorInfo = apiContext.getUserInfo();
    let postInfo;
    let ecode, deleted;
    try {
      // postInfo = await PostHelper.GetPostById(postId);
      postInfo = await PostInfoHelper.GetPostInfo(postId);
      if (!postInfo) {
        throw EC.API_BAD_DATA('invalid post.');
      }

      const postOwnerId = postInfo.getOwnerId();

      const postOwnerInfo = await UserInfoHelper.GetUserInfoById(postOwnerId);
      if (byAdmin) {
        if (!XUserInfo.HasAdminRole(requestorInfo)) {
          await AppService.CheckUserCanDELETE(requestorInfo, postOwnerInfo, postInfo);
        }
      } else {
        await AppService.CheckUserCanDELETE(requestorInfo, postOwnerInfo, postInfo);
      }

      const streamId = XPostInfo.GetObjectField(postInfo, XMSocialIndexable.PROP_STREAM_ID);
      if (!Util.StringIsEmpty(streamId)) {
        if (!Util.IsNull(XUserInfo.GetStreamingChannelByPost(postOwnerInfo, postId))) {
          throw EC.API_BAD_DATA('can\'t delete unfinished live post.');
        }
      }

      // Delete post
      deleted = await PostHelper.DeletePost(postId, false);

      // Delete live stream if there is any
      if (!Util.StringIsEmpty(streamId)) {
        // Async, no need to wait for live manager to return
        LiveStreamHelper.DeleteLiveStream(apiContext, streamId).catch((e) => {
          logger.error('error', { err: e, _m });
        });
      }
    } catch (rerr) {
      ecode = XError.FromError(rerr);
      logger.error('Failed to set delete post.', { err: rerr, postId, _m });
    }

    // Generate activity log
    if (deleted) {
      (async () => {
        try {
          const srcObj = ServiceUtil.SubsetSrcObj(requestorInfo, UserProps.PUBLIC_PROPS);
          XObject.SetObjectField(srcObj, APIContext.USER_IP, apiContext.getUserIP());
          const log = await ActivityLogger.UserDeletesPost(requestorInfo, postInfo, null);
          apiContext.updateActivityLogs(log, ecode);
          DownStream.SubmitLog(log);
        } catch (e) {
          logger.error('error', { err: e, _m });
        }
      })()
        .catch(err => logger.error('error', { err, _m }));
    }

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return true;
  } // SetDeletePost

  /**
   * Mark an comment as "deleted".
   *
   * TODO: copy to another place. For now, do permenant
   *
   * @param {APIContext} apiContext
   * @param {string} commentId
   * @param {boolean} byAdmin user who is deleting it. (not used)
   */
  static async SetDeleteComment(apiContext, commentId, byAdmin = false) {
    const _m = 'SetDeleteComment';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    const requestorInfo = apiContext.getUserInfo();
    let commentInfo;
    let commentOwnerInfo;
    let commentFeedsRemoveResult;
    let objectRemoveResult;
    let ecode;
    try {
      // commentInfo = await CommentHelper.GetCommentById(commentId);
      commentInfo = await PostInfoHelper.GetPostInfo(commentId);
      const commentOwnerId = commentInfo.getOwnerId();
      commentOwnerInfo = await UserInfoHelper.GetUserInfoById(commentOwnerId);

      // Check permission
      if (byAdmin) {
        if (!XUserInfo.HasAdminRole(requestorInfo)) {
          await AppService.CheckUserCanDELETE(requestorInfo, commentOwnerInfo, commentInfo);
        }
      } else {
        await AppService.CheckUserCanDELETE(requestorInfo, commentOwnerInfo, commentInfo);
      }

      objectRemoveResult = await CommentHelper.DeleteComment(commentId, false);
      commentFeedsRemoveResult = await CommentHelper.RemoveCommentFromFeeds(commentInfo);
      commentFeedsRemoveResult = await CommentHelper.RemoveCommentFromReplies(apiContext.getAuthenticatedUserId(), commentInfo);

      const targetId = XMComment.GetPostId(commentInfo);
      const isPost = targetId.startsWith(PREFIX_POST_ID);
      const isComment = targetId.startsWith(PREFIX_COMMENT_ID);
      if (isPost) {
        PostStatHelper.DecCommentCount(targetId);
      } else if (isComment) {
        CommentStatHelper.DecCommentCount(targetId);
      }
    } catch (err) {
      ecode = XError.FromError(err);
      logger.error('Failed to set delete comment.', { err, commentId, _m });
    }

    (async () => {
      try {
        const srcObj = ServiceUtil.SubsetSrcObj(requestorInfo, UserProps.PUBLIC_PROPS);
        XObject.SetObjectField(srcObj, APIContext.USER_IP, apiContext.getUserIP());
        const log = await ActivityLogger.UserDeletesComment(srcObj, commentInfo, null);
        apiContext.updateActivityLogs(log, ecode);
        DownStream.SubmitLog(log)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (e) {
        logger.error('Write act log error.', { err: e, _m });
      }
    })()
      .catch(err => logger.error('error', { err, _m }));

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return {
      objectRemoveResult,
      commentFeedsRemoveResult
    };
  } // SetDeleteComment

  // -------------------------- POST PINNING -------------------------

  /**
   * Pin a post
   *
   * @param {APIContext} apiContext should have access token of the requesting user
   * @param {string} userId user that the post will be pinned to
   * @param {string} postOwnerId post to pin to user
   *
   */
  static async PinPost(apiContext, userId, postId) {
    const _m = 'PinPost';

    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    const requestorId = apiContext.getAuthenticatedUserId();
    const requestorInfo = apiContext.getUserInfo();

    let xmPost = null;
    let postOwnerId;
    let errorObj = null;
    try {
      // Access Check. ID of user to pin post to must match logged in user Id, unless user has admin role or higher
      if (!AppService.RequestorMustBeUser(requestorInfo || requestorId, userId)) {
        throw EC.USER_NOT_ALLOWED('Pin to self only');
      }

      xmPost = await PostHelper.LoadPost(postId, null);
      if (Util.IsNull(xmPost) || XMPost.IsNotFound(xmPost)) {
        throw EC.RES_NOTFOUND(`Post Not Found (id=${postId})`);
      }
      postOwnerId = xmPost ? xmPost.getOwnerId() : null;

      // Must be own posts
      if (!AppService.RequestorMustBeUser(requestorInfo || requestorId, postOwnerId)) {
        throw EC.USER_NOT_ALLOWED('Post not owned by user');
      }
    } catch (loadError) {
      errorObj = loadError;
    }

    // OPTIONAL: Check if post actually exist
    // if (await PostHelper.PostExists(postId) === false) {
    //   throw EC.RES_NOTFOUND(`Post Not Found (id=${postId})`);
    // }

    let pinResult = false;
    if (errorObj === null) {
      try {
        pinResult = await PostHelper.PinPost(userId, postId);
      } catch (pinError) {
        logger.error('error', { err: pinError, _m });
        errorObj = pinError;
      }
    }

    // Generate activity log
    const ecode = errorObj ? XError.FromError(errorObj) : null;
    (async () => {
      try {
        const logs = await ActivityLogger.PinPost(requestorId, userId, postId, postOwnerId);
        apiContext.updateActivityLogs(logs, ecode);
        DownStream.SubmitLogs(logs)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (logError) {
        logger.error('Write act log error.', { err: logError, _m });
      }
    })();

    if (errorObj !== null) { throw errorObj; }
    return pinResult;
  } // PinPost

  /**
   * Unpin a post
   *
   * @param {APIContext} apiContext should have access token of the requesting user
   * @param {string} userId user that the post will be pinned to
   * @param {string} postOwnerId post to pin to user
   *
   */
  static async UnpinPost(apiContext, userId, postId) {
    const _m = 'UnpinPost';

    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    const requestorId = apiContext.getAuthenticatedUserId();
    const requestorInfo = apiContext.getUserInfo();

    let errorObj = null;
    // Access Check. ID of user to unpin post must match logged in user Id, unless user has admin role or higher
    if (!AppService.RequestorMustBeUser(requestorInfo, userId)) {
      errorObj = EC.USER_BAD_AUTH('Unpin to self only');
    }

    // try {
    //   xmPost = await PostHelper.LoadPost(postId, null);
    //   postOwnerId = xmPost ? xmPost.getOwnerId() : null;
    // } catch (loadError) {
    //   errorObj = loadError;
    // }

    let result = false;
    if (errorObj === null) {
      try {
        result = await PostHelper.UnpinPost(userId, postId);
      } catch (unpinError) {
        logger.error('error', { err: unpinError, _m });
        errorObj = unpinError;
      }
    }

    // Generate activity log
    const ecode = errorObj ? XError.FromError(errorObj) : null;
    (async () => {
      try {
        const logs = await ActivityLogger.UnpinPost(requestorId, userId, postId);
        apiContext.updateActivityLogs(logs, ecode);
        DownStream.SubmitLogs(logs)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (logError) {
        logger.error('error', { err: logError, _m });
      }
    })();

    if (errorObj !== null) { throw errorObj; }
    return result;
  } // UnpinPost


  // -------------------------- IMPORT POST ----------------------------

  /**
   * Submit Post for approval / update. This front-end for
   * saveObject() can support for preparations (e.g., image conversions)
   * and any pre-approval process/workflow in the future.
   *
   * @param {APIContext} apiContext
   * @param {string} userId ID of user making the request
   * @param {XMPost} postObj containing user text but no ID assigned (or shouldn't)
   * @param {string[]} imageFiles array of image file locations
   * @return {XMPost} saved object (?)
   *
   * @see ~ImportRepost
   */
  static async ImportPost(apiContext, postObj, imageFiles = null, videoFile = null) {
    const _m = 'ImportPost';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);
    // if (!apiContext.isAuthenticatedUser()) { throw ErrorCodes.USER_BAD_AUTH('Illegal User?'); }

    let ecode;
    let savedPostObj;
    let usertags;
    let hashtags;
    let posterId;
    let posterUserInfo;
    try {
    // Permission check
      const userInfo = apiContext.getUserInfo();
      await AppService.CheckUserCanIMPORTPOST(userInfo);

      // init poster info
      posterId = postObj ? postObj.getOwnerId() : null;
      posterUserInfo = await UserInfoHelper.GetUserInfoById(posterId);
      if (!posterUserInfo) {
        throw EC.USER_NOTFOUND('post owner not found');
      }

      // Assert comment props
      let postData = postObj['data'] ? postObj['data'] : null;

      // remove duplicate tags
      postData[XMSocialIndexable.PROP_HASHTAGS] = postData[XMSocialIndexable.PROP_HASHTAGS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_HASHTAGS].map(tag => tag.toLowerCase())) : null;

      usertags = postData[XMSocialIndexable.PROP_USERTAGS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_USERTAGS].map(tag => tag.toLowerCase())) : null;
      usertags = await UserHelper.ReplaceExistingUsernamesWithUserIds(usertags) || [];
      postData[XMSocialIndexable.PROP_USERTAGS] = usertags;

      // Remove scripts
      postData = ServiceUtil.FilterScriptForObj(postData, XMSocialIndexable.POST_CREATION_PROPS);

      // Assert post data
      const [vedict, errmsg] = await PostHelper.AssertPostImport(postData);
      if (!vedict) {
        throw EC.USER_BAD_INPUT(errmsg);
      }

      // generate prevurl preview
      const prevurl = postData[XMSocialIndexable.PROP_PREVIEW_URL];
      if (prevurl && !prevurl.startsWith('https://t.co/')
        && !prevurl.includes('twitter.com')
        && !postData[XMSocialIndexable.PROP_VIDEO_URL]
        && !postData[XMSocialIndexable.PROP_ORIG_VIDEO_URL]
        && !postData[XMSocialIndexable.PROP_IMAGE_URLS]) {
        await urlMetadata(prevurl)
          .then((result) => {
            postData[XMSocialIndexable.PROP_TITLE] = result.title;
            postData[XMSocialIndexable.PROP_DESC] = result.description;
            postData[XMSocialIndexable.PROP_PREVIEW_IMAGE_URL] = result.image;
          })
          .catch((err) => {
            logger.error('Error fetching url metadata.', { err, _m });
          });
      }

      // Filter illegal props and set system post props
      const userId = apiContext.getUsername();
      const pcreatedTS = postObj.getCreatedTS();
      const pupdatedTS = postObj.getUpdatedTS();
      postObj.setData(XObject.GetObjectFields(postData, XMSocialIndexable.POST_IMPORTABLE_PROPS));
      postObj._setTypeID(ModelType.POST);
      if (!pcreatedTS || pcreatedTS < 0) { postObj.setCreatedTS(Date.now()); }
      if (!pupdatedTS || pupdatedTS < 0) { postObj.setUpdatedTS(Date.now()); }

      // detect language
      const langCode = await ServiceUtil.DetectLanguage(postData[XMSocialIndexable.PROP_TEXT]);
      // const detectedLangs = langObj ? langObj.languages || [] : [];
      // const langCode = detectedLangs[0] ? detectedLangs[0].code : null;
      postObj.setTextLanguage(langCode);

      let postId = postObj.getId();
      if (postId == null) {
        postId = await PostService.GetUniquePostId();
        postObj._setId(postId);
      }

      await ImageHelper.ProcessPostImages(postObj, imageFiles, videoFile);

      savedPostObj = PostHelper.SavePost(apiContext, postObj);
    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    // write act_log
    let postLogs;
    await (async () => {
      try {
        const postId = postObj ? postObj.getId() : null;
        const ownerId = postObj ? postObj.getOwnerId() : null;
        const postTs = postObj ? postObj.getCreatedTS() : null;
        const targetObject = postObj;
        // const subsetUserInfo = ServiceUtil.SubsetSrcObj(userInfo, [UserProps.NICKNAME, UserProps.ICON_URL]);
        const subsetUserInfo = posterUserInfo ? ServiceUtil.SubsetSrcObj(posterUserInfo, UserProps.PUBLIC_PROPS) : {};
        // add IP info
        XObject.SetObjectField(subsetUserInfo, APIContext.USER_IP, apiContext.getUserIP());
        postLogs = await ActivityLogger.UserPublishesPost(subsetUserInfo, targetObject, postTs) || [];
        postLogs.forEach((postLog) => {
          if (apiContext) {
            apiContext.updateActivityLog(postLog, ecode);
          }
        });

        // activity log for individual mentions
        const mentionLogs = await PostActivityHelper.GeneratePostMentionsLogs(postId, ownerId, postTs, usertags);

        await DownStream.SubmitLogs([...postLogs, ...mentionLogs]); // async

        /**
         * Mar 31 ddm - add to user's non timeline feed at backend to avoid delay
         */
        if (savedPostObj) {
          PostActivityHelper.AddToUserAllFeeds(
            posterId,
            postId,
            postLogs[0],
            {
              [postId]: savedPostObj,
            });
        }
      } catch (logErr) {
        logger.error('Write act log error.', { err: logErr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return savedPostObj;
  } // ImportPost


  /**
   * Submit a Repost for approval / update. This front-end for
   * saveObject() can support for preparations (e.g., image conversions)
   * and any pre-approval process/workflow in the future.
   *
   * Repost is basically a regular post submission but references another
   * post.Except that share/shareby relationship will be created as if
   * with the direct share.
   *
   * @param {APIContext} apiContext
   * @param {string} userId ID of user making the request
   * @param {XMPost} postObj containing user text but no ID assigned (or shouldn't)
   * @param {string[]} imageFiles array of image file locations
   * @return {XMPost} saved object (?)
   *
   * @see ~UserService.AddSharesPost()
   */
  static async ImportRepost(apiContext, postObj, imageFiles = null, videoFile = null) {
    const _m = 'ImportRepost';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);


    const realShare = true;
    let newPostObj;
    let usertags;
    let hashtags;
    let posterId;
    let posterUserInfo;
    let ecode;
    try {
      // Permission check
      const userId = apiContext.getUsername();
      const userInfo = apiContext.getUserInfo();
      await AppService.CheckUserCanIMPORTPOST(userInfo);

      // init poster info
      posterId = postObj ? postObj.getOwnerId() : null;
      posterUserInfo = await UserInfoHelper.GetUserInfoById(posterId);
      if (!posterUserInfo) {
        throw EC.USER_NOTFOUND('post owner not found');
      }

      // Assert comment props
      let postData = postObj['data'] ? postObj['data'] : null;

      // remove duplicate tags
      postData[XMSocialIndexable.PROP_HASHTAGS] = postData[XMSocialIndexable.PROP_HASHTAGS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_HASHTAGS].map(tag => tag.toLowerCase())) : null;

      usertags = postData[XMSocialIndexable.PROP_USERTAGS] ? Util.UniqueArray(postData[XMSocialIndexable.PROP_USERTAGS].map(tag => tag.toLowerCase())) : null;
      usertags = await UserHelper.ReplaceExistingUsernamesWithUserIds(usertags) || [];
      postData[XMSocialIndexable.PROP_USERTAGS] = usertags;

      // Remove scripts
      postData = ServiceUtil.FilterScriptForObj(postData, XMSocialIndexable.POST_CREATION_PROPS);

      // Assert post data
      const [vedict, errmsg] = await PostHelper.AssertPostImport(postData);
      if (!vedict) {
        throw EC.USER_BAD_INPUT(errmsg);
      }

      // Filter illegal props and set post system props
      const pcreatedTS = postObj.getCreatedTS();
      const pupdatedTS = postObj.getUpdatedTS();
      postObj.setData(XObject.GetObjectFields(postData, XMSocialIndexable.POST_IMPORTABLE_PROPS));
      postObj._setTypeID(ModelType.POST);
      if (!pcreatedTS || pcreatedTS < 0) {
        postObj.setCreatedTS(Date.now());
      }
      if (!pupdatedTS || pupdatedTS < 0) {
        postObj.setUpdatedTS(Date.now());
      }

      // detect language
      const langCode = await ServiceUtil.DetectLanguage(postData[XMSocialIndexable.PROP_TEXT]);
      // const detectedLangs = langObj ? langObj.languages || [] : [];
      // const langCode = detectedLangs[0] ? detectedLangs[0].code : null;
      postObj.setTextLanguage(langCode);

      let postId = postObj.getId();
      try {
        if (postId == null) {
          postId = await PostService.GetUniquePostId();
          postObj._setId(postId);
        }
      } catch (err) {
        logger.error('error', { err, _m });
      }
      const origPostId = postObj.getOriginalPostId();
      let origPosterId;
      let origPostInfo;

      if (origPostId) {
        origPostInfo = await PostInfoHelper.GetPostInfo(origPostId);
      }
      if (origPostInfo) {
        origPosterId = origPostInfo.getOwnerId();
        postObj.setOriginalPostInfo(origPostId, origPosterId);
      }

      await ImageHelper.ProcessPostImages(postObj, imageFiles, videoFile);

      // Initially consider not a real share since repost is treated as a real post.
      // HOWEVER, I think it's worth giving credit to the original author.
      newPostObj = await PostHelper.SavePost(apiContext, postObj);

      const origIsComment = origPostId.startsWith(PREFIX_COMMENT_ID);
      if (newPostObj) {
        const incrShareCounts = origIsComment ?
          [CommentStatHelper.IncUserSharesCommentCache(posterId), CommentStatHelper.IncCommentSharedCache(origPostId)] :
          [PostStatHelper.IncUserSharesPostCache(posterId), PostStatHelper.IncPostSharedCache(origPostId)];
        await Promise.all(incrShareCounts);
      }
    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    // write act_log
    let postLogs;
    await (async () => {
      try {
        const postId = postObj ? postObj.getId() : null;
        const ownerId = postObj ? postObj.getOwnerId() : null;
        const postTs = postObj ? postObj.getCreatedTS() : null;
        const targetObject = postObj;
        // const subsetUserInfo = ServiceUtil.SubsetSrcObj(userInfo, [UserProps.NICKNAME, UserProps.ICON_URL]);
        const subsetUserInfo = ServiceUtil.SubsetSrcObj(posterUserInfo, UserProps.PUBLIC_PROPS);
        // add IP info
        XObject.SetObjectField(subsetUserInfo, APIContext.USER_IP, apiContext.getUserIP());
        postLogs = await ActivityLogger.UserPublishesPost(subsetUserInfo, targetObject, postTs) || [];
        postLogs.forEach((postLog) => {
          if (apiContext) {
            apiContext.updateActivityLog(postLog, ecode);
          }
        });

        // activity log for individual mentions
        const mentionLogs = await PostActivityHelper.GeneratePostMentionsLogs(postId, ownerId, postTs, usertags);

        await DownStream.SubmitLogs([...postLogs, ...mentionLogs]); // async

        /**
         * Mar 31 ddm - add to user's non timeline feed at backend to avoid delay
         */
        if (newPostObj) {
          PostActivityHelper.AddToUserAllFeeds(
            posterId,
            postId,
            postLogs[0],
            {
              [postId]: newPostObj,
            });
        }
      } catch (logErr) {
        logger.error('Write act log error.', { err: logErr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return newPostObj;
  } // SubmitRepost


  /**
   * Submit Comment for approval / update. This front-end for
   * SaveComment() can support for preparations (e.g., image conversions)
   * and any pre-approval process/workflow in the future.
   *
   * @param {APIContext} apiContext
   * @param {string} parentId post that this new comment is to be associated with.
   * post ID must start with 'p' (PREFIX_POST_ID), and comment ID must tart with 'c'.
   * @param {XMComment} commentObj containing user text but no ID assigned (or shouldn't)
   * @param {string[]} imageFiles array of image file locations
   * @return {XMComment} saved object (?)
   */
  static async ImportComment(apiContext, parentId, commentObj, imageFiles = null, videoFile = null) {
    const _m = 'ImportComment';
    if (!PostService.AssertArrayNoNulls([parentId, commentObj])) {
      throw EC.SYS_BAD_ARGS('Null input');
    }
    if (!PostHelper.ValidPostOrCommentIdCheck(parentId)) {
      throw EC.SYS_BAD_ARGS('Bad Id');
    }

    let ecode;
    let usertags;
    let hashtags;
    let savedCommentObj;
    let parentPostInfo;
    let posterId;
    let posterUserInfo;
    try {
      // Permission check
      const userInfo = apiContext.getUserInfo();
      await AppService.CheckUserCanIMPORTPOST(userInfo);

      // init poster info
      posterId = commentObj ? commentObj.getOwnerId() : null;
      posterUserInfo = await UserInfoHelper.GetUserInfoById(posterId);
      if (!posterUserInfo) {
        throw EC.USER_NOTFOUND('post owner not found');
      }

      const isPost = parentId.startsWith(PREFIX_POST_ID);
      const isComment = parentId.startsWith(PREFIX_COMMENT_ID);
      let parentType;
      if (isPost) {
        parentType = ModelType.POST;
      } else if (isComment) {
        parentType = ModelType.COMMENT;
      } else {
        throw EC.USER_BAD_INPUT('invalid parent type');
      }

      // Assert comment props
      let commentData = commentObj['data'] ? commentObj['data'] : null;

      // remove duplicate tags
      commentData[XMSocialIndexable.PROP_HASHTAGS] = commentData[XMSocialIndexable.PROP_HASHTAGS] ? Util.UniqueArray(commentData[XMSocialIndexable.PROP_HASHTAGS].map(tag => tag.toLowerCase())) : null;

      usertags = commentData[XMSocialIndexable.PROP_USERTAGS] ? Util.UniqueArray(commentData[XMSocialIndexable.PROP_USERTAGS].map(tag => tag.toLowerCase())) : null;
      usertags = await UserHelper.ReplaceExistingUsernamesWithUserIds(usertags) || [];
      commentData[XMSocialIndexable.PROP_USERTAGS] = usertags;

      // Remove scripts
      commentData = ServiceUtil.FilterScriptForObj(commentData, XMSocialIndexable.POST_CREATION_PROPS);

      // Assert post data
      const [vedict, errmsg] = await PostHelper.AssertPostImport(commentData);
      if (!vedict) {
        throw EC.USER_BAD_INPUT(errmsg);
      }

      // generate prevurl preview
      const prevurl = commentData[XMSocialIndexable.PROP_PREVIEW_URL];
      if (prevurl && !prevurl.includes('t.co')
          && !prevurl.includes('twitter.com')
          && !commentData[XMSocialIndexable.PROP_VIDEO_URL]
          && !commentData[XMSocialIndexable.PROP_ORIG_VIDEO_URL]
          && !commentData[XMSocialIndexable.PROP_IMAGE_URLS]) {
        await urlMetadata(prevurl)
          .then((result) => {
            commentData[XMSocialIndexable.PROP_TITLE] = result.title;
            commentData[XMSocialIndexable.PROP_DESC] = result.description;
            commentData[XMSocialIndexable.PROP_PREVIEW_IMAGE_URL] = result.image;
          })
          .catch((err) => {
            logger.error('Error fetching url metadata.', { err, _m });
          });
      }

      //  Filter illegal props and set comment system props
      const pcreatedTS = commentObj.getCreatedTS();
      const pupdatedTS = commentObj.getUpdatedTS();
      commentObj.setData(XObject.GetObjectFields(commentData, XMSocialIndexable.POST_IMPORTABLE_PROPS));
      commentObj._setTypeID(ModelType.COMMENT);
      if (!pcreatedTS || pcreatedTS < 0) {
        commentObj.setCreatedTS(Date.now());
      }
      if (!pupdatedTS || pupdatedTS < 0) {
        commentObj.setUpdatedTS(Date.now());
      }

      // detect language
      const langCode = await ServiceUtil.DetectLanguage(commentData[XMSocialIndexable.PROP_TEXT]);
      // const detectedLangs = langObj ? langObj.languages || [] : [];
      // const langCode = detectedLangs[0] ? detectedLangs[0].code : null;
      commentObj.setTextLanguage(langCode);

      let commentId = commentObj.getId();
      if (commentId) {
        logger.warn('Comment object not suppose to have assigned Id; overriding', { _m });
        commentId = null;
      }
      const postId = commentObj.getPostId();
      if (isPost && (postId !== parentId)) {
        throw EC.SYS_BAD_ARGS(`parent postId: ${parentId} != ${postId}`);
      }

      const pCommentId = commentObj.getParentCommentId();
      if (pCommentId && (pCommentId !== parentId)) {
        throw EC.SYS_BAD_ARGS(`parent commentId: ${parentId} != ${pCommentId}`);
      }

      if (!isPost && (pCommentId === null)) {
        commentObj.setParentCommentId(parentId);
      }

      const sm = StorageManager.GetInstance();
      parentPostInfo = await PostInfoHelper.GetPostInfo(parentId);
      // parentPostInfo = await AppService.LoadXObject(parentId, parentType, null);

      // Check if comments still allowed for this post
      if (parentPostInfo.isCommentDisabled() === true) {
        throw EC.USER_NOT_ALLOWED(`Cannot add comment to ${parentType} (id=${parentId})`);
      }

      // Get parentPostInfo owner and add it to commentObj
      const parentOwnerId = parentPostInfo.getOwnerId();
      if (parentOwnerId) {
        commentObj.setParentOwnerId(parentOwnerId);
      }

      if (commentId == null) {
        commentId = await sm.getNextCommentID();
        commentObj._setId(commentId);
      }

      await ImageHelper.ProcessCommentImages(commentObj, imageFiles, videoFile);

      savedCommentObj = CommentHelper.SaveComment(apiContext, commentObj);

      if (savedCommentObj) {
        if (isPost) {
          await PostStatHelper.IncCommentCountCache(parentId);
        } else if (isComment) {
          await CommentStatHelper.IncCommentCountCache(parentId);
        }
      }
    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    // write act_log
    let postLogs;
    await (async () => {
      try {
        const commentId = commentObj ? commentObj.getId() : null;
        const ownerId = commentObj ? commentObj.getOwnerId() : null;
        const commentTs = commentObj ? commentObj.getCreatedTS() : null;
        const targetObject = commentObj;
        // const subsetUserInfo = ServiceUtil.SubsetSrcObj(userInfo, [UserProps.NICKNAME, UserProps.ICON_URL]);
        const subsetUserInfo = ServiceUtil.SubsetSrcObj(posterUserInfo, UserProps.PUBLIC_PROPS);
        // add IP info
        XObject.SetObjectField(subsetUserInfo, APIContext.USER_IP, apiContext.getUserIP());
        postLogs = await ActivityLogger.UserPublishesComment(subsetUserInfo, targetObject, parentPostInfo, commentTs) || [];
        postLogs.forEach((postLog) => {
          if (apiContext) {
            apiContext.updateActivityLog(postLog, ecode);
          }
        });

        // activity log for individual mentions
        const mentionLogs = await PostActivityHelper.GeneratePostMentionsLogs(commentId, ownerId, commentTs, usertags);

        await DownStream.SubmitLogs([...postLogs, ...mentionLogs]); // async

        /**
         * Mar 31 ddm - add to user's non timeline feed at backend to avoid delay
         */
        if (savedCommentObj) {
          PostActivityHelper.AddToUserAllFeeds(
            posterId,
            commentId,
            postLogs[0],
            {
              [commentId]: savedCommentObj,
            });
        }
      } catch (logErr) {
        logger.error('Write act log error.', { err: logErr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return savedCommentObj;
  } // SubmitComment


  // -------------------------- POST LIKED ----------------------------

  /**
   * Async load user "like" list associated post (XMLikedPost)
   *
   * @param {string} postId lookup likes of this post
   * @param {*} defaultVal if object not found
   *
   * @return {XMLikedPost} userId list associated with post
   */
  static async LoadLikedPost(postId, defaultVal = null) {
    // const _m = "PostService.loadLikedPost";
    const sm = StorageManager.GetInstance();
    const promise = new Promise((resolve, reject) => {
      sm.findObjectByID(XMLikedPost.GetFolderName(), postId, null, (err, jsonObj) => {
        if (err) {
          if (EC.Is(err, RES_NOTFOUND)) {
            return resolve(defaultVal);
          }
          return reject(err);
        }
        const xmLiked = XMLikedPost.Wrap(jsonObj);
        resolve(xmLiked);
      });
    });
    const result = await promise;
    return result;
  } // loadLikedPost

  /**
   * Return a list of userIds that liked the given post
   *
   * @param {string} postId
   * @param {XMLikedPost} userIds liked this post
   */
  static async GetLikedPost(postId, defaultVal = null) {
    const likedPost = await PostService.LoadLikedPost(postId);

    return likedPost || defaultVal;
  } // getLikedPost

  static async GetPostLikedBy(apiContext, postId, defaultVal = null, queryOptions = { offset: 0, max: 10, expire: EXPIRE_TIME_FOR_LIKE }) {
    const _m = 'GetPostLikedBy';
    apiContext = AppService.AssertAPIContext(apiContext, false, _m);

    const xLikedby = await LikesHelper.LoadPostLikedBy(postId, null, queryOptions);

    return xLikedby || defaultVal;
  } // GetPostLikedBy

  /**
   * Return status of whether a user likes (or dislikes or..) a post
   *
   * @param {string} userId ID of user to check follows
   * @param {string} postId ID if user that might be followed by user
   * @param {string=} defaultVal STATUS_NOT_LIKED if null
   * @return {string} one of STATUS_* like STATUS_LIKED or STATUS_NOT_LIKED
   */
  static async GetLikeStatusPost(postId, userId, defaultVal = null) {
    if (defaultVal == null) { defaultVal = XMLikedPost.STATUS_NOT_LIKED; }

    // Loading entire XMFollows is not scalable right now, but neither is
    // storing in document! Can't hold millions (followers)
    const likedPost = await PostService.LoadLikedPost(postId);

    return likedPost ? likedPost.getLikeStatus(userId) : defaultVal;
  } // getLikeStatusPost

  // --------------------------- COMMENTS --------------------------------

  /**
   * Retrieve comment object, from cache first then database. Also
   * takes options to preload/piggyback auxillary data
   *
   * @param {string} commentId
   * @param {args} inclOptons preload: INCL_COMMENTSTATS|INCL_USERINFO,
   * and also can add INCL_POSTS and INCL_POSTSTATS for the associated post
   * @return {XMComment}
   */
  static async LoadComment(apiContext, commentId, inclOptions) {
    const _m = 'LoadComment';

    const requestorInfo = apiContext.getUserInfo();
    let xComment;
    let ecode;
    try {
      xComment = await CommentHelper.LoadComment(commentId, inclOptions, true, 1, apiContext);
      await AppService.CheckUserCanREAD(requestorInfo, xComment);

    } catch (loadError) {
      ecode = XError.FromError(loadError);
      logger.error('error', { err: loadError, _m });
    }

    // write act log
    (async () => {
      try {
        const srcObj = ServiceUtil.SubsetSrcObj(requestorInfo, UserProps.PUBLIC_PROPS);
        XObject.SetObjectField(srcObj, APIContext.USER_IP, apiContext.getUserIP());
        const log = await ActivityLogger.UserViewedComment(srcObj, xComment, null);
        apiContext.updateActivityLogs(log, ecode);
        DownStream.SubmitLog(log)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (e) {
        logger.error('Write act log error.', { err: e, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return xComment;
  } // LoadComment

  // -------------------------- COMMENT LIKED ----------------------------


  /**
   * Return a list of userIds that liked the comment.
   *
   * @param {string} commentId
   * @param {XMLikedComment} userIds liked this comment
   */
  static async GetLikedComment(apiContext, commentId, defaultVal = null, queryOptions = { offset: 0, max: 10 }) {
    const _m = 'GetLikedComment';
    apiContext = AppService.AssertAPIContext(apiContext, false, _m);
    const xLiked = await LikesHelper.LoadCommentLikedBy(commentId, null, queryOptions);

    return xLiked || defaultVal;
  } // getLikedComment

  static async GetCommentLikedby(apiContext, commentId, defaultVal = null, queryOptions = { offset: 0, max: 10, expire: EXPIRE_TIME_FOR_LIKE }) {
    const _m = 'GetCommentLikedby';
    apiContext = AppService.AssertAPIContext(apiContext, false, _m);

    const xLikedby = await LikesHelper.LoadCommentLikedBy(commentId, null, queryOptions);

    return xLikedby || defaultVal;
  } // getLikedComment

  /**
   * Return status of whether a user likes (or dislikes or..) a comment
   *
   * @param {string} userId ID of user to check follows
   * @param {string} commentId ID if user that might be followed by user
   * @param {string=} defaultVal STATUS_NOT_LIKED if null
   * @return {string} one of STATUS_* like STATUS_LIKED or STATUS_NOT_LIKED
   */
  static async GetLikeStatusComment(commentId, userId, defaultVal = null) {
    if (defaultVal == null) { defaultVal = XMLikedComment.STATUS_NOT_LIKED; }

    // Loading entire XMLikeStatusComment is not scalable right now, but neither is
    // storing in document! Can't hold millions (followers)
    const xLiked = await PostService.loadLikedComment(commentId);

    return xLiked ? xLiked.getLikeStatus(userId) : defaultVal;
  } // getLikeStatusComment


  // -------------------- SHARING POST -----------------------------

  /**
   * Async load "shared" container associated post (XMShared)
   *
   * @param {string} postId lookup shared container of this post
   * @param {*} defaultVal if object not found
   *
   * @return {XMSharedPost} userId list associated with post
   */
  static async LoadSharedPost(postId, defaultVal = null) {
    // const _m = "PostService.loadShared";
    const sm = StorageManager.GetInstance();
    const promise = new Promise((resolve, reject) => {
      sm.findObjectByID(COLL_SHARED_POST, postId, null, (err, jsonObj) => {
        if (err) {
          if (EC.Is(err, RES_NOTFOUND)) {
            return resolve(defaultVal);
          }
          return reject(err);
        }
        const xmObj = XMSharedPost.Wrap(jsonObj);
        resolve(xmObj);
      });
    });
    const result = await promise;
    return result;
  } // loadSharedPost

  /**
   * Return a list of userIds that shared the given post.
   *
   * @param {string} postId
   * @return {XMSharedPost} contains userIds that shared this post
   */
  static async GetSharedPost(postId, defaultVal = null) {
    const shared = await PostService.LoadSharedPost(postId);

    return shared || defaultVal;
  } // getSharedPost

  static async GetPostSharedBy(apiContext, postId, defaultVal = null, queryOptions = { offset: 0, max: 10, expire: EXPIRE_TIME_FOR_SHARE }) {
    const _m = 'GetPostSharedBy';
    apiContext = AppService.AssertAPIContext(apiContext, false, _m);

    const xSharedby = await SharesHelper.LoadPostSharedBy(postId, null, queryOptions);

    return xSharedby || defaultVal;
  } // GetPostSharedBy

  /**
   * Return status of whether a user shares (reposts) a post
   *
   * @param {string} userId ID of user to check follows
   * @param {string} postId ID if user that might be followed by user
   * @param {string=} defaultVal STATUS_NOT_SHARED if null
   * @return {string} one of STATUS_* like STATUS_SHARED or STATUS_NOT_SHARED
   */
  static async GetShareStatusPost(postId, userId, defaultVal = null) {
    if (defaultVal == null) { defaultVal = XMSharedPost.STATUS_NOT_SHARED; }

    const shared = await PostService.LoadSharedPost(postId);

    return shared ? shared.getShareStatus(userId) : defaultVal;
  } // getShareStatusPost

  // ---------------------- WATCHED POSTS -------------------------------------

  /**
   * Async load user "like" list associated post (XMLikedPost)
   *
   * @param {string} postId lookup likes of this post
   * @param {*} defaultVal if object not found
   *
   * @return {XMLikedPost} userId list associated with post
   */
  static async LoadWatchedPost(postId, defaultVal = null) {
    // const _m = "PostService.loadWatchedPost";
    const sm = StorageManager.GetInstance();
    const promise = new Promise((resolve, reject) => {
      sm.findObjectByID(XMWatchedPost.GetFolderName(), postId, null, (err, jsonLiked) => {
        if (err) {
          if (EC.Is(err, RES_NOTFOUND)) {
            return resolve(defaultVal);
          }
          return reject(err);
        }
        const xmObj = XMWatchedPost.Wrap(jsonLiked);
        resolve(xmObj);
      });
    });
    const result = await promise;
    return result;
  } // loadWatchedPost

  /**
   * Return a list of userIds that watched the given post.
   *
   * @param {string} postId
   * @return {XMWatchedPost} userIds watched this post
   */
  static async GetWatchedPost(postId, defaultVal = null) {
    const watchedObj = await PostService.LoadWatchedPost(postId);

    return watchedObj || defaultVal;
  } // getWatchedPost

  /**
 * Return status of whether a user watches (or not watch or..) a post
 *
 * @param {string} postId ID if user that might be followed by user
 * @param {string} userId ID of user to check watching
 * @return {string} one of STATUS_* like STATUS_WATCHED or STATUS_NOT_WATCHED
 */
  static async GetWatchPostStatus(postId, userId, defaultVal = STATUS_NOT_WATCHED) {
    // REVISIT: Loading entire XMWatches is not scalable right now,
    // but neither is storing in document! Can't hold millions (watchers)
    const watchedObj = await PostService.loadWatchedPost(postId);

    return watchedObj ? watchedObj.getWatchStatus(userId) : defaultVal;
  } // getWatchPostStatus


  // ----------------------- POST STATS ------------------------

  /**
   * Return a post with stats as two separate objects in an
   * array. Normally you don't need to do this, just use
   * LoadPost() and use INCL_STATS
   *
   * @param {string} postId
   * @param {boolean} incl_refObjs
   * @return {[XMPost, XPostStats]}
   *
   * @see ~LoadPost
   * @see ~getMultiPostStats
   */
  static async GetPostWithStats(postId, incl_refObjs) {
    const _m = 'GetPostWithStats';
    // Update share stat in cache
    let xPost;
    let xPostStats;
    try {
      // Post is stored in database, so should take longer. We'll do it async
      // and fetch from cache during the I/O
      xPost = await PostHelper.LoadPost(postId, API.INCL_POSTSTATS);
      xPostStats = xPost.getAuxDataField(API.INCL_POSTSTATS);
    } catch (err) {
      logger.error('error', { err, _m });
      throw err;  // should use better error
    }

    return [xPost, xPostStats];
  } // getPostWithStats

  /**
   * Return a status object for a post
   *
   * @param {string} postId
   * @return {XPostStats}
   *
   * @see ~getMultiPostStats
   */
  static async GetPostStats(postId, defaultVal = null) {
    const _m = 'GetPostStats';
    // Update share stat in cache
    let stats;
    try {
      stats = await PostStatHelper.GetPostStats(postId);
    } catch (err) {
      logger.error('error', { err, _m });
      throw err;
    }

    return stats;
  } // GetPostStats


  /**
     * Fetch stats for multiple posts. This service layer will
     * go to cache to retrieve them, and (in the near future) if
     * not available get from storage and update cache.     *
     *
     * @param {string[]} array of post IDs
     * @param {string[]=} fields fields to return (null for all)
     * @param {boolean} wrap true to wrap with XObject instance PostStats
     * @return {{objectId, XPostStats}} map of stats keyed off objectId
     *
     * @see ~getPostStats
   */
  static async GetMultiPostStats(postIds, fields, wrap = false) {
    // For now, only retrieve from cache
    const xStatsMap = await PostStatHelper.GetMultiPostStats(postIds, fields, wrap);

    return xStatsMap;
  } // GetMultiPostStats

  // ---------------------- COMMENT STATS ----------------------

  /**
 * Return status of whether a user watches (or not watch or..) a comment
 *
 * @param {string} commentId ID if user that might be followed by user
 * @param {string} userId ID of user to check watching
 * @return {string} one of STATUS_* like STATUS_WATCHED or STATUS_NOT_WATCHED
 */
  static async GetWatchCommentStatus(commentId, userId, defaultVal = STATUS_NOT_WATCHED) {
    // Loading entire XMWatches is not scalable right now, but neither is
    // storing in document! Can't hold millions (watchers)
    const watchedObj = await PostService.LoadWatchedComment(commentId);

    return watchedObj ? watchedObj.getWatchStatus(userId) : defaultVal;
  } // getWatchCommentStatus

  /**
   * Return a comment status object that contain key stats
   *
   * @param {string} commentId
   * @return {XMCommentStats}
   *
   * @see ~getMultiCommentStats
   */
  static async GetCommentStats(commentId, defaultVal = null) {
    // Update share stat in cache
    const jsonStats = await CommentStatHelper.GetCommentStats(commentId);
    const stats = XMCommentStats.CreateNew(commentId, jsonStats);

    return stats;
  } // getCommentStatus

  /**
   * Return status objects for comments
   *
   * @param {string[]} commentIds
   * @param {Promise} promise: object map keyed off commentIds
   *
   * @see ~getCommentstats
   */
  static async GetMultiCommentStats(commentIds, defaultVal = null) {
    const xStatsMap = await CommentStatHelper.GetMultiCommentStats(commentIds);

    return xStatsMap;
  } // getMultiCommentStats

  // ---------------------- WATCHED COMMENT -------------------------------------

  /**
   * Async load user "like" list associated comment
   *
   * @param {string} commentId lookup likes of this comment
   * @param {*} defaultVal if object not found
   *
   * @return {XMLikedComment} userId list associated with comment
   */
  static async LoadWatchedComment(commentId, defaultVal = null) {
    // const _m = "PostService.loadWatchedComment";
    const sm = StorageManager.GetInstance();
    const promise = new Promise((resolve, reject) => {
      sm.findObjectByID(XMWatchedComment.GetFolderName(), commentId, null, (err, jsonLikedComment) => {
        if (err) {
          if (EC.Is(err, RES_NOTFOUND)) {
            return resolve(defaultVal);
          }
          return reject(err);
        }
        const xmObj = XMWatchedComment.Wrap(jsonLikedComment);
        resolve(xmObj);
      });
    });
    const result = await promise;
    return result;
  } // loadWatchedComment


  /**
   * Return a list of userIds that watched the given comment.
   *
   * @param {string} commentId
   * @param {XMWatchedComment} userIds watched this comment
   */
  static async GetWatchedComment(commentId, defaultVal = null) {
    const watchedObj = await PostService.LoadWatchedComment(commentId);

    return watchedObj || defaultVal;
  } // getWatchedComment

  // --------------------------- SHARE COMMENT --------------------------------

  /**
   * Async load "shared" container associated post (XMShared)
   *
   * @param {string} commentId lookup shared container of this post
   * @param {*} defaultVal if object not found
   *
   * @return {XMSharedPost} userId list associated with post
   */
  static async LoadSharedComment(commentId, defaultVal = null) {
    // const _m = "PostService.loadSharedComment";
    const sm = StorageManager.GetInstance();
    const promise = new Promise((resolve, reject) => {
      sm.findObjectByID(COLL_SHARED_COMMENT, commentId, null, (err, jsonObj) => {
        if (err) {
          if (EC.Is(err, RES_NOTFOUND)) {
            return resolve(defaultVal);
          }
          return reject(err);
        }
        const xmObj = XMSharedComment.Wrap(jsonObj);
        resolve(xmObj);
      });
    });
    const result = await promise;
    return result;
  } // loadSharedComment

  /**
   * Return a list of userIds that shared the given comment.
   *
   * @param {string} commentId
   * @return {XMSharedComment} contains userIds that shared this post
   */
  static async GetSharedComment(commentId, defaultVal = null) {
    const shared = await PostService.LoadSharedComment(commentId);

    return shared || defaultVal;
  } // getSharedComment

  static async GetCommentSharedBy(apiContext, commentId, defaultVal = null, queryOptions = { offset: 0, max: 10, expire: EXPIRE_TIME_FOR_SHARE }) {
    const _m = 'GetCommentSharedBy';
    apiContext = AppService.AssertAPIContext(apiContext, false, _m);

    const xSharedby = await SharesHelper.LoadCommentSharedBy(commentId, null, queryOptions);

    return xSharedby || defaultVal;
  } // GetPostSharedBy

  /**
   * Return status of whether a user shares (reposts) a post
   *
   * @param {string} userId ID of user to check follows
   * @param {string} postId ID if user that might be followed by user
   * @param {string=} defaultVal STATUS_NOT_SHARED if null
   * @return {string} one of STATUS_* like STATUS_SHARED or STATUS_NOT_SHARED
   */
  static async GetShareStatusComment(postId, userId, defaultVal = null) {
    if (defaultVal == null) { defaultVal = XMSharedComment.STATUS_NOT_SHARED; }

    const shared = await PostService.LoadSharedPost(postId);

    return shared ? shared.getShareStatus(userId) : defaultVal;
  } // getShareStatusPost


  // ---------------------------- Search Support -------------------------------------

  /**
   * Return choices from search phrase.
   *
   * NOTE: This call likely require "real-time" fast response as
   * it may be called for every user keystroke.
   *
   * @param {string} phrase
   * @param {number} max
   * @param {number} offset
   * @param {string} sort
   * @param {string} inclOptions incl=@|#
   */
  static async SuggestChoicesFromPhrase(apiContext, phrase, max = 20, offset = 0, sort, inclOptions) {
    // const _m = 'SuggestCohicesFromPhrase';
    // apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    // Get resultrs from Hashtag and Mention Maps and merge them.

    // let hashtagResult = await HashtagMapService.GetKwdTagsFromPhrase(phrase, max, min, sort);

    // Tokenize phrase
    const phrase_tokens = phrase.trim().split(' ');
    const inclHashtags = inclOptions ? API.HasOption(inclOptions, API.INCL_HASHTAGS) : true;
    const inclUsertags = inclOptions ? API.HasOption(inclOptions, API.INCL_USERTAGS) : true;

    const start = (max * offset);
    // const hashtags = (await TagService.GetDeclaredHashtags(phrase)).slice(start, Number(start) + Number(max));
    // const usertags = (await TagService.GetDeclaredUsertags(phrase)).slice(start, Number(start) + Number(max));
    let hashtags = [];
    let usertags = [];
    for (const p of phrase_tokens) {
      const htags = inclHashtags ? await TagService.GetDeclaredHashtags(p, true) : null;// .slice(0, Number(start) + Number(max));
      const utags = inclUsertags ? await TagService.GetDeclaredUsertags(p, true) : null;// .slice(0, Number(start) + Number(max));
      hashtags = inclHashtags ? hashtags.concat(Util.UniqueArray(htags)) : [];
      usertags = inclUsertags ? usertags.concat(Util.UniqueArray(utags)) : [];
    }

    hashtags = Util.UniqueArraySortByRelevance(hashtags, false).slice(start, Number(start) + Number(max));
    usertags = Util.UniqueArraySortByRelevance(usertags, false).slice(start, Number(start) + Number(max));

    // Preload results
    const tagmap = {};
    const hcount = hashtags ? hashtags.length : 0;
    let hashtag;
    for (let i = 0; i < hcount; i++) {
      hashtag = `#${hashtags[i]}`;
      tagmap[hashtag] = null;
    }

    // This will need to retrieve user's info
    const mcount = usertags ? usertags.length : 0;
    let usertag;
    for (let i = 0; i < mcount; i++) {
      // const userInfo = await UserInfoHelper.GetUserInfoById(usertags[i], ['_t', 'ico', 'nickname', 'username', 'status']);
      const userInfo = await UserInfoHelper.GetUserInfoById(usertags[i], null, true, false, true);
      usertag = `@${usertags[i]}`;
      tagmap[usertag] = XObject.Unwrap(userInfo);
    }

    const resultMap = XResultMap.Create('hints');
    resultMap.setEntryMap(tagmap);

    return resultMap;
  }

  /**
   * Return choices from Elasticsearch suggest API.
   *
   * NOTE: This call likely require "real-time" fast response as
   * it may be called for every user keystroke.
   *
   * @param {APIContext} apiContext
   * @param {string} phrase query phrase / keyword
   * @param {number} max number of items to resturn
   * @param {number} offset start-after offset position (default = 0)
   * @param {{}} pageOptions options for pagination { offset, max, cursor }
   * @returns {Promise<XResultMap>}
   * @constructor
   */
  static async SuggestChoicesFromElasticsearch(apiContext, phrase, pageOptions = {}, inclOptions) {
    const _m = 'SuggestChoicesFromElasticsearch';
    // Tokenize phrase
    const phrase_tokens = phrase.trim().split(' ');
    const isSinglePhrase = phrase_tokens.length === 1;
    let p = phrase.trim();

    let esResult;
    if (isSinglePhrase && p.startsWith(INCL_HASHTAGS)) {
      p = p.substring(1);
      if (Util.StringIsEmpty(p)) {
        const result = XResultMap.Create('hints');
        result.setEntryMap({});
        return result;
      }
      esResult = await ElasticsearchService.SuggestHashtags(apiContext, p, pageOptions, inclOptions);
      if (!esResult) {
        throw EC.SYS_NETERR('Elasticsearch service issue');
      }
    } else if (isSinglePhrase && p.startsWith(INCL_USERTAGS)) {
      p = p.substring(1);
      if (Util.StringIsEmpty(p)) {
        const result = XResultMap.Create('hints');
        result.setEntryMap({});
        return result;
      }
      esResult = await ElasticsearchService.SuggestUsertags(apiContext, p, pageOptions, inclOptions);
      if (!esResult) {
        throw EC.SYS_NETERR('Elasticsearch service issue');
      }
    } else {
      esResult = await ElasticsearchService.SuggestTags(apiContext, p, pageOptions, inclOptions);
      if (!esResult) {
        throw EC.SYS_NETERR('Elasticsearch service issue');
      }
    }

    return esResult;
  } // SuggestChoicesFromElasticsearch

  // -------------------- Embedded/Thumbnail Post HTML ---------------------------

  /**
   * Render post thumbnail as HTML
   *
   * @param {string} postId
   * @param {string[]} imageURLs
   * @param {{}} params
   * @return {string} html content
   */
  static async RenderPostThumbnail(postId, imageURLs, params) {
    const _m = 'RenderPostThumbnail';
    let html = null;
    try {
      const loadOpts = API.INCL_POSTSTATS;
      const postObj = await PostHelper.LoadPost(postId, loadOpts);

      // preload images if not passed in

      //

      if (params == null) { params = {}; }
      html = PostHTMLRenderer.RenderThumbnail(postObj, imageURLs, params);
    } catch (err) {
      logger.error('error', { err, _m });
      throw err;
    }
    return html;
  } // RenderPostThumbnail

  /**
   * Retrieve a post thumbnail image. If no such image exists, generate immediately.
   *
   * @param {string} postId
   * @param {Response} Express HTTP Response. Need it in order to set content type in header.
   * @param {string} version TBD
   * @param {boolean} regen true to regenerate and overwrite
   * @param {*} params
   * @return {string=} filename of the image generated in cache, or null if error
   */
  static async RetrievePostThumbnail(apiContext, postId, res, regen = false, params = null) {
    const _m = 'RetrievePostThumbnail';
    let fspec;
    try {
      fspec = await PostService.GeneratePostThumbnail(postId, null, regen, params);
      let mimeType;
      if (fspec.endsWith('.svg')) { mimeType = 'image/svg'; } else { mimeType = mime.lookup(fspec); }

      res.setHeader('Content-Type', mimeType);
      return FileService.StreamFileFromCache(fspec, res, params);
    } catch (err) {
      logger.error('error', { err, fspec, _m });
      return EC.RES_NOTFOUND(fspec);
    }
  } // GeneratePostThumbnail

  /**
   * Generate post thumbnail, if one hasn't been done or force overwrite.
   *
   * @param {string} postId
   * @param {string[]} imageURLs
   * @param {boolean=} regen true to regenerate and overwrite
   * @param {{}=} params
   * @return {string=} filename of the image generated or found in cache
   */
  static async GeneratePostThumbnail(postId, imageURLs, regen = false, params = null) {
    const _m = 'GeneratePostThumbnail';
    // TO-DO: check env var THUMBNAIL_HTML_HOST. If it's defined, then
    // should make http call to get the HTML instead.

    const cacheRoot = StorageManager.GetInstance().getWebCacheRoot();
    const fspec = ImageUtil.DerivePistThumbnailCachePath(postId, cacheRoot);

    try {
      const html = await PostService.RenderPostThumbnail(postId, imageURLs, params);
      const result = await WebPageImage.ThumbnailingHTML(html, fspec, regen, params);
    } catch (err) {
      logger.error('error', { err, _m });
    }

    return fspec;
  } // GeneratePostThumbnail

  // -------------------- Image Services ---------------------------


  /**
   * Retrieve a post thumbnail image. If no such image exists, generate immediately.
   *
   * @param {string} postId
   * @param {string} filename
   * @param {Response} res HTTP response that is a WriteStream
   * @param {string} version TBD
   * @param {boolean} regen true to regenerate and overwrite
   * @param {*} params
   * @return {string=} filename of the image generated in cache, or null if error
   */
  static async RetrievePostImage(apiContext, postId, filename, res = null, options) {
    const _m = 'RetrievePostImage';
    let fspec;
    try {
      fspec = StorageManager.GetInstance().getPostImageFilePath(postId, filename);
      let mimeType;
      if (fspec.endsWith('.svg')) { mimeType = 'image/svg'; } else { mimeType = mime.lookup(fspec); }

      res.setHeader('Content-Type', mimeType);
      return FileService.StreamPostImage(postId, filename, res);
    } catch (err) {
      logger.error('RetrievePostImage: ', { err, fspec, _m });
      throw EC.RES_NOTFOUND(fspec);
    }
  } // Retrieve Post Image


  /**
   * Retrieve a post thumbnail image. If no such image exists, generate immediately.
   *
   * @param {string} commentId
   * @param {string} filename
   * @param {Response} res HTTP response that is a WriteStream
   * @param {string} version TBD
   * @param {boolean} regen true to regenerate and overwrite
   * @param {*} params
   * @return {string=} filename of the image generated in cache, or null if error
   */
  static async RetrieveCommentImage(apiContext, commentId, filename, res = null, options) {
    const _m = 'RetrieveCommentImage';
    let fspec;
    try {
      fspec = StorageManager.GetInstance().getCommentImageFilePath(commentId, filename);
      let mimeType;
      if (fspec.endsWith('.svg')) { mimeType = 'image/svg'; } else { mimeType = mime.lookup(fspec); }

      res.setHeader('Content-Type', mimeType);
      return FileService.StreamCommentImage(commentId, filename, res);
    } catch (err) {
      logger.error(`${_m} error`, { err, fspec, _m });
      throw EC.RES_NOTFOUND(fspec);
    }
  } // Retrieve Post Image


  static async GetLiveStreamUrl(apiContext, videoId) {
    const getInstance = SystemConfig.GetInstance();
    const liveStreamUrl = getInstance.getLiveStreamUrl();
    try {
      if (!httpAgents[liveStreamUrl]) {
        httpAgents[liveStreamUrl] = new http.Agent({
          keepAlive: true,
          maxSockets: 10,
          maxFreeSockets: 50,
          timeout: 10000, // active socket keepalive for 12 seconds
          freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
        });
      }
      const result = (await axios({
        method: 'get',
        url: `${liveStreamUrl}/${videoId}`,
        timeout: 5000,
        httpAgent: httpAgents[liveStreamUrl],
        // httpsAgent: new https.Agent({ keepAlive: true }),
        // follow up to 10 HTTP 3xx redirects
        maxRedirects: 10,
        // cap the maximum content length we'll accept to 100MBs, just in case
        maxContentLength: 100 * 1000 * 1000
      })).data;
      return result;
    } catch (e) {
      this.Error('Get live and video stream url error: ', e);
      return null;
    }
  } // get live and video stream url.  07/15/2021

  static async TranslatePost(apiContext, postId, targetLang) {
    const _m = 'TranslatePost';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    const authenticatedUserInfo = apiContext.getUserInfo();

    let ecode;
    let translateObj;
    let postInfo;
    try {
      // STEP 1: Get translated languages from post info
      postInfo = await PostInfoHelper.GetPostInfo(postId);
      const ownerId = XPostInfo.GetOwnerId(postInfo);
      const langs = postInfo.getTranslate();
      translateObj = langs ? langs[targetLang] : null;

      // STEP 2: Check if translate has expired
      let translateDate;
      let expired;
      if (!Util.ObjectIsEmpty(translateObj)) {
        translateDate = translateObj[XMSocialIndexable.PROP_TRANSLATED_DATE];
        expired = Date.now() - translateDate > TRANSLATE_EXPIRY;
      }

      // STEP 3: Re-translate
      if (Util.ObjectIsEmpty(translateObj) || expired) {
        const sourceLang = postInfo.getTextLanguage();

        const [hashTags, userTags, maskedText] = PostInfoHelper.MaskPostTags(postInfo);
        const translate = !Util.StringIsEmpty(maskedText) ? await TranslateService.TranslateText(maskedText, sourceLang, targetLang) : null;
        if (Util.ArrayIsEmpty(translate)) {
          throw EC.API_BAD_DATA('invalid content to translate');
        }
        const result = PostInfoHelper.RecoverPostTags(translate[0], hashTags, userTags);

        // STEP 4: Upload result to CDN
        const key = `${targetLang}/${postId}.json`;
        const meta = {
          [MessageProps.POST_ID]: postId,
          [MessageProps.OWNERID]: ownerId,
          [XMSocialIndexable.PROP_TRANSLATED_DATE]: Date.now(),
          [XMSocialIndexable.PROP_SOURCE_LANG]: sourceLang,
          [XMSocialIndexable.PROP_TARGET_LANG]: targetLang,
        };
        const path = await CDNService.UploadObject(key, {
          [XMSocialIndexable.PROP_TEXT]: result,
          ...meta,
        }, _m, { Tagging: `postId=${postId}&userId=${ownerId}&api=${_m}` });
        if (Util.IsNull(path)) {
          throw EC.API_ERROR('Failed to upload translate');
        }

        // STEP 5: Cache results in postInfo
        translateObj = {
          ...meta,
          [XMSocialIndexable.PROP_TRANSLATED_PATH]: path,
        };
        postInfo.addTranslate(translateObj, targetLang);
        // cache postInfo
        await PostInfoHelper.SetPostInfo_Cache(postInfo);
      }

      // STEP 4: clear unwanted props
      XPostInfo.ClearObjectField(postInfo, XMSocialIndexable.PROP_META);
    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    // write act_log
    await (async () => {
      try {
        const srcObj = ServiceUtil.SubsetSrcObj(authenticatedUserInfo, UserProps.PUBLIC_PROPS);
        XObject.SetObjectField(srcObj, APIContext.USER_IP, apiContext.getUserIP());
        const log = await ActivityLogger.UserTranslatePost(srcObj, postInfo);
        apiContext.updateActivityLogs(log, ecode);
        DownStream.SubmitLog(log)
          .catch(err => logger.error('Submit act log error.', { err, _m }));
      } catch (logErr) {
        logger.error('Write act log error.', { err: logErr, _m });
      }
    })();

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return postInfo;
  } // TranslatePost

  static async ViewPost(apiContext, postId, options = {}) {
    const _m = 'ViewPost';
    apiContext = AppService.AssertAPIContext(apiContext, true, _m);

    let viewLocation;
    let ecode;
    let postInfo;
    let requestorInfo;
    let requestorId;
    let socialOwnerId;
    let update = false;
    try {
      if (!postId.startsWith(PREFIX_POST_ID)) {
        throw EC.API_BAD_PARAMS('invalid post id', postId);
      }

      viewLocation = options[MessageProps.VIEW_LOCATION];
      if (!Util.StringIsEmpty(viewLocation) && VIEW_LOCATIONS.includes(viewLocation) === false) {
        throw EC.API_BAD_PARAMS('invalid view_location', viewLocation);
      }

      requestorInfo = apiContext.getUserInfo();
      requestorId = apiContext.getAuthenticatedUserId();
      postInfo = await PostInfoHelper.GetPostInfo(postId);

      // Check permission
      if (requestorInfo) {
        await AppService.CheckUserCanREAD(requestorInfo, postInfo);
      }

      if (postInfo) {
        socialOwnerId = XPostInfo.GetOwnerId(postInfo);
      }

      if (socialOwnerId && !Util.StringEquals(requestorId, socialOwnerId)) {
        update = true;
      }

    } catch (err) {
      logger.error('error', { err, _m });
      ecode = XError.FromError(err);
    }

    // write act log
    if (update && !ecode) {
      (async () => {
        try {
          const srcObj = ServiceUtil.SubsetSrcObj(requestorInfo, UserProps.PUBLIC_PROPS);
          XObject.SetObjectField(srcObj, APIContext.USER_IP, apiContext.getUserIP());
          const log = await ActivityLogger.UserViewedPost(srcObj, postInfo, options, null);
          apiContext.updateActivityLogs(log, ecode);
          DownStream.SubmitLog(log)
            .catch(err => logger.error('Submit act log error.', { err, _m }));
        } catch (e) {
          logger.error('Write act log error.', { err: e, _m });
        }
      })()
        .catch(err => logger.error('error', { err, _m }));
    }

    // throw error if there is one
    if (ecode) {
      throw ecode;
    }

    return true;
  } // TranslatePost

}

export default PostService;
