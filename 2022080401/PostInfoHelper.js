import _ from 'lodash';
import { ModelType, PREFIX_COMMENT_ID, PREFIX_POST_ID, UserProps, XObjectProps } from '../../core/model/ModelConsts';
import ObjectHelper from '../core/ObjectHelper';
import EC from '../../core/ErrorCodes';
import XPostInfo, { CURRENT_POSTINFO_VERSION } from '../../core/model/post/XPostInfo';
import ObjectBase from '../../core/ObjectBase';
import StorageManager from '../core/StorageManager';
import RedisUtil, { EXPIRE_TIME_FOR_DEL, EXPIRE_TIME_FOR_OBJECT } from '../core/store/RedisUtil';
import XMSocialIndexable from '../../core/model/social/XMSocialIndexable';
import XMUser from '../../core/model/user/XMUser';
import Util from '../../core/Util';
import XObject from '../../core/model/XObject';
import XPostStats from '../../core/model/post/XPostStats';
import XMCommentStats from '../../core/model/social/XMCommentStats';
import StatHelper from '../stat/StatHelper';
import AppService from '../AppService';
import gettrLogger from '../../core/GettrLogger';
import PollClient from '../poll/PollClient';

const modelType = ModelType.POST_INFO;
const _CLSNAME = 'PostInfoHelper';
const logger = gettrLogger(_CLSNAME);

// const _PINFO_FIELDS = [
//   XObjectProps.ID,
//   XObjectProps.TEXT_URL,
//   XMSocialIndexable.PROP_IMAGE_URLS,
//   UserProps.META,
//   XMSocialIndexable.PROP_MAIN_IMAGE_URL,
//   XMSocialIndexable.PROP_HASHTAGS,
//   XMSocialIndexable.PROP_USERTAGS,
//   XMSocialIndexable.VISIBILITY,
//   XMSocialIndexable.PROP_COMMENT_POST_ID,
//   XMSocialIndexable.PROP_PARENT_OWNER_ID,
//   MessageProps.PARENT_COMMENT_ID,
//   XMSocialIndexable.PROP_REPOSTID_TRACE,
//   XMSocialIndexable.PROP_REPOSTER_TRACE,
//   UserProps.OWNERID, XObjectProps.CREATED_DATE,
//   XObjectProps.UPDATED_DATE,
//   StatsProps.LIKEDBY_POST,
//   StatsProps.COMMENTS,
//   StatsProps.POST_SHAREDBY,
//   StatsProps.LIKEDBY_COMMENT,
//   StatsProps.COMMENTS,
//   StatsProps.COMMENT_SHAREDBY,
//   XMSocialIndexable.PROP_TEXT_LANG,
// ];

const _PINFO_FIELDS = XMSocialIndexable.XMSOCIAL_POSTINFO_PROPS;
const _STATS_FIELDS = XMSocialIndexable.XMSOCIAL_POSTINFO_STATS_PROPS;

export default class PostInfoHelper extends ObjectHelper {

  /**
   * Create a postinfo record aggregated from difference
   * sources but mainly Post and PostStats.
   * It is suitable to give to client for rendering.
   *
   * @return {XPostInfo}
   * @param {XPostInfo} postInfo
   * @param {XMSocialIndexable} postableObj
   * @param {} postableStats
   */
  static FillFromPostableAndStats(postInfo, postableObj, postableStats) {
    const _m = 'FillFromPostableAndStats';
    if (!postInfo || !postableObj) {
      logger.error('Invalid argument', { _m });
      return;
    }

    _PINFO_FIELDS.forEach((field) => {
      let value = XMSocialIndexable.GetObjectField(postableObj, field);
      if (value) {
        if ([..._STATS_FIELDS, XObjectProps.CREATED_DATE, XObjectProps.UPDATED_DATE].includes(field)) {
          value = Util.toNumber(value);
        }
        XPostInfo.SetObjectField(postInfo, field, value);
      }
    });

    // postInfo.setText(postableObj.getText());
    // postInfo.setOwnerId(postableObj.getOwnerId());
    // if (postableObj.getImageURLs()) { postInfo.setImageURLs(postableObj.getImageURLs()); }
    // if (postableObj.getMainImageURL()) { postInfo.setMainImageURL(postableObj.getMainImageURL()); }
    // if (postableObj.getHashtags()) { postInfo.setHashtags(postableObj.getHashtags()); }
    // if (postableObj.getUsertags()) { postInfo.setUsertags(postableObj.getUsertags()); }
    // if (postableObj.getRepostedIds()) { postInfo.setRepostedIds(postableObj.getRepostedIds()); }
    // if (postableObj.getRepostedOwnerIds()) {
    //   postInfo.setRepostedOwnerIds(postableObj.getRepostedOwnerIds());
    // }
    // if (postableObj.getRepostedOwnerIds()) {
    //   postInfo.setRepostedOwnerIds(postableObj.getRepostedOwnerIds());
    // }
    // postInfo.setCreatedTS(postableObj.getCreatedTS());

    const isPost = postableObj.getId().startsWith(PREFIX_POST_ID);
    const isComment = postableObj.getId().startsWith(PREFIX_COMMENT_ID);

    let likedCount;
    let commentCount;
    let sharedCount;

    if (isPost) {
      likedCount = Math.max(XPostStats.GetLikedPostCount(postableStats), 0);
      commentCount = Math.max(XPostStats.GetCommentCount(postableStats), 0);
      sharedCount = Math.max(XPostStats.GetSharedPostCount(postableStats), 0);
      // if (postableStats.getViewPostCount()) { postInfo.setViewPostCount(postableStats.getViewPostCount()); }
    }

    if (isComment) {
      likedCount = Math.max(XMCommentStats.GetLikedCommentCount(postableStats), 0);
      commentCount = Math.max(XMCommentStats.GetCommentCount(postableStats), 0);
      sharedCount = Math.max(XMCommentStats.GetSharedCommentCount(postableStats), 0);
      // if (postableStats.getViewPostCount()) { postInfo.setViewPostCount(postableStats.getViewPostCount()); }
    }

    if (Number.isInteger(likedCount) && likedCount >= 0) { postInfo.setLikedPostCount(likedCount); }
    if (Number.isInteger(commentCount) && commentCount >= 0) { postInfo.setCommentCount(commentCount); }
    if (Number.isInteger(sharedCount) && sharedCount >= 0) { postInfo.setSharedPostCount(sharedCount); }

    // postInfo.setUsername(userInfo.getUsername());
    // postInfo.setNickname(userInfo.getNickname());
    // if (userInfo.getOriginalUsername()) { postInfo.setOriginalUsername(userInfo.getOriginalUsername()); }
    // if (userInfo.getIconUrl())  { postInfo.setIconUrl(userInfo.getIconUrl()); }
    // if (userInfo.getBackgroundImageUrl()) { postInfo.setBackgroundImageUrl(userInfo.getBackgroundImageUrl()); }
    return postInfo;
  } // FillFromPostAndStats

  static async GetPostInfoList(postIds, fields, wrap = false, map = true) {
    const _m = `${_CLSNAME}.GetPostInfoList(${postIds})`;
    try {
      const postInfos = await Promise.all(
        postIds.map(async (postId) => {
          try {
            const postInfoObj = await PostInfoHelper.GetPostInfo(postId, fields);
            return wrap ? postInfoObj : XPostInfo.Unwrap(postInfoObj);
          } catch (e) {
            return null;
          }
        }));
      return map ? postInfos.reduce((acc, cur) => {
        if (!cur) {
          return acc;
        }
        acc[XPostInfo.GetId(cur)] = cur;
        return acc;
      }, {}) : postInfos;
    } catch (err) {
      // EC.API_ERROR(`${_m}: error: ${err} with postId list: ${postIds} `);
      throw err;
    }
  }

  static async GetPostInfo(postId, fields) {
    const _m = 'GetPostInfo';

    if (!postId) {
      return null;
    }

    const pinfoFromCache = await PostInfoHelper.GetPostInfoFromCache(postId);
    let postInfo;
    if (!Util.ObjectIsEmpty(pinfoFromCache)) {
      /**
       * Aug 22 21 - ddm
       * Update existing XPostInfo
       */
      const xVersion = XPostInfo.GetVersionTitle(pinfoFromCache);
      if (xVersion !== CURRENT_POSTINFO_VERSION) {
        postInfo = await PostInfoHelper.ReloadPostInfo(postId);
      } else {
        postInfo = XPostInfo.Wrap(pinfoFromCache);
      }
    } else {
      postInfo = await PostInfoHelper.ReloadPostInfo(postId);
    }
    if (postInfo && fields && !Util.ArrayIsEmpty(fields) && !Util.ObjectIsEmpty(postInfo)) {
      const pinfo = {};
      const jsonData = XPostInfo.Unwrap(postInfo);
      fields.forEach((f) => {
        if (jsonData.hasOwnProperty(f)) {
          pinfo[f] = jsonData[f];
        }
      });
      XPostInfo.SetPostId(pinfo, postId);
      postInfo = XPostInfo.Wrap(pinfo);
    }

    // Load poll counts
    const poll = XPostInfo.GetPoll(postInfo);
    if (!Util.ObjectIsEmpty(poll)) {
      const pollClient = PollClient.CreatInstance(postInfo);
      const counts = await pollClient.getPollCounts();
      poll[XMSocialIndexable.PROP_POLL_STATS] = counts;
    }

    return postInfo;
  }

  static async GetPostInfoFromCache(postId, fields) {
    const _m = 'GetPostInfoFromCache';
    if (!ObjectBase.AssertArrayNoNulls([postId], _CLSNAME, _m, 'params')) { return false; }

    const postInfoCache = StorageManager.GetInstance().getPostInfoCache();
    const [key] = RedisUtil.DerivePostInfoKey(postId);
    try {
      // const resultFromCache = await RedisUtil.GetFieldValues(postInfoCache, key);
      // // TODO can't use the generic one due to possible heavy customized logic (e.g., meta)
      // // TODO see UserInfoHelper.GetUserInfoById
      // return resultFromCache;

      const resultFromCache = await new Promise((resolve, reject) => {
        const postProcess = (err, postInfoResult) => {
          if (err) {
            logger.error('error', { err, _m });
            // const xerr = EC.RES_NOTFOUND(`${_m} Redis error: ${err}`);
            reject(err);
          }

          // parse acl to json format
          const acl = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_ACL] : null;
          if (acl !== null && Util.IsString(acl)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_ACL] = JSON.parse(acl);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse translates to json format
          const translates = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_TRANSLATES] : null;
          if (translates !== null && Util.IsString(translates)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_TRANSLATES] = JSON.parse(translates);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse poll to json format
          const poll = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_POLL] : null;
          if (poll !== null && Util.IsString(poll)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_POLL] = JSON.parse(poll);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse meta to json format
          const meta = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_META] : null;
          if (meta !== null && Util.IsString(meta)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_META] = JSON.parse(meta);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse PROP_REPOSTID_TRACE to array format
          const repostIds = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_REPOSTID_TRACE] : null;
          if (repostIds !== null && Util.IsString(repostIds)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_REPOSTID_TRACE] = Util.Text2Array(repostIds);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse PROP_REPOSTER_TRACE to array format
          const reposterIds = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_REPOSTER_TRACE] : null;
          if (reposterIds !== null && Util.IsString(reposterIds)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_REPOSTER_TRACE] = Util.Text2Array(reposterIds);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse PROP_MODTAGS to array format
          const mtags = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_MODTAGS] : null;
          if (mtags !== null && Util.IsString(mtags)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_MODTAGS] = Util.Text2Array(mtags);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse PROP_HASHTAGS to array format
          const htags = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_HASHTAGS] : null;
          if (htags !== null && Util.IsString(htags)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_HASHTAGS] = Util.Text2Array(htags);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse PROP_USERTAGS to array format
          const utags = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_USERTAGS] : null;
          if (utags !== null && Util.IsString(utags)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_USERTAGS] = Util.Text2Array(utags);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse PROP_IMG_URLS to array format
          const imgs = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_IMAGE_URLS] : null;
          if (imgs !== null && Util.IsString(imgs)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_IMAGE_URLS] = Util.Text2Array(imgs);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse PROP_SOUND_IDS to array format
          const soundIds = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_SOUND_IDS] : null;
          if (soundIds !== null && Util.IsString(soundIds)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_SOUND_IDS] = Util.Text2Array(soundIds);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse PROP_STICKER_IDS to array format
          const stickerIds = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_STICKER_IDS] : null;
          if (stickerIds !== null && Util.IsString(stickerIds)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_STICKER_IDS] = Util.Text2Array(stickerIds);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }

          // parse stats and dates to number
          [..._STATS_FIELDS, UserProps.CREATED_DATE, UserProps.UPDATED_DATE].forEach((prop) => {
            const value = postInfoResult ? postInfoResult[prop] : null;
            if (value !== null && Util.IsString(value)) {
              try {
                postInfoResult[prop] = Util.toNumber(value);
              } catch (perr) {
                logger.error('error', { err: perr, _m });
              }
            }
          });

          // TODO: Temporary solution to take out ovid
          const ovid = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_ORIG_VIDEO_URL] : null;
          if (!Util.StringIsEmpty(ovid)) {
            postInfoResult[XMSocialIndexable.PROP_ORIG_VIDEO_URL] = ovid.endsWith('.mp4') ? ovid : '';
          }

          // parse text history to array
          const textHistory = postInfoResult ? postInfoResult[XMSocialIndexable.PROP_TEXT_HISTORY] : null;
          if (textHistory !== null && Util.IsString(textHistory)) {
            try {
              postInfoResult[XMSocialIndexable.PROP_TEXT_HISTORY] = JSON.parse(textHistory);
            } catch (perr) {
              logger.error('error', { err: perr, _m });
            }
          }


          if (fields == null) {
            resolve(postInfoResult);
          } else {
            const reslt = {};
            fields.forEach((e, idx) => {
              reslt[e] = postInfoResult[idx];
            });
            resolve(reslt);
          }
        };
        if (fields == null) {
          postInfoCache.hgetall(key, postProcess).then(postInfoCache.expire(key, EXPIRE_TIME_FOR_OBJECT));
        } else {
          postInfoCache.hmget(key, fields, postProcess).then(postInfoCache.expire(key, EXPIRE_TIME_FOR_OBJECT));
        }
      });
      return resultFromCache;
    } catch (err) {
      logger.error('error', { err, _m });
    }
  }

  static GetStatsFromPostInfos(postInfos, wrap = false, map = true) {
    const _m = 'GetStatsFromPostInfos';
    try {
      let pinfs;
      if (typeof postInfos === 'object' && !Util.ObjectIsEmpty(postInfos)) {
        pinfs = Object.values(postInfos);
      } else if (Array.isArray(postInfos) && !Util.ArrayIsEmpty(postInfos)) {
        pinfs = postInfos;
      } else {
        return null;
      }

      const stats = {};
      pinfs.forEach((pinf) => {
        const id = XPostInfo.GetId(pinf);
        if (!id) {
          return;
        }

        if (id.startsWith(PREFIX_POST_ID)) {
          stats[id] = XPostStats.CreateFromPostInfo(pinf, !wrap);
        } else if (id.startsWith((PREFIX_COMMENT_ID))) {
          stats[id] = XMCommentStats.CreateFromPostInfo(pinf, !wrap);
        }
      });

      return map ? stats : Object.values(stats);
    } catch (err) {
      // EC.API_ERROR(`${_m}: error: ${err} with postId list: ${postIds} `);
      throw err;
    }
  }


  static HasEssentialData(postInfo) {
    if (postInfo == null) { return false; }

    const jsonInfo = XPostInfo.Unwrap(postInfo);
    let verdict = false;
    if (jsonInfo[XObjectProps.ID] && jsonInfo[XMSocialIndexable.PROP_TEXT]) {
      verdict = true;
    }
    return verdict;
  }

  /**
   * Fetch post data and construct XPostInfo in Redis Cache
   *
   * @param {string} postId
   * @return {XPostInfo} if post exists
   * @throws {XError} POST_NOTFOUND error if post is not found in database
   *
   * @see ~ReloadPostInfo todo
   * @see ~ClearPostInfo todo
   */
  static async CachePostInfo_fromDB(postId) {
    const _m = 'CachePostInfo_fromDB';

    let postInfo;
    const isPost = postId.startsWith(PREFIX_POST_ID);
    const isComment = postId.startsWith(PREFIX_COMMENT_ID);

    let xmPost;
    let xPostInfo;
    if (isPost) {
      // xmPost = await PostHelper.GetPostById(postId);
      xmPost = await AppService.LoadXObject(postId, ModelType.POST, null, false);
    } else if (isComment) {
      // xmPost = await CommentHelper.GetCommentById(postId);
      xmPost = await AppService.LoadXObject(postId, ModelType.COMMENT, null, false);
    } else {
      return null;
    }
    try {
      postInfo = xmPost ? PostInfoHelper.FillFromXMPost(null, xmPost, false) : null;
      const isDelete = XObject.IsDeleted(postInfo);
      if (postInfo && !isDelete) {
        postInfo = await PostInfoHelper.FillPostInfoWithStats(postId, postInfo);
      }
      if (postInfo) {
        // set version
        XPostInfo.SetVersionTitle(postInfo, CURRENT_POSTINFO_VERSION);

        xPostInfo = XPostInfo.Wrap(postInfo);
        await PostInfoHelper.SetPostInfo_Cache(xPostInfo, {
          expiry: isDelete ? EXPIRE_TIME_FOR_DEL : EXPIRE_TIME_FOR_OBJECT
        });
      }

    } catch (err) {
      logger.error('error', { err, _m });
    }
    return xPostInfo;
  }

  /**
   * Fill postInfo with stats retrieved from DB directly. Post/comment stats are no longer cached independently
   * but are included in postInfo.
   * @param {string} postId
   * @param {XPostInfo} postInfo
   * @returns {Promise<{}>}
   * @constructor
   */
  static async FillPostInfoWithStats(postId, postInfo = {}) {
    postInfo = XPostInfo.Unwrap(postInfo);
    const isPost = postId.startsWith(PREFIX_POST_ID);
    const isComment = postId.startsWith(PREFIX_COMMENT_ID);
    // let postStatsFromCache;
    let postStatsFromDB;
    if (isPost) {
      // postStatsFromCache = await PostStatHelper.GetPostStatsValues(postId, _STATS_FIELDS);
      postStatsFromDB = await StatHelper.MultiGetFromDB([postId], _STATS_FIELDS, ModelType.POST_STATS, false);
    } else if (isComment) {
      // postStatsFromCache = await CommentStatHelper.GetCommentStatsValues(postId, _STATS_FIELDS);
      postStatsFromDB = await StatHelper.MultiGetFromDB([postId], _STATS_FIELDS, ModelType.COMMENT_STATS, false);
    } else {
      return postInfo;
    }
    if (postStatsFromDB[postId]) {
      _.forEach(postStatsFromDB[postId], (value, label) => {
        if (_STATS_FIELDS.includes(label)) {
          postInfo[label] = value;
        }
      });
    }
    return postInfo;
  }

  /**
   * Update XPostInfo fields in cache.
   *
   * WARNING: DO NOT Write Stats Fields with SET, unless it is
   * for the purpose of OVERRIDE!  Use Incr/Decr to ensure lossless
   * values if the field(s) are being concurrently written.
   *
   * @param {XPostInfo} postInfo
   */
  static async SetPostInfo_Cache(postInfo, options = {}) {
    const _m = 'SetPostInfo_Cache';
    if (!postInfo) {
      throw EC.SYS_BAD_ARGS('invalid argument');
    }
    const postId = XPostInfo.GetPostId(postInfo) ? XPostInfo.GetPostId(postInfo) : XPostInfo.GetId(postInfo);
    // return ObjectHelper.CacheObject(postInfo, ModelType.POST_INFO);
    const [key] = RedisUtil.DerivePostInfoKey(postId);
    const postInfoCache = StorageManager.GetInstance().getPostInfoCache();
    try {
      const expiry = options.expiry || EXPIRE_TIME_FOR_OBJECT;
      const result = await RedisUtil.SetAndExpireFieldValues(postInfoCache, key, XPostInfo.Unwrap(postInfo), expiry);
      return result;
    } catch (err) {
      logger.error('error', { err, postId, _m });
    }
  }

  static async UpdatePostInfo_Cache(objectId, fieldsMap, options = {}) {
    const redisClient = StorageManager.GetInstance().getPostInfoCache();
    const expiry = options.expiry;
    const [key] = RedisUtil.DerivePostInfoKey(objectId);
    const items = RedisUtil.Object2HMSET(fieldsMap);
    if (Util.ArrayIsEmpty(items) || !key) {
      return null;
    }
    return new Promise((resolve, reject) => {
      redisClient.exists(key)
        .then(async (existsr) => {
          if (existsr === 0) {
            await PostInfoHelper.CachePostInfo_fromDB(objectId);
          }
          const trans = redisClient.multi();
          trans.hmset(key, items);
          if (expiry) {
            trans.expire(key, expiry);
          }
          trans.exec((err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Extract data from post object data (in JSON)
   * that are relevant and fill them in the given
   * post info json object
   *
   * @param {XPostInfo} postInfo container to fill or null to create
   * @param {XMPost} xmPost can be json also
   * @param {boolean} wrap true to wrap with XPostInfo, false to return JSON
   *
   * @return {XPostInfo} a json postInfo structure, either same
   * one as passed in to fill, or newly created
   */
  static FillFromXMPost(postInfo, xmPost, wrap) {
    const _m = 'FillFromXMPost';
    const postData = XMUser.Unwrap(xmPost);
    if (Util.IsNull(postData)) {
      logger.warn('Null post to copy.', { _m });
      return null;
    }

    let xmPostInfo;
    if (postInfo == null) {
      xmPostInfo = new XPostInfo();
      xmPostInfo._setTypeID();
      postInfo = xmPostInfo.getData();
    }
    const fields = _PINFO_FIELDS;

    const copyFields = (labels) => {
      let label;
      for (let i = 0; i < labels.length; i++) {
        // let toNumber = false;
        label = labels[i];

        if (Util.IsNull(postData[label])) { continue; }

        const value = postData[label];
        if (value && value !== '') { postInfo[label] =  value; }
      }
    };
    copyFields(fields);
    const postId = postData._id ? postData._id.toString() : null;
    if (postId) {
      postInfo[XObjectProps.ID] = postId;
    }
    return wrap ? XPostInfo.Wrap(postInfo) : postInfo;
  } // FillFromXMPost

  static async ClearPostInfo_Cache(postId) {
    const _m = 'ClearPostInfo_Cache';
    const [key] = RedisUtil.DerivePostInfoKey(postId);
    const userInfoCache = StorageManager.GetInstance().getPostInfoCache();

    return RedisUtil.DeleteKey(userInfoCache, key);
  }

  static async ReloadPostInfo(postId) {
    const _m = 'ReloadPostInfo';

    let cacheResult;
    try {
      await PostInfoHelper.ClearPostInfo_Cache(postId);
      cacheResult = await PostInfoHelper.CachePostInfo_fromDB(postId);
    } catch (lerr) {
      logger.error('error', { err: lerr, _m });
    }
    return cacheResult;
  }

  static MaskPostTags(xPostInfo) {
    if (Util.IsNull(xPostInfo)) {
      return [[], xPostInfo];
    }

    let text = xPostInfo.getText();
    const hashTagReg = /#(\S)*\s/g;
    let hashTags = text.match(hashTagReg);
    if (Util.ArrayIsEmpty(hashTags)) {
      hashTags = [];
    } else {
      hashTags = hashTags.map(tag => tag.trim());
    }
    const userTags = xPostInfo.getUsertags([]);
    hashTags.forEach((ht, index) => {
      const tag = `#${ht}`;
      const pattern = new RegExp(tag, 'gi');
      text = text.replace(pattern, ` www.${index}-h.cn `);
    });
    text = text.replace(/\s\s/g, ' ');
    userTags.forEach((ut, index) => {
      const tag = `@${ut}`;
      const pattern = new RegExp(tag, 'gi');
      text = text.replace(pattern, ` www.${index}-u.cn `);
    });
    text = text.replace(/\s\s/g, ' ');
    return [hashTags, userTags, text];
  }

  static RecoverPostTags(text, hashTags, userTags) {
    if (Util.StringIsEmpty(text)) {
      return text;
    }
    hashTags.forEach((ht, index) => {
      const tag = `#${ht}`;
      const pattern = new RegExp(`www.${index}-h.cn`, 'gi');
      text = text.replace(pattern, tag);
    });
    userTags.forEach((ut, index) => {
      const tag = `@${ut}`;
      const pattern = new RegExp(`www.${index}-u.cn`, 'gi');
      text = text.replace(pattern, tag);
    });
    return text;
  }
}
