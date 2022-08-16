import AppService from '../AppService';
import PostHelper from './PostHelper';
import EC from '../../core/ErrorCodes';
import XMPost from '../../core/model/post/XMPost';
import ModelType, { LanguageCodes, PTYPE_POLL } from '../../core/model/ModelConsts';
import ServiceUtil from '../ServiceUtil';
import XMSocialIndexable from '../../core/model/social/XMSocialIndexable';
import Util from '../../core/Util';
import XError from '../../core/model/XError';
import gettrLogger from '../../core/GettrLogger';
import UserHelper from '../user/UserHelper';

const _CLSNAME = 'PostServiceV2';
const logger = gettrLogger(_CLSNAME);

const CHANGE_TXT_EXPIRED = 3600000; // 1 hour in ms
const CHANGE_TXT_MAX = 5;

class PostServiceV2 extends AppService {
  // --------------------- POST UPDATE -------------------------
  static async ChangePostText(apiContext, postId, content) {
    const _m = 'ChangePostText';

    let result;
    let changeObj = {};
    try {
      // Load post
      const postObj = await PostHelper.LoadPost(postId);
      const postData = postObj.getData();

      // Check post type
      const postType = XMPost.GetObjectField(postObj, XMPost.PROP_POST_TYPE, '');
      if (postType === PTYPE_POLL) {
        throw EC.POST_TYPE_NOT_ALLOWED('poll post is not allowed.');
      }

      // Check expired
      const createdTS = postObj.getCreatedTS();
      const deltaTime = (Date.now() - createdTS);
      if (deltaTime > CHANGE_TXT_EXPIRED) {
        throw EC.CHANGE_POST_TEXT_EXPIRED('change post text expired.');
      }

      // Check limits
      const history = XMPost.GetObjectField(postObj, XMPost.PROP_TEXT_HISTORY, []);
      if (history.length >= CHANGE_TXT_MAX) {
        throw EC.CHANGE_POST_TEXT_EXCEED_LIMITS('change post text exceed limits.');
      }

      // Check permission
      const userInfo = apiContext.getUserInfo();
      await AppService.CheckUserCanPOST(userInfo, postObj);

      // Init text
      const text = content[XMSocialIndexable.PROP_TEXT];
      changeObj[XMSocialIndexable.PROP_TEXT] = text || null;

      // Init preview
      const prevSrc = content[XMSocialIndexable.PROP_PREVIEW_URL];
      const prevImg = content[XMSocialIndexable.PROP_PREVIEW_IMAGE_URL];
      const ttl = content[XMSocialIndexable.PROP_PREVIEW_TTL];
      const dsc = content[XMSocialIndexable.PROP_PREVIEW_DESC];
      changeObj[XMSocialIndexable.PROP_PREVIEW_URL] = prevSrc || null;
      changeObj[XMSocialIndexable.PROP_PREVIEW_IMAGE_URL] = prevImg || null;
      changeObj[XMSocialIndexable.PROP_PREVIEW_TTL] = ttl || null;
      changeObj[XMSocialIndexable.PROP_PREVIEW_DESC] = dsc || null;

      // Init userTags
      let userTags = content[XMSocialIndexable.PROP_USERTAGS];
      userTags = userTags ? Util.UniqueArray(userTags.map(tag => tag.toLowerCase())) : null;
      userTags = await UserHelper.ReplaceExistingUsernamesWithUserIds(userTags) || [];
      changeObj[XMSocialIndexable.PROP_USERTAGS] = userTags;

      // Remove script
      const fields = [XMSocialIndexable.PROP_TEXT, XMSocialIndexable.PROP_PREVIEW_URL, XMSocialIndexable.PROP_PREVIEW_IMAGE_URL, XMSocialIndexable.PROP_PREVIEW_TTL, XMSocialIndexable.PROP_PREVIEW_DESC, XMSocialIndexable.PROP_USERTAGS];
      changeObj = ServiceUtil.FilterScriptForObj(changeObj, fields);

      // Assert content
      const [assertResult, assertErr] = await PostHelper.AssertPostUpdate(apiContext, changeObj, fields);
      if (!assertResult) {
        throw assertErr;
      }

      // Set txt_hist
      const oldText = postObj.getText();
      const oldTextLanguage = postObj.getTextLanguage();
      if (postData[XMPost.PROP_TEXT_HISTORY]) {
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

      // Update post
      result = await PostHelper.UpdatePost(apiContext, postObj, changeObj);
    } catch (err) {
      logger.error('error', { err, _m });
      throw XError.FromError(err);
    }

    return result;
  }
}

export default PostServiceV2;
