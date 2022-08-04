
import {
  ModelType,
  ModelFolder,
  MessageProps,
  StatsProps,
  PREFIX_POST_ID,
  PREFIX_COMMENT_ID,
  XObjectProps, UserProps
} from '../ModelConsts';
import XMObject from '../XMObject';
import Util from '../../Util';
import HashtagUtil from '../../util/HashtagUtil';

const _CLSNAME = 'XMSocialIndexable'; // match class name

/**
 * Base class for any persistent object that
 * can associate hashtag and usertags (mentions),
 * reference to URLs and include multimedia.
 *
 */
export class XMSocialIndexable extends XMObject {
  static get PROP_HASHTAGS() { return 'htgs'; }
  static get PROP_USERTAGS() { return 'utgs'; }
  static get PROP_MODTAGS() { return 'mtgs'; }
  static get PROP_TEXT() { return 'txt'; }
  static get PROP_TEXT_LANG() { return 'txt_lang'; }
  static get PROP_IMAGE_URLS() { return 'imgs'; }
  static get PROP_ORIG_VIDEO_URL() { return 'ovid'; }
  static get PROP_MAIN_IMAGE_URL() { return 'main'; }
  static get PROP_MD5() { return 'md5'; }
  static get PROP_COMMENT_DISABLED() { return 'cm_noadd'; }
  static get PROP_ISNOTFOUND() { return 'nfound'; }
  static get PROP_EMBEDDED_POST() { return 'epst'; }
  static get PROP_PARENT_OWNER_ID() { return MessageProps.PARENT_OWNER_ID; }
  static get PROP_META() { return 'meta'; }
  static get PROP_DSC() { return MessageProps.DESC; }
  static get PROP_ISPINPOST() { return 'is_pinned'; }
  static get PROP_POST_TYPE() { return MessageProps.POST_TYPE; }
  static get PROP_STREAM_ID() { return 'sid'; }

  static get PROP_PREVIEW_URL() { return 'prevsrc'; }
  static get PROP_PREVIEW_IMAGE_URL() { return 'previmg'; }
  static get PROP_PREVIEW_TTL() { return XObjectProps.TITLE; }
  static get PROP_PREVIEW_DESC() { return XObjectProps.DESC; }
  static get PREVIEW_PROPS() {
    return [
      this.PROP_PREVIEW_IMAGE_URL,
      this.PROP_PREVIEW_URL,
      this.PROP_PREVIEW_TTL,
      this.PROP_PREVIEW_DESC,
    ];
  }

  static get PROP_COMMENT_POST_ID() { return MessageProps.COMMENT_POST_ID; }
  static get PROP_IMPORT_POST_ID() { return MessageProps.IMPORT_POST_ID; }
  static get PROP_REPOSTID_TRACE() { return MessageProps.RPS_IDS; }
  static get PROP_REPOSTER_TRACE() { return MessageProps.RPS_OWNER_IDS; }

  // twitter
  static get PROP_TWT_LIKEDBY_POST() { return StatsProps.TWT_LIKEDBY_POST; }
  static get PROP_TWT_POST_SHAREDBY() { return StatsProps.TWT_POST_SHAREDBY; }
  static get PROP_TWT_RETWT_ORIGINAL_URL() { return 'twt_rtourl'; }
  static get PROP_TWT_RETWT_POST() { return 'twt_rtpst'; }

  // vision
  static get PROP_MAIN_MUSIC_ID() { return 'main_music'; }
  static get PROP_SOUND_IDS() { return 'sound_ids'; }
  static get PROP_STICKER_IDS() { return 'sticker_ids'; }

  // limits
  static get POST_TXT_MAX_LENGTH() { return 5000; }
  static get POST_REQ_MAX_LENGTH() { return 32000; }
  static get POST_PREVTTL_MAX_LENGTH() { return 1000; }
  static get POST_PREVDSC_MAX_LENGTH() { return 777; }
  static get POST_META_MAX_LENGTH() { return 25000; }
  static get POST_POLL_MAX_LENGTH() { return 5000; }
  static get STREAMID_MAX_LENGTH() { return 32; }
  static get MUSICID_MAX_LENGTH() { return 32; }
  static get POST_IMPORT_REQ_MAX_LENGTH() { return 7000; }
  static get POST_VID_MAX_DURATION() { return 1000; }
  static get VISION_SOUNDS_MAX() { return 10; }
  static get VISION_STICKER_MAX() { return 10; }
  static get POLL_OPTIONS_MAX() { return 20; }
  static get POLL_OPTIONS_DESC_MAX() { return 100; }

  // translates
  static get PROP_TRANSLATES() { return 'translates'; }
  static get PROP_SOURCE_LANG() { return 'sourceLang'; }
  static get PROP_TARGET_LANG() { return 'targetLang'; }
  static get PROP_TRANSLATED_DATE() { return 'translatedDate'; }
  static get PROP_TRANSLATED_TEXT() { return 'translatedText'; }
  static get PROP_TRANSLATED_PATH() { return 'translatedPath'; }

  // live stream
  static get PROP_LIVE_SCHEDULE() { return UserProps.LIVE_SCHEDULE; }
  static get PROP_LIVE_IS_CHAT_MUTED() { return UserProps.IS_CHAT_MUTED; }

  // poll
  static get PROP_POLL() { return 'poll'; }
  static get PROP_POLL_EXPIRE() { return 'expire'; }
  static get PROP_POLL_ACL() { return XMSocialIndexable.PROP_ACL; }
  static get PROP_POLL_MULTI() { return 'multi'; }
  static get PROP_POLL_OPTIONS() { return 'options'; }
  static get PROP_POLL_OPTIONS_DESC() { return XMSocialIndexable.PROP_DESC; }
  static get PROP_POLL_OPTIONS_IMAGES() { return XMSocialIndexable.PROP_IMAGE_URLS; }
  static get PROP_POLL_OPTIONS_VIDEO() { return XMSocialIndexable.PROP_VIDEO_URL; }
  static get PROP_POLL_STATS() { return 'stats'; }

  // edit post
  static get PROP_TEXT_HISTORY() { return 'txt_hist'; }

  static get POLL_CREATION_PROPS() {
    return [
      this.PROP_POLL_EXPIRE,
      this.PROP_POLL_ACL,
      this.PROP_POLL_MULTI,
      this.PROP_POLL_OPTIONS,
    ];
  }

  static get POLL_OPTION_PROPS() {
    return [
      this.PROP_POLL_OPTIONS_DESC,
      this.PROP_POLL_OPTIONS_IMAGES,
      this.PROP_POLL_OPTIONS_VIDEO
    ];
  }

  static get POST_CREATION_PROPS() {
    return [
      this.PROP_TEXT,
      // this.PROP_TEXT_LANG,
      // this.PROP_IMAGE_URL,
      this.PROP_IMAGE_URLS,
      this.PROP_MAIN_IMAGE_URL,
      this.PROP_VIDEO_DURATION,
      this.PROP_VIDEO_WIDTH,
      this.PROP_VIDEO_HEIGHT,
      this.PROP_VIDEO_URL,
      this.PROP_ORIG_VIDEO_URL,
      this.PROP_HASHTAGS,
      this.PROP_USERTAGS,
      this.PROP_MODTAGS,
      // this.PROP_COMMENT_DISABLED,
      this.PROP_REPOSTID_TRACE,
      this.PROP_REPOSTER_TRACE,
      this.PROP_PREVIEW_URL,
      this.PROP_PREVIEW_IMAGE_URL,
      this.VISIBILITY,
      this.PROP_ACL,
      this.PROP_COMMENT_POST_ID,
      this.PROP_TITLE,
      this.PROP_META,
      this.PROP_DSC,
      this.PROP_MD5,
      this.PROP_POST_TYPE,
      this.PROP_TEXT_LANG,
      // live stream props
      this.PROP_STREAM_ID,
      this.PROP_LIVE_SCHEDULE,
      this.PROP_LIVE_IS_CHAT_MUTED,
      // gVision props
      this.PROP_MAIN_MUSIC_ID,
      this.PROP_SOUND_IDS,
      this.PROP_STICKER_IDS,
      // poll
      this.PROP_POLL,
      // edit post props
      this.PROP_TEXT_HISTORY
    ];
  }

  static get POST_IMPORTABLE_PROPS() {
    return this.POST_CREATION_PROPS.concat([
      this.PROP_CREATED_DATE,
      this.PROP_UPDATED_DATE,
      this.PROP_OWNERID,
      this.PROP_IMPORT_POST_ID,
      this.PROP_TWT_LIKEDBY_POST,
      this.PROP_TWT_POST_SHAREDBY,
      this.PROP_TWT_RETWT_ORIGINAL_URL,
      this.PROP_TWT_RETWT_POST,
      this.PROP_TYPE,
      this.PROP_ISPINPOST,
      this.PROP_TEXT_LANG,
      // gVision props
      this.PROP_SOUND_IDS,
      this.PROP_STICKER_IDS,
    ]);
  }

  static get LIVEPOST_LIVEMANAGER_MUTABLE_PROPS() {
    return [
      this.PROP_TEXT,
      this.PROP_IMAGE_URLS,
      this.PROP_IMAGE_URL,
      this.PROP_VIDEO_URL,
      this.PROP_ORIG_VIDEO_URL,

      this.PROP_TITLE,
      this.PROP_DSC,
      this.PROP_STREAM_ID,
    ];
  }

  static get LIVEPOST_USER_MUTABLE_PROPS() {
    return [
      this.PROP_TEXT,
      this.PROP_IMAGE_URLS,
      this.PROP_IMAGE_URL,
      this.PROP_TITLE,
      this.PROP_DSC,
      this.PROP_LIVE_IS_CHAT_MUTED,
    ];
  }

  static get LIVEPOST_CREATION_PROPS() {
    return this.POST_CREATION_PROPS.concat([
      this.PROP_LIVE_SCHEDULE,
    ]);
  }

  static get XMSOCIAL_POSTINFO_PROPS() {
    return this.POST_CREATION_PROPS.concat([
      this.PROP_CREATED_DATE,
      this.PROP_UPDATED_DATE,
      this.PROP_OWNERID,
      this.PARENT_COMMENT_ID,
      this.PROP_TEXT_LANG,
      this.PROP_PARENT_OWNER_ID,
      this.PROP_TRANSLATES,
      // vision
      this.PROP_SOUND_IDS,
      this.PROP_STICKER_IDS,
      // stats fields
      StatsProps.LIKEDBY_POST,
      StatsProps.COMMENTS,
      StatsProps.POST_SHAREDBY,
      StatsProps.LIKEDBY_COMMENT,
      StatsProps.COMMENT_SHAREDBY,
      StatsProps.VIEWS_FULL_COMMENT,
      StatsProps.VIEWS_FULL_POST,
    ]);
  }

  static get XMSOCIAL_POSTINFO_STATS_PROPS() {
    return [
      // stats fields
      StatsProps.LIKEDBY_POST,
      StatsProps.COMMENTS,
      StatsProps.POST_SHAREDBY,
      StatsProps.LIKEDBY_COMMENT,
      StatsProps.COMMENT_SHAREDBY,
      StatsProps.VIEWS_FULL_COMMENT,
      StatsProps.VIEWS_FULL_POST,
    ];
  }

  constructor(clsname = _CLSNAME, props = null) {
    super(clsname, props);
    this.class = XMSocialIndexable;
  }

  getCacheProps() {
    const result = {};
    const data = this.getData();
    MessageProps.PROPS_CACHED.forEach((label) => {
      const value = data[label];
      if (value) {
        result[label] = value;
      }
    });
    return result;
  }

  /**
   * Return shared posts Ids. It's same with getId()
   * but be consistent at parent class level.
   *
   * @return {string[]}
   */
  getRepostedIds() {
    return this.get(XMSocialIndexable.PROP_REPOSTID_TRACE, null);
  }

  /**
   * Return shared posts Ids. It's same with getId()
   * but be consistent at parent class level.
   *
   * @return {string[]}
   */
  getRepostedOwnerIds() {
    return this.get(XMSocialIndexable.PROP_REPOSTER_TRACE, null);
  }
  /*
   * Return the main post's ID. This is subclass
   * implementation dependent.
   *
   * @return {boolean}
   */
  getPostId() {
    return null;
  }

  /**
   *
   * Return the import post id if the post is imported
   *
   * @return {string}
   */
  getImportPostId() {
    return this.get(XMSocialIndexable.PROP_IMPORT_POST_ID, null);
  }

  /**
   * @return {string}
   */
  getPosterId() {
    return this.getOwnerId();
  }

  /**
   * Set text part of the content. If this is a repost,
   * then text (and image/video info) are all copied
   * from the original, while the reposter's text
   * is used to store his/her add-ons.
   *
   * NOTE: current implementation does not allow text
   * change once published. This is a policy that other
   * Microblogger websites have enforced.
   *
   * @param {string} text text to set
   * @param {boolean} reScan true to scan text for hashtags
   * and mentions and update respective properties
   * @return {*} old value
   *
   * @see ~setRepostText
   */
  setText(text, reScan = true) {
    const oldValue = this.set(XMSocialIndexable.PROP_TEXT, text);
    // if (!Util.StringIsEmpty(oldValue) && (oldValue  !== text)) {
    //     this.setUpdatedTS();
    // }
    if (reScan === true) { this._processTagsAndMentions(text); }
    return oldValue;
  }

  /**
   * Set the not found flag
   *
   * @param {boolean} flag not found flag
   *
   */
  setNotFound(flag = false) {
    return this.set(XMSocialIndexable.PROP_ISNOTFOUND, flag);
  }

  /**
   * Set the not found flag
   *
   * @return {boolean} if object is not found
   *
   */
  getNotFound() {
    return this.get(XMSocialIndexable.PROP_ISNOTFOUND, false);
  }

  /**
   * Return language associated with the main text
   *
   * NOTE: This is not used at the moment.
   *
   * @param {string} langCode should be two-letter ISO-6391 code
   * @param {*} defaultVal
   */
  setTextLanguage(langCode, defaultVal = null) {
    return this.set(XMSocialIndexable.PROP_TEXT_LANG, langCode, defaultVal);
  }


  /**
   * Retrieve main text. If isShared() is true, then this holds
   * the origina post's text. Look into getRepostText() for
   * add-on text.
   *
   * @param {*} defaultVal
   * @return {string}
   *
   * @see ~getRepostText
   */
  getText(defaultVal = null) {
    return this.get(XMSocialIndexable.PROP_TEXT, defaultVal);
  }

  /**
   * Return language code associated with main text
   *
   * NOTE: This is not used at the moment
   *
   * @param {*} defaultVal
   * @return {string} should be ISO-6391 two-letter code
   */
  getTextLanguage(defaultVal = null) {
    return this.get(XMSocialIndexable.PROP_TEXT_LANG, defaultVal);
  }

  /**
   * Given text, extract hashtags and user mentions and
   * stored in in tags and mentions associated with this post
   * object.
   *
   * @param {string} text
   * @param {string} append true to add to existing list. False
   * to override
   * @return {number} number of tags + usernames found and set
   */
  _processTagsAndMentions(text, append = false) {
    const [tags, usernames] = HashtagUtil.TextScanTagsAt(text);
    let count = 0;
    if (tags.length > 0) {
      if (append === true) { this.addHashtags(tags); } else { this.setHashtags(tags); }
      count += tags.length;
    }
    if (usernames.length > 0) {
      if (append === true) { this.addUsertags(usernames); } else { this.setUsertags(usernames); }
      count += usernames.length;
    }
    return count;
  }

  /**
   *
   * @param {string[]} tagnames should be one or more hashtag strings
   * I think single hashtag will work too (string type).
   *
   * @return {boolean} string added
   */
  addHashtags(tagnames) {
    if ((tagnames == null || tagnames.length <= 0)) {
      return false;
    }
    const data = this.getData(true);
    const updated = XMSocialIndexable._AddTags(data, XMSocialIndexable.PROP_HASHTAGS, tagnames);
    if (updated) { this.setDirty(); }
    return updated;
  }

  /**
   *
   * @param {string[]} tagnames array of tag names
   * @return {boolean} true to replace all previous hashtags with given array
   */
  setHashtags(tagnames) {
    if ((tagnames == null || tagnames.length <= 0)) {
      return false;
    }
    const data = this.getData(true);
    const updated = XMSocialIndexable._SetTags(data, XMSocialIndexable.PROP_HASHTAGS, tagnames);
    if (updated) { this.setDirty(); }
    return updated;
  }

  /**
   * Return an array of hashtags
   *
   * @param {*} defaultVal
   * @return {string[]}
   */
  getHashtags(defaultVal = null) {
    const data = this.getData(false);
    return data ? XMSocialIndexable._GetTags(data, XMSocialIndexable.PROP_HASHTAGS, defaultVal) : defaultVal;
  }

  /**
   *
   * @param {string} tagname hashtag name to search
   * @return {boolean}
   */
  hasHashtags(tagname) {
    const data = this.getData(true);
    return XMSocialIndexable._HasTag(data, XMSocialIndexable.PROP_HASHTAGS, tagname, true);
  }

  /**
   *
   * @param {string[]} labels should be one or more usernames in an array.
   * I think single string will work too.
   *
   * @return {boolean} string added
   */
  addUsertags(labels) {
    if ((labels == null || labels.length <= 0)) {
      return false;
    }
    const data = this.getData(true);
    const updated = XMSocialIndexable._AddTags(data, XMSocialIndexable.PROP_USERTAGS, labels);
    if (updated) { this.setDirty(); }
    return updated;
  }

  /**
   *
   * @param {string[]} labels array of strings, which should be usernames
   * @return {boolean} true to replace all mention text with given text array
   */
  setUsertags(labels) {
    if ((labels == null || labels.length <= 0)) {
      return false;
    }
    const data = this.getData(true);
    const updated = XMSocialIndexable._SetTags(data, XMSocialIndexable.PROP_USERTAGS, labels);
    if (updated) { this.setDirty(); }
    return updated;
  }

  /**
   * Return an array of mention labels (usernames)
   *
   * @param {*} defaultVal
   * @return {string[]}
   */
  getUsertags(defaultVal = null) {
    const data = this.getData(false);
    return data ? XMSocialIndexable._GetTags(data, XMSocialIndexable.PROP_USERTAGS, defaultVal) : defaultVal;
  }

  /**
   *
   * @param {string} username
   * @return {boolean}
   */
  hasUsertags(username) {
    const data = this.getData(true);
    return XMSocialIndexable._HasTag(data, XMSocialIndexable.PROP_USERTAGS, username, true);
  }

  /**
   *
   * @param {string[]} modTags should be one or more moderation tag strings
   * I think single hashtag will work too (string type).
   *
   * @return {boolean} string added
   */
  addModerationTags(modTags) {
    if ((modTags == null || modTags.length <= 0)) {
      return false;
    }
    const data = this.getData(true);
    const updated = XMSocialIndexable._AddTags(data, XMSocialIndexable.PROP_MODTAGS, modTags);
    if (updated) { this.setDirty(); }
    return updated;
  }

  /**
   *
   * @param {string[]} modTags array of moderation tags
   * @return {boolean} true to replace all previous moderation tags with given array
   */
  setModerationTags(modTags) {
    if ((modTags == null || modTags.length <= 0)) {
      return false;
    }
    const data = this.getData(true);
    const updated = XMSocialIndexable._SetTags(data, XMSocialIndexable.PROP_MODTAGS, modTags);
    if (updated) { this.setDirty(); }
    return updated;
  }

  /**
   * Return an array of moderation tags
   *
   * @param {*} defaultVal
   * @return {string[]}
   */
  getModerationTags(defaultVal = null) {
    const data = this.getData(false);
    return data ? XMSocialIndexable._GetTags(data, XMSocialIndexable.PROP_MODTAGS, defaultVal) : defaultVal;
  }

  /**
   *
   * @param {string} modTag moderation tags name to search
   * @return {boolean}
   */
  hasModerationTags(modTag) {
    const data = this.getData(true);
    return XMSocialIndexable._HasTag(data, XMSocialIndexable.PROP_MODTAGS, modTag, true);
  }

  setMeta(meta, defaultVal = null) {
    return this.set(XMSocialIndexable.PROP_META, meta, defaultVal);
  }

  getMeta(defaultVal = null) {
    return this.get(XMSocialIndexable.PROP_META, defaultVal);
  }


  // ------------------------ MEDIA HANDLING METHODS -----------------------------

  /**
   * Return the URL of the preview source site.
   *
   * @param {*} defaultVal
   * @return {string[]}
   */
  getPreviewURL(defaultVal = null) {
    return this.get(XMSocialIndexable.PROP_PREVIEW_URL, defaultVal);
  }

  /**
   * Determine if this object has a preview URL, and the URL is not empty
   * string.
   *
   * @return {boolean} true if a string exists for the preview URL property
   */
  hasPreview() {
    return this.has(XMSocialIndexable.PROP_PREVIEW_URL, false);
  }

  /**
   * Set the URL of the source of preview. This is the site
   * where the image, title, and desc are extracted from.
   *
   * @param {string[]} url preview image link
   * @return {boolean} true if updated successfully
   *
   * @see ~hasPreview
   * @see ~getPreviewURL
   */
  setPreviewURL(url) {
    return this.set(XMSocialIndexable.PROP_PREVIEW_URL, url);
  }


  /**
   * Return the URL of the preview image. Preview image differs from
   * main or other image URLs as it can be generated or referenced
   * from somewhere else.
   *
   * @param {*} defaultVal
   * @return {string[]}
   */
  getPreviewImageURL(defaultVal = null) {
    return this.get(XMSocialIndexable.PROP_PREVIEW_IMAGE_URL, defaultVal);
  }


  /**
   * Set the image URL desingated for preview. This is different
   * the main image URL or for additional images
   *
   * @param {string[]} url preview image link
   * @return {boolean} true if updated successfully
   *
   * @see ~hasPreview
   * @see ~getPreviewURL
   * @see ~setMainImageURL
   * @see ~addImageURL
   */
  setPreviewImageURL(url) {
    return this.set(XMSocialIndexable.PROP_PREVIEW_IMAGE_URL, url);
  }


  /**
   *
   *
   * NOTE: Current preview title is set into object's main title. This
   * helps MessageFactory to use it to display in the activity and
   * notification headliner.
   *
   * @param {string} title
   * @return {string} previous value
   */
  setPreviewTitle(title) {
    return this.setTitle(title);
  }

  /**
   *
   * @param {string=} defaultVal
   * @param {string}
   */
  getPreviewTitle(defaultVal = null) {
    return this.getTitle(defaultVal);
  }

  /**
   *
   * @param {string} text
   */
  setPreviewDescription(text) {
    return this.setDescription(text);
  }

  /**
   *
   * @param {string=} defaultVal
   * @return {string}
   */
  getPreviewDescription(defaultVal = null) {
    return this.getDescription(defaultVal);
  }


  /**
   * Return the URL of the main image. Main image differs from
   * uploaded URLs as it can be a choosen image, or can be a pre-
   * determined preview image.
   *
   * @param {*} defaultVal
   * @return {string[]}
   */
  getMainImageURL(defaultVal = null) {
    return this.get(XMSocialIndexable.PROP_MAIN_IMAGE_URL, defaultVal);
  }

  /**
   *
   * @param {string[]} urls array of strings, which should be URLs, but can be a single string!!
   * @return {boolean} true if updated successfully
   */
  setMainImageURL(url) {
    return this.set(XMSocialIndexable.PROP_MAIN_IMAGE_URL, url);
  }

  /**
   * Add an URL to the image URL array
   *
   * @param {string} url image URL to add
   * @return {boolean} true if added
   */
  addImageURL(url) {
    return this.addWord(XMSocialIndexable.PROP_IMAGE_URLS, url);
  }

  /**
   *
   * @param {string[]} urls array of strings, which should be URLs, but can be a single string!!
   * @return {boolean} true if updated successfully
   */
  setImageURLs(urls) {
    return this.setWords(XMSocialIndexable.PROP_IMAGE_URLS, urls);
  }

  /**
   * Return the URLs of all uploaded images. This is really URI
   * without the host prefix. If you want to have prefix included
   * use ~getFQImageURLs()
   *
   * @param {*} defaultVal
   * @return {string[]}
   */
  getImageURLs(defaultVal = null) {
    return this.getWords(XMSocialIndexable.PROP_IMAGE_URLS, defaultVal);
  }

  /**
   * @return {number} number of images stracked in this post. 0 means none
   */
  getImageCount() {
    return this.getWordCount(XMSocialIndexable.PROP_IMAGE_URLS);
  }

  /**
   * Has one or more images?
   *
   * @return {boolean}
   */
  hasImages() {
    return this.getWordCount(XMSocialIndexable.PROP_IMAGE_URLS) > 0;
  }

  /**
   * Set the link to the originally uploaded video file.
   *
   * @param {string} url should be fully qualified, unless it's
   * within default domain.
   *
   * @see ~setVideoUrl()
   * @see ~getVideoUrl()
   * @see ~getOriginalVideoUrl()
   */
  setOriginalVideoUrl(url) {
    return this.set(XMSocialIndexable.PROP_ORIG_VIDEO_URL, url);
  }

  /**
   * Return the link to the originally uploaded video file.
   *
   * @param {*} defaultVal
   * @return {string}
   *
   * @see ~setVideoUrl()
   * @see ~setOriginalVideoUrl()
   */
  getOriginalVideoUrl(defaultVal = null) {
    return this.get(XMSocialIndexable.PROP_ORIG_VIDEO_URL, defaultVal);
  }


  /**
   * Determine if there is a link to the video (not the original)
   *
   * @return {boolean}
   *
   * @see ~setVideoUrl()
   * @see ~setOriginalVideoUrl()
   * @see ~getOriginalVideoUrl()
   */
  hasVideo() {
    return !!this.getVideoUrl();
  }

  /**
   * Determine of this object has either a video or images.
   *
   * @return {boolean}
   */
  hasMedia() {
    return this.hasVideo() || this.hasImages();
  }

  /**
   * Enable/disable adding comments. By default add comment is enabled
   * to save extra storage bytes. So only use this if desired to disable,
   * or re-enable after disabling.
   *
   * @param {boolean} flag false to disable comments
   * @return {boolean} previous set value
   */
  setCanAddComment(flag) {
    return this.set(XMSocialIndexable.PROP_COMMENT_DISABLED, flag);
  }

  /**
   * Return whether this social object allows comment. If commenting
   * is not allowed, that does not mean there aren't any comments!
   *
   * @param {boolean} defaultVal if there is no value, return this (true)
   * @return {boolean} true to allow adding comments, false to disallow
   */
  canAddComment(defaultVal = true) {
    return this.get(XMSocialIndexable.PROP_COMMENT_DISABLED, defaultVal);
  }


  /**
   * Track the original post (postId, userId). For storage, it'll be stored
   * in the post/poster list but as the first element @ index 0.
   *
   * @param {string} postId original post Id
   * @param {string} userId original poster's userId
   * @return {boolean} true if original post id/user set/replaced
   */
  setOriginalPostInfo(postId, userId) {
    const updated1 = postId ? this.setWordAt(XMSocialIndexable.PROP_REPOSTID_TRACE, 0, postId) : false;
    const updated2 = userId ? this.setWordAt(XMSocialIndexable.PROP_REPOSTER_TRACE, 0, userId) : false;
    return (updated1 || updated2);
  }

  /**
   * Return the ID of the original post, if this happens to be
   * a repost of another.
   *
   * @param {*} defaultVal
   * @return {string} original post ID, or null this is the original
   *
   * @see ~isShared
   */
  getOriginalPostId(defaultVal = null) {
    return this.getWordAt(XMSocialIndexable.PROP_REPOSTID_TRACE, 0, defaultVal);
  }

  /**
   *
   * @param {*} defaultVal
   * @return {string} original poster's userId
   */
  getOriginalPosterId(defaultVal = null) {
    return this.getWordAt(XMSocialIndexable.PROP_REPOSTER_TRACE, 0, defaultVal);
  }


  /**
   * Determine if the post object is a shared (repost) object. This means
   * it references an original post.
   */
  isShared() {
    return Util.NotNull(this.getOriginalPostId(null));
  }

  /**
   * Track a postId and poster's userId as a reposter. It's added to end of
   * the array, which orders from original poster to the latest reposter
   *
   * @param {string} postId re-posted post Id
   * @param {string} userId re-poster's userId
   *
   * @return {boolean} true if entry appended
   */
  addRepost(postId, userId) {
    const updated1 = this.addWord(XMSocialIndexable.PROP_REPOSTID_TRACE, postId, false);
    const updated2 = this.addWord(XMSocialIndexable.PROP_REPOSTER_TRACE, userId, false);
    return (updated1 || updated2);
  }

  /**
   * Return an array of postIds, starting with the original poster to the
   * latest
   *
   * @param {*} defaultVal return this if there is no such property in JSON
   * @return {string[]=}
   *
   * @see ~addRepost
   * @see ~getPosterIdList
   */
  getPostIdList(defaultVal = null) {
    return this.getWords(XMSocialIndexable.PROP_REPOSTID_TRACE, defaultVal);
  }

  /**
   * Return an array of poster Ids, starting with the original poster to the
   * latest
   *
   * @param {*} defaultVal return this if there is no such property in JSON
   * @return {string[]=}
   *
   * @see ~addRepost
   * @see ~getPostIdList
   */
  getPosterIdList(defaultVal = null) {
    return this.getWords(XMSocialIndexable.PROP_REPOSTER_TRACE, defaultVal);
  }

  /**
   * Return all reposter's userIds. The original poster Id will not be included.
   *
   * @param {boolean} omitReposter true to remove all reposters from the trace
   * list
   * @param {*} defaultVal
   * @return {string[]=}
   */
  getReposterIdList(omitReposter = true, defaultVal = null) {
    const allPosterIds = this.getPosterIdList(null);
    const reposters = allPosterIds ? [...allPosterIds] : null;
    const reposterCount = reposters ? reposters.length : 0;
    if (reposterCount > 0) {
      // remove the original poster
      reposters.splice(0, 1);
    }
    if ((omitReposter === true) && reposterCount > 0) {
      const posterId = this.getOwnerId();
      let omitIdx = reposters.indexOf(posterId);
      while (omitIdx >= 0) {
        reposters.splice(omitIdx, 1);
        omitIdx = reposters.indexOf(posterId);
      }
    }
    return reposters;
  }

  /**
   * Determine if the given postId is found in the reppost trace list.
   *
   * @param {string} postId
   * @return {boolean}
   */
  hasPostId(postId) {
    return this.hasWord(XMSocialIndexable.PROP_REPOSTID_TRACE, postId);
  }

  /**
   * Look for a post by ID in the traces of reposts
   *
   * @param {string} userId
   * @return {boolean}
   */
  hasPosterId(userId) {
    return this.hasWord(XMSocialIndexable.PROP_REPOSTER_TRACE, userId);
  }

  // -------------------- POST EMBEDDING ----------------------


  /**
   * Determine if the repost object is actually embedded in this
   * post object.
   *
   * @return {boolean}
   *
   * @see ~setRepostObject
   * @see ~getRepostObject
   */
  hasEmbeddedPost() {
    return Util.NotNull(this.get(XMSocialIndexable.PROP_EMBEDDED_POST, null));
  }

  /**
   *
   * @param {*} defaultVal
   * @return {XMPost}
   */
  getEmbeddedPost(defaultVal = null) {
    return this.getX(XMSocialIndexable.PROP_EMBEDDED_POST, defaultVal);
  }

  /**
   *
   * @param {*} defaultVal
   * @return {XMPost}
   */
  getSharedPost(defaultVal = null) {
    const postAux = this.getAuxData();
    const sharedPost = postAux ? postAux[ModelType.SHARED_POST] : null;
    return XMSocialIndexable.Wrap(sharedPost);
  }

  /**
   * Return the text that is inside the embedded repost object
   *
   * @param {*} defaultVal
   * @return {string} if null, then it's possible repost object
   * is not embedded.
   */
  getEmbeddedPostText(defaultVal = null) {
    const repostObj = this.getEmbeddedPost(null);
    return repostObj ? repostObj.getText(defaultVal) : defaultVal;
  }

  /**
   * Return language code associated with repost text
   *
   * @param {*} defaultVal
   * @return {string} should be ISO-6391 two-letter code
   */
  getEmbeddedPostTextLanguage(defaultVal = null) {
    const repostObj = this.getEmbeddedPost(null);
    return repostObj ? repostObj.getTextLanguage(defaultVal) : defaultVal;
  }

  /**
   * Remove embedded content
   */
  clearEmbeddedPost() {
    return this.clear(XMSocialIndexable.PROP_EMBEDDED_POST);
  }

  /**
   * @return {boolean} false - override by XMComment subclass
   */
  isComment() {
    return false;
  }

  /**
   * @return {boolean} false - override by XMPost subclass
   */
  isPost() {
    return false;
  }

  /**
   * @return {boolean} false - override by XMPost subclass
   */
  isNotFoundPost() {
    return false;
  }

  /**
   * @return {boolean} false - override by XMPost subclass
   */
  isNotFoundComment() {
    return false;
  }

  // *************************************************************
  //
  // Class/static methods.
  //
  // *************************************************************

  /**
   * No folder to store at this level since it's
   * a base class
   */
  static GetFolderName() {
    return ModelFolder.NONE;
  }

  /**
   *
   * @return {null} no type
   */
  static GetTypeID() {
    return ModelType.SOCIAL_INDEXABLE;
  }


  /**
   * Return the ID of the original post, if this happens to be
   * a repost of another.
   *
   * @param {{}} jsonObj
   * @param {*} defaultVal
   * @return {string} original post ID, or null this is the original
   *
   * @see ~IsShared
   */
  static GetOriginalPostId(jsonObj, defaultVal = null) {
    return XMSocialIndexable.GetWordAt(jsonObj, XMSocialIndexable.PROP_REPOSTID_TRACE, 0, defaultVal);
  }

  /**
   * Determine if the post object is a shared (repost) object. This means
   * it references an original post.
   *
   * @param {{}} jsonObj
   * @return {boolean}
   */
  static IsShared(jsonObj) {
    return Util.NotNull(XMSocialIndexable.GetOriginalPostId(jsonObj, null));
  }

  /**
   * Return whether the object has been marked as not found
   *
   * @param {*} defaultVal
   */
  static IsNotFound(jsonObj) {
    return XMSocialIndexable.GetObjectField(jsonObj, XMSocialIndexable.PROP_ISNOTFOUND, false) === true;
  }

} // class PostBase

XMSocialIndexable.RegisterType(XMSocialIndexable);


export default XMSocialIndexable;
