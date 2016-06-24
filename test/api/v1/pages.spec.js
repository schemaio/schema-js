var pages = helpers.requireBase('api/v1/pages');

describe('api.v1.pages', function() {
  helpers.api.init();
  helpers.api.describeMethods(pages, [
    {
      name: 'list',
      method: 'get',
      url: '/v1/pages'
    },
    {
      name: 'get',
      method: 'get',
      url: '/v1/pages/{id}',
      args: [ 'id' ]
    },
    {
      name: 'create',
      method: 'post',
      url: '/v1/pages'
    },
    {
      name: 'delete',
      method: 'delete',
      url: '/v1/pages/{id}',
      args: [ 'id' ]
    },
    {
      name: 'listArticles',
      method: 'get',
      url: '/v1/pages/{page_id}/articles',
      args: [ 'page_id' ]
    },
    {
      name: 'getArticle',
      method: 'get',
      url: '/v1/pages/{page_id}/articles/{article_id}',
      args: [ 'page_id', 'article_id' ]
    }
  ]);
});
