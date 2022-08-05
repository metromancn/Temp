import postAPI from './PostController';
import gettrLogger from '../../../core/GettrLogger';

const systemLogger = gettrLogger('routes');

const routes = (app) => {
  systemLogger.info('Registering Routes: Post...');

  app.route('/s/post/:postId')
    .get(postAPI.s_get_post)
    .post(postAPI.s_submit_post)
    .delete(postAPI.delete_post);

  app.post('/s/post', postAPI.UploadImages, postAPI.s_submit_post);
  app.post('/u/post', postAPI.UploadImages, postAPI.u_sumbit_post);
  app.post('/u/repost', postAPI.UploadImages, postAPI.u_submit_repost);

  app.route('/u/post/:postId')
    .get(postAPI.u_get_post)
    .put(postAPI.view_post) // Added Feb 01 2022 release 3.3.0
    .post(postAPI.update_post) // Added July 29 2022 release 4.4.1
    .delete(postAPI.delete_post);

  // app.route('/embed/post/:id')
  //   .get(postAPI.get_embedded_post); //
  //
  // app.route('/thumbnail/post/:id')
  //   .get(postAPI.get_thumbnail_post); // externally visible endpoint (not impl)

  // app.route('/user/pub/images/post/:postId/:filename')
  //   .get(postAPI.get_post_image); // extenally visible endpoint

  // app.route('/user/pub/images/cmt/:commentId/:filename')
  //   .get(postAPI.get_comment_image); // externally visible endpoint

  app.route('/u/post/:postId/liked/')
    .get(postAPI.get_liked_post);

  app.route('/u/post/:postId/shared/')
    .get(postAPI.get_shared_post);

  app.route('/s/post/:postId/liked/:userId')
    .get(postAPI.get_status_liked_post);

  // app.route('/s/post/:postId/watched/')
  //   .get(postAPI.get_watched_post);
  //
  // app.route('/s/post/:postId/watched/:userId')
  //   .get(postAPI.get_status_watched_post);

  app.route('/s/post/:postId/stats/')
    .get(postAPI.get_post_stats);

  app.route('/u/post/:postId/stats/')
    .get(postAPI.get_post_stats);

  app.route('/u/posts/stats/')
    .post(postAPI.get_posts_stats);

  app.route('/u/hashtag/:tagname/posts')
    .get(postAPI.get_feed_by_phrase);

  // ------------- USER COMMENTS -----------------------------

  app.post('/u/post/:postId/comment', postAPI.UploadImages, postAPI.submit_post_comment);
  app.post('/u/comment/:commentId/comment', postAPI.UploadImages, postAPI.submit_comment_comment);

  app.route('/u/post/:postId/comments/')
    .get(postAPI.get_post_comments)
    .post(postAPI.get_post_comments);

  app.route('/u/comment/:commentId/comments/')
    .get(postAPI.get_comment_comments)
    .post(postAPI.get_comment_comments);

  app.route('/u/comment/:commentId')
    .get(postAPI.get_post_comment)
    .delete(postAPI.delete_post_comment);

  // for Web FE get_resource(ModelType.COMMENT)
  app.route('/u/cmt/:commentId')
    .get(postAPI.get_post_comment)
    .delete(postAPI.delete_post_comment);

  app.route('/s/comment/:commentId/stats/')
    .get(postAPI.get_comment_stats);

  app.route('/u/comment/:commentId/liked/')
    .get(postAPI.get_liked_comment);

  app.route('/u/comment/:commentId/shared/')
    .get(postAPI.get_shared_comment);

  app.route('/u/comment/:id/liked/:userId')
    .get(postAPI.get_status_liked_comment);      // inverse of /api/user/:userId/likes/rl/

  app.route('/u/comment/:id/watched/')
    .get(postAPI.get_watched_comment);

  app.route('/u/comment/:id/watched/:userId')
    .get(postAPI.get_status_watched_comment);      // inverse of /api/user/:userId/likes/rl/


  // ------------------------ SEARCH ---------------------------
  app.route('/u/posts/srch/choices') // search box
    .get(postAPI.suggest_choices);

  app.route('/u/posts/feed') // @deprecated as of 12/3/2020 checkin
    .get(postAPI.get_feed_by_phrase)
    .post(postAPI.get_feed_by_phrase);

  app.route('/u/posts/trends')
    .get(postAPI.get_feed_by_trends)
    .post(postAPI.get_feed_by_trends);

  // added Nov 6 2021
  app.route('/u/posts/livenow')
    .get(postAPI.get_live_now_feed);

  // added May 5 2022
  app.route('/u/posts/v2/livenow')
    .get(postAPI.get_live_now_feed2);
  app.route('/u/posts/v2/livenow/categories')
    .get(postAPI.get_live_now_categories);

  app.route('/u/posts/srch/phrase') // new for after 12/3/2020 use
    .get(postAPI.get_feed_by_phrase)
    .post(postAPI.get_feed_by_phrase);

  app.route('/u/users/srch/phrase')
    .get(postAPI.get_users_by_phrase)
    .post(postAPI.get_users_by_phrase);

  app.route('/u/posts/srch/version') // elasticsearch service version
    .get(postAPI.es_version);

  app.route('/u/post/live/:videoId') // get live and video stream url.  07/15/2021
    .get(postAPI.get_live_stream_url);

  app.route('/u/translate/post/:postId/target/:targetLang') // translate post. 08.24.2021
    .get(postAPI.translate_post);

  // app.route('/u/text/srch') // elasticsearch demo must encodeURI
  //   .get(postAPI.text_search);

  // added Nov 12 2021 - gVision
  app.route('/u/posts/recommend')
    .get(postAPI.recommend_posts);

  app.route('/u/report/reasons')
    .get(postAPI.report_reasons);
};

export default routes;
