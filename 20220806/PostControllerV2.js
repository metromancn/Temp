import BaseController from '../BaseController';
import gettrLogger from '../../../core/GettrLogger';
import REST from '../../../core/net/REST';
import PollClient from '../../../services/poll/PollClient';
import XHttpBase from '../../../core/model/net/XHttpBase';
import AppService from '../../../services/AppService';
import PostInfoHelper from '../../../services/post/PostInfoHelper';
import { ActivityLogProps } from '../../../core/model/ModelConsts';
import PostServiceV2 from '../../../services/post/PostServiceV2';
import API from "../../../core/API";
import PostHelper from "../../../services/post/PostHelper";

const _CLSNAME = 'PostControllerV2';
const logger = gettrLogger(_CLSNAME);

export default class PostControllerV2 extends BaseController {

  static async PollVote(req, res, next) {
    const _api = 'PollVote';

    // Get API essential props
    const apiContext = res.locals.apiContext;
    const xRequest = res.locals.xRequest;

    try {
      // Get API params
      const content = XHttpBase.GetContent(xRequest, {});
      const postId = content.postId;
      const selections = content.selections || [];

      const userId = apiContext.getAuthenticatedUserId();
      const userInfo = apiContext.getUserInfo();
      const postInfo = await PostInfoHelper.GetPostInfo(postId);
      const pollClient = PollClient.CreatInstance(postInfo);

      // Check access
      // TODO: should we consider embedding access check in poll client?
      await AppService.CheckUserCanREAD(userInfo, postInfo, true);

      const result = await pollClient.vote(userId, selections);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      apiContext.setXError(err);
      REST.RespondError(res, err);
    }
  } // PollVote

  static async PollUnvote(req, res, next) {
    const _api = 'PollUnvote';

    // Get API essential props
    const apiContext = res.locals.apiContext;
    const xRequest = res.locals.xRequest;

    try {
      // Get API params
      const content = XHttpBase.GetContent(xRequest, {});
      const postId = content.postId;

      const userId = apiContext.getAuthenticatedUserId();
      const userInfo = apiContext.getUserInfo();
      const postInfo = await PostInfoHelper.GetPostInfo(postId);
      const pollClient = PollClient.CreatInstance(postInfo);

      // Check access
      // TODO: should we consider embedding access check in poll client?
      await AppService.CheckUserCanREAD(userInfo, postInfo, true);

      const result = await pollClient.unvote(userId);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      apiContext.setXError(err);
      REST.RespondError(res, err);
    }
  } // PollVote

  static async ChangePostText(req, res, next) {
    const _api = 'ChangePostText';
    const args = (req.query) ? req.query : req;
    const inclOptions = args[API.PARAM_INCL];

    // Get API essential props
    const apiContext = res.locals.apiContext;
    const xRequest = res.locals.xRequest;

    try {
      // Get API params
      const content = XHttpBase.GetContent(xRequest, {});
      const postId = content.postId;
      const text = content.text;

      // Change post text
      await PostServiceV2.ChangePostText(apiContext, postId, text);

      // Return latest post
      const result = await PostHelper.LoadPost(postId, inclOptions);
      REST.RespondOK(res, result);
    } catch (err) {
      logger.error('API failed.', { err, _api });
      apiContext.setXError(err);
      REST.RespondError(res, err);
    } finally {
      // Write activity log
      const actInfo = apiContext.getActInfo({});
      actInfo.action = ActivityLogProps.CHANGE_POST_TEXT;
      apiContext.setActInfo(actInfo);
      next();
    }
  }

  // --------------------- PRIVATE METHODS ---------------------

}

