var blogs = helpers.requireBase('api/v1/blogs');

describe('api.v1.blogs', function() {
  helpers.api.init();
  helpers.api.describeMethods(blogs, [
    {
      name: 'list',
      method: 'get',
      url: '/v1/blogs'
    },
    {
      name: 'get',
      method: 'get',
      url: '/v1/blogs/{id}',
      args: [ 'id' ]
    },
    {
      name: 'create',
      method: 'post',
      url: '/v1/blogs'
    },
    {
      name: 'delete',
      method: 'delete',
      url: '/v1/blogs/{id}',
      args: [ 'id' ]
    },
    {
      name: 'listPosts',
      method: 'get',
      url: '/v1/blogs/{blog_id}/posts',
      args: [ 'blog_id' ]
    },
    {
      name: 'getPost',
      method: 'get',
      url: '/v1/blogs/{blog_id}/posts/{post_id}',
      args: [ 'blog_id', 'post_id' ]
    }
  ]);
});
