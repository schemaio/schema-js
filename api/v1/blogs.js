var resource = require('./resource');

module.exports = resource.defineModel('blogs', {
  listPosts: [
    'get', '/blogs/{blog_id}/posts', [ 'blog_id' ], {
      scope: {
        posts: ['list']
      }
    }
  ],
  getPost: [
    'get', '/blogs/{blog_id}/posts/{post_id}', [ 'blog_id', 'post_id' ], {
      scope: {
        posts: ['get']
      }
    }
  ]
}, {
  relations: {
    posts: true
  }
});
