import postV2 from './PostControllerV2';
import gettrLogger from '../../../core/GettrLogger';
import UserMiddleware from '../user/UserMiddleware';

const systemLogger = gettrLogger('routes');

const postRoutesV2 = (app) => {
  systemLogger.info('Registering Routes: Post V2...');

  app.route('/u/post/v2/vote')
    .post(
      UserMiddleware.GateCheckMiddleware(postV2.PollVote.name, true),
      UserMiddleware.RateLimitMiddleware,
      postV2.PollVote
    );

  app.route('/u/post/v2/unvote')
    .post(
      UserMiddleware.GateCheckMiddleware(postV2.PollUnvote.name, true),
      UserMiddleware.RateLimitMiddleware,
      postV2.PollUnvote
    );

  app.route('/u/post/v2/change_text')
    .post(
      UserMiddleware.GateCheckMiddleware(postV2.ChangePostText.name, true),
      postV2.ChangePostText,
      UserMiddleware.UserActivityLogMiddleware,
    );
};

export default postRoutesV2;
